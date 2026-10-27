(function (global) {
  "use strict";

  const ENDPOINT = "https://script.google.com/macros/s/AKfycbzVf1fuxcq8GPSOzS8WvcAtubqaawFj0rbVjxe0LOLKfwbYkRZf7Vs61Q0T73UG6dznww/exec";
  const CACHE_KEY = "ava:platform:homepage-cloud-lkg";
  const DEFAULT_TIMEOUT_MS = 8000;
  const FIRST_RUN_RETRY_DELAY_MS = 350;
  const FIRST_RUN_MAX_ATTEMPTS = 3;
  const SESSION_KEY = global.AVAAdminAuth?.SESSION_KEY || "ava:platform:admin-session";
  let firstRunPromise = null;

  function cloudError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    Object.assign(error, details);
    return error;
  }

  function booleanValue(value, fallback) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      if (["true", "yes", "1"].includes(value.trim().toLowerCase())) return true;
      if (["false", "no", "0"].includes(value.trim().toLowerCase())) return false;
    }
    return fallback;
  }

  function settingsObject(value) {
    if (Array.isArray(value)) return Object.fromEntries(value.filter(row => row && typeof row.key === "string").map(row => [row.key, row.value]));
    return value && typeof value === "object" ? value : {};
  }

  function parseResponse(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw cloudError("INVALID_SCHEMA", "Cloud response must be an object");
    if (payload.success !== true) throw cloudError("CLOUD_REJECTED", String(payload.error || "Cloud rejected the request"));
    const root = payload.data && typeof payload.data === "object" ? payload.data : payload.config && typeof payload.config === "object" ? payload.config : payload;
    const rawCards = root.cards ?? root.homepage_cards ?? root.homepageCards;
    if (!Array.isArray(rawCards)) throw cloudError("INVALID_SCHEMA", "Cloud response has no cards array");
    const settings = settingsObject(root.settings ?? root.homepage_settings ?? root.homepageSettings);
    const rawRows = JSON.parse(JSON.stringify(rawCards));
    const ids = new Set(), keys = new Set();
    rawRows.forEach(row => { if(!row.id || ids.has(String(row.id)) || (row.module_key && keys.has(String(row.module_key)))) throw cloudError("IDENTITY_CONFLICT", "Duplicate or missing App/card identity"); ids.add(String(row.id)); if(row.module_key) keys.add(String(row.module_key)); });
    const registrations = rawRows.filter(row=>row.registration_json).map(row=>{const app={...JSON.parse(row.registration_json),name:String(row.title||""),displayNameZh:String(row.title||"")};if(app.id!==row.module_key)throw cloudError("IDENTITY_CONFLICT","Registration/module key mismatch");return app});
    let categories = settings.workspace_categories ? JSON.parse(settings.workspace_categories) : null;
    if(categories && (!Array.isArray(categories)||categories.length>9||new Set(categories.map(c=>c.id)).size!==categories.length||categories.some(c=>!/^area-[1-9]$/.test(c.id)||!String(c.title||"").trim()||!Number.isFinite(c.order)||typeof c.enabled!=="boolean"))) throw cloudError("INVALID_SCHEMA","Invalid official categories");
    const cards = rawCards.map((card, index) => {
      if (!card || typeof card !== "object") return null;
      const moduleKey = String(card.module_key ?? card.moduleKey ?? "").trim();
      const id = String(card.id ?? moduleKey).trim();
      if (!id) return null;
      const parsedOrder = Number(card.default_order ?? card.defaultOrder ?? index);
      return {
        id,
        enabled: booleanValue(card.enabled, true),
        moduleKey,
        type: String(card.type ?? "app").slice(0, 30),
        title: String(card.title ?? "").slice(0, 100),
        subtitle: String(card.subtitle ?? "").slice(0, 500),
        emoji: String(card.emoji ?? "").slice(0, 8),
        category: String(card.category ?? "").slice(0, 60),
        url: String(card.url ?? "").trim(),
        defaultVisible: booleanValue(card.default_visible ?? card.defaultVisible, true),
        order: Number.isFinite(parsedOrder) ? parsedOrder : index,
        defaultArea: /^area-[1-9]$/.test(card.default_area ?? card.defaultArea) ? (card.default_area ?? card.defaultArea) : "area-1"
      };
    }).filter(Boolean);
    const version = settings.homepage_version ?? root.version ?? payload.version;
    if (typeof version !== "string" && typeof version !== "number") throw cloudError("INVALID_SCHEMA", "Cloud response has no valid version");
    const result = {
      version: String(version),
      rawRows, registrations, categories, rawSettings: settings,
      settings: {
        personalCardsEnabled: booleanValue(settings.personal_cards_enabled, true),
        searchEnabled: booleanValue(settings.search_enabled, true)
      },
      cards
    };
    return result;
  }

  function reconcile(cloud, bundled, registry) {
    const mergedRegistry = mergeRegistry(registry, cloud.registrations || []);
    const modules = new Map(mergedRegistry.map(module => [module.id, module]));
    const warnings = [];
    const items = cloud.cards.map(card => {
      const module = modules.get(card.moduleKey);
      if (card.moduleKey && !module) throw cloudError("IDENTITY_CONFLICT",`Unmapped existing module_key: ${card.moduleKey}`);
      if (module && card.url && ![module.entry, ...Object.values(module.entryModes || {})].includes(card.url)) warnings.push(`Cloud URL ignored for ${card.moduleKey}; Production Registry routing retained`);
      return {
        id: module?.id || card.id,
        sheetId: card.id,
        enabled: card.enabled,
        moduleKey: module?.id || "",
        defaultVisible: card.enabled !== false && card.defaultVisible,
        order: card.order,
        title: card.title || module?.name || "Untitled",
        subtitle: card.subtitle || module?.description || "",
        emoji: card.emoji,
        category: card.category || module?.category || "",
        areaId: card.defaultArea
      };
    }).filter(Boolean);
    return {
      config: { version: cloud.version, layout: bundled.layout, settings: cloud.settings, items, registrations: cloud.registrations || [], categories: cloud.categories || null, rawRows: cloud.rawRows, rawSettings: cloud.rawSettings },
      warnings,
      empty: false
    };
  }

  function reconcileCached(cloud,bundled,registry) {
    try { return reconcile(cloud,bundled,registry); }
    catch(error) { return {config:null,empty:true,error,warnings:[error.message]}; }
  }
  function readCache(storage) {
    try { return parseResponse(JSON.parse(storage.getItem(CACHE_KEY))); }
    catch (error) { return null; }
  }

  async function load(options) {
    const { storage, bundled, registry, fetchImpl = global.fetch, timeoutMs = DEFAULT_TIMEOUT_MS, requireCloud = false } = options;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = setTimeout(() => controller?.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${ENDPOINT}?action=getHomepageConfig`, { signal: controller?.signal, cache: "no-store" });
      if (!response.ok) throw cloudError("HTTP_ERROR", `Cloud HTTP ${response.status}`, { status: response.status });
      let payload;
      try { payload = await response.json(); }
      catch (error) { throw cloudError("INVALID_JSON", "Cloud response was not valid JSON", { cause: error }); }
      const parsed = parseResponse(payload);
      const resolved = reconcile(parsed, bundled, registry);
      try { storage.setItem(CACHE_KEY, JSON.stringify(payload)); }
      catch (error) { throw cloudError("CACHE_PERSIST_ERROR", "Could not persist Official baseline", { cause: error }); }
      return { config: resolved.config, source: "cloud", warnings: resolved.warnings };
    } catch (error) {
      if (controller?.signal.aborted || error?.name === "AbortError") error = cloudError("TIMEOUT", "Official Cloud request timed out", { cause: error });
      else if (!error.code || (typeof error.code === "number" && error.name === "TypeError")) error = cloudError("NETWORK_ERROR", error.message || "Official Cloud request failed", { cause: error });
      if (requireCloud) return { config: null, source: "error", error, code: error.code, warnings: [] };
      const cached = readCache(storage);
      if (cached) {
        const resolved = reconcileCached(cached, bundled, registry);
        if (!resolved.empty) return { config: resolved.config, source: "cache", error, code: error.code, warnings: resolved.warnings };
      }
      return { config: bundled, source: "bundled", error, code: error.code, warnings: [] };
    } finally { clearTimeout(timer); }
  }

  function isTransientFirstRunFailure(result) {
    return ["NETWORK_ERROR", "TIMEOUT", "INVALID_JSON"].includes(result.code) ||
      // The deployed GAS Web App can return a short-lived 404 after idle, then
      // serve the same GET successfully on the next sequential request.
      (result.code === "HTTP_ERROR" && ([404, 408, 429].includes(result.error?.status) || result.error?.status >= 500));
  }

  function loadFirstRun(options) {
    if (firstRunPromise) return firstRunPromise;
    firstRunPromise = (async () => {
      let result = null;
      for (let attempt = 1; attempt <= FIRST_RUN_MAX_ATTEMPTS; attempt += 1) {
        const startedAt = Date.now();
        result = await load({ ...options, requireCloud: true });
        try { options.onAttempt?.({ attempt, code: result.code || "OK", status: result.error?.status || 200, source: result.source, durationMs: Date.now() - startedAt }); } catch (_) { /* diagnostics must never block initialization */ }
        if (result.config && result.source === "cloud") return result;
        if (!isTransientFirstRunFailure(result) || attempt === FIRST_RUN_MAX_ATTEMPTS) return result;
        await new Promise(resolve => setTimeout(resolve, FIRST_RUN_RETRY_DELAY_MS * attempt));
      }
      return result;
    })().finally(() => { firstRunPromise = null; });
    return firstRunPromise;
  }

  async function authenticate(password, fetchImpl = global.fetch) {
    if (global.AVAAdminAuth) return global.AVAAdminAuth.authenticate(password, fetchImpl, sessionStorage);
    const response = await fetchImpl(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "authenticateAdmin", password }) });
    const payload = await response.json();
    if (!response.ok || payload.success !== true || !payload.sessionToken) throw new Error(payload.error || "Authentication failed");
    sessionStorage.setItem(SESSION_KEY, payload.sessionToken);
    return payload;
  }

  function canonicalData(value) { return JSON.stringify(value,(_key,item)=>item && typeof item==="object" && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])) : item); }
  function routingIdentity(app) {
    return JSON.stringify([app.id,app.moduleId,app.entry,app.entryModes,app.capabilities,app.roleVisibility,app.adminLaunchContract||""]);
  }
  function validateRegistration(app) {
    if(!app || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(app.id) || app.moduleId!==app.id || !String(app.name||"").trim()) throw new Error("Invalid App identity/name");
    const entry=new URL(app.entry);
    if(entry.protocol!=="https:" || entry.username || entry.password || entry.search || entry.hash) throw new Error("Invalid official deployment URL");
    for(const mode of ["frontend","user","admin"]){
      if(typeof app.capabilities?.[mode]!=="boolean" || typeof app.roleVisibility?.[mode]!=="boolean") throw new Error("Explicit capabilities required");
      if(app.capabilities[mode]){const target=new URL(app.entryModes?.[mode]);if(target.origin!==entry.origin||target.pathname!==entry.pathname||target.search!==`?avaEntry=${mode}`||target.hash)throw new Error("Invalid canonical route");}
    }
    if(!app.capabilities.frontend)throw new Error("Front entry required");
    return app;
  }
  function mergeRegistry(bundled, registrations) {
    const map=new Map(bundled.map(app=>[app.id,app])),seen=new Set();
    for(const app of registrations){validateRegistration(app);if(seen.has(app.id))throw new Error("Duplicate registration");seen.add(app.id);const current=map.get(app.id);if(current&&routingIdentity(current)!==routingIdentity(app))throw new Error(`Immutable registration conflict: ${app.id}`);map.set(app.id,Object.freeze({...current,...app}));}
    return Object.freeze([...map.values()]);
  }
  function mutationId(){return global.crypto?.randomUUID?.() || `request-${Date.now()}-${Math.random().toString(36).slice(2)}`}
  function cardsForWrite(config){
    return (config.items||[]).map(card=>{
      const original=config.rawRows?.find(row=>row.id===(card.sheetId||card.id));
      return {...original,id:card.sheetId||card.id,type:original?.type||card.type||"app",title:card.title,subtitle:card.subtitle,emoji:card.emoji,module_key:original?.module_key??card.moduleKey??"",url:original?.url??card.url??"",category:card.category||"",default_visible:card.defaultVisible!==false,default_order:card.order,default_area:card.areaId||"area-1",enabled:card.enabled!==false};
    });
  }
  async function verifiedWrite(body,config,fetchImpl=global.fetch){
    const sessionToken=global.AVAAdminAuth?.sessionToken()||sessionStorage.getItem(SESSION_KEY);
    if(!sessionToken)throw new Error("Admin authentication required");
    if(!config.version||!Array.isArray(config.rawRows))throw new Error("Reload confirmed Official data before saving");
    const response=await fetchImpl(ENDPOINT,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({...body,sessionToken,expectedRevision:config.version})});
    const payload=await response.json();
    if(!response.ok||payload.success!==true||payload.persisted!==true||payload.readAfterWrite!==true||payload.requestId!==body.requestId||!payload.version||!payload.data)throw new Error(payload.error||"Persistence confirmation missing");
    const parsed=parseResponse({success:true,data:payload.data});
    if(parsed.version!==String(payload.version))throw new Error("Read-after-write revision mismatch");
    if(body.cards){const actual=new Map(parsed.rawRows.map(row=>[row.id,row]));for(const card of body.cards){const row=actual.get(card.id);if(!row||Object.keys(card).some(key=>!["updated_at","registration_json"].includes(key)&&String(row[key]??"")!==String(card[key]??"")))throw new Error("Read-after-write card mismatch");}}
    if(body.registration){const actual=parsed.registrations.find(app=>app.id===body.registration.id);if(!actual||canonicalData(actual)!==canonicalData(body.registration))throw new Error("Read-after-write registration mismatch");}
    return payload;
  }
  async function writeOfficial(config,fetchImpl=global.fetch){
    // Draft request identity is retained for an uncertain network response retry.
    const fingerprint=JSON.stringify([cardsForWrite(config),config.settings,config.categories]);
    if(config.pendingFingerprint!==fingerprint){config.pendingFingerprint=fingerprint;config.pendingRequestId=mutationId();}
    const result=await verifiedWrite({action:"saveHomepageConfig",requestId:config.pendingRequestId,cards:cardsForWrite(config),settings:config.settings||{},categories:config.categories},config,fetchImpl);
    delete config.pendingRequestId;delete config.pendingFingerprint;return result;
  }
  async function upsertRegistration(registration,config,fetchImpl=global.fetch){
    validateRegistration(registration);
    const key=JSON.stringify(registration);
    if(config.registrationDraftKey!==key){config.registrationDraftKey=key;config.registrationRequestId=mutationId();}
    return verifiedWrite({action:"upsertAppRegistration",registration,requestId:config.registrationRequestId},config,fetchImpl);
  }

  async function readNotifications(fetchImpl = global.fetch) {
    const response = await fetchImpl(`${ENDPOINT}?action=getNotifications`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || payload.success !== true) throw new Error(payload.error || "Notification feed unavailable");
    return global.AVANotifications.parseFeed(payload.data?.notifications || payload.notifications || []);
  }

  async function writeNotifications(notifications, fetchImpl = global.fetch) {
    const sessionToken = global.AVAAdminAuth?.sessionToken() || sessionStorage.getItem(SESSION_KEY);
    if (!sessionToken) throw new Error("Admin authentication required");
    const response = await fetchImpl(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "saveNotifications", sessionToken, notifications }) });
    const payload = await response.json();
    if (!response.ok || payload.success !== true) throw new Error(payload.error || "Notification publish failed");
    return payload;
  }

  global.AVAHomepageCloud = Object.freeze({ ENDPOINT, CACHE_KEY, SESSION_KEY, DEFAULT_TIMEOUT_MS, FIRST_RUN_RETRY_DELAY_MS, FIRST_RUN_MAX_ATTEMPTS, parseResponse, reconcile, reconcileCached, readCache, load, loadFirstRun, authenticate, mergeRegistry, validateRegistration, routingIdentity, cardsForWrite, upsertRegistration, writeOfficial, readNotifications, writeNotifications });
})(typeof window === "undefined" ? globalThis : window);

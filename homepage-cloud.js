(function (global) {
  "use strict";

  const ENDPOINT = "https://script.google.com/macros/s/AKfycby6yGVi9pB3fLGzT9-pYOaFKZ8vi8aSzxxIkWezkCF1uh1trAhTdR2bG1zbKlsnIq1a/exec";
  const CACHE_KEY = "ava:platform:homepage-cloud-lkg";
  const DEFAULT_TIMEOUT_MS = 8000;
  const SESSION_KEY = "ava:platform:studio-session";

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
    if (!rawCards.length) throw cloudError("INVALID_SCHEMA", "Cloud response has no usable Official cards");
    const settings = settingsObject(root.settings ?? root.homepage_settings ?? root.homepageSettings);
    const cards = rawCards.map((card, index) => {
      if (!card || typeof card !== "object") return null;
      const moduleKey = String(card.module_key ?? card.moduleKey ?? "").trim();
      const id = String(card.id ?? moduleKey).trim();
      if (!id || !booleanValue(card.enabled, true)) return null;
      const parsedOrder = Number(card.default_order ?? card.defaultOrder ?? index);
      return {
        id,
        moduleKey,
        type: String(card.type ?? "app").slice(0, 30),
        title: String(card.title ?? "").slice(0, 100),
        subtitle: String(card.subtitle ?? "").slice(0, 500),
        emoji: String(card.emoji ?? "").slice(0, 8),
        category: String(card.category ?? "").slice(0, 60),
        url: String(card.url ?? "").trim(),
        defaultVisible: booleanValue(card.default_visible ?? card.defaultVisible, true),
        order: Number.isFinite(parsedOrder) ? parsedOrder : index,
        defaultArea: ["area-1", "area-2", "area-3"].includes(card.default_area ?? card.defaultArea) ? (card.default_area ?? card.defaultArea) : "area-1"
      };
    }).filter(Boolean);
    const version = settings.homepage_version ?? root.version ?? payload.version;
    if (typeof version !== "string" && typeof version !== "number") throw cloudError("INVALID_SCHEMA", "Cloud response has no valid version");
    const result = {
      version: String(version),
      settings: {
        personalCardsEnabled: booleanValue(settings.personal_cards_enabled, true),
        searchEnabled: booleanValue(settings.search_enabled, true)
      },
      cards
    };
    if (!result.cards.length) throw cloudError("INVALID_SCHEMA", "Cloud response has no usable Official cards");
    return result;
  }

  function reconcile(cloud, bundled, registry) {
    const modules = new Map(registry.map(module => [module.id, module]));
    const warnings = [];
    const items = cloud.cards.map(card => {
      const module = modules.get(card.moduleKey);
      if (card.moduleKey && !module) { warnings.push(`Unknown cloud module_key ignored: ${card.moduleKey}`); return null; }
      if (module && card.url && ![module.entry, ...Object.values(module.entryModes || {})].includes(card.url)) warnings.push(`Cloud URL ignored for ${card.moduleKey}; Production Registry routing retained`);
      return {
        id: module?.id || card.id,
        moduleKey: module?.id || "",
        defaultVisible: card.defaultVisible,
        order: card.order,
        title: card.title || module?.name || "Untitled",
        subtitle: card.subtitle || module?.description || "",
        emoji: card.emoji,
        category: card.category || module?.category || "",
        areaId: card.defaultArea
      };
    }).filter(Boolean);
    return {
      config: items.length ? { version: cloud.version, layout: bundled.layout, settings: cloud.settings, items } : bundled,
      warnings,
      empty: !items.some(item => Boolean(item.moduleKey))
    };
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
      if (resolved.empty) throw cloudError("INVALID_SCHEMA", "Cloud response has no usable Official cards");
      try { storage.setItem(CACHE_KEY, JSON.stringify(payload)); }
      catch (error) { throw cloudError("CACHE_PERSIST_ERROR", "Could not persist Official baseline", { cause: error }); }
      return { config: resolved.config, source: "cloud", warnings: resolved.warnings };
    } catch (error) {
      if (!error.code) error = controller?.signal.aborted ? cloudError("TIMEOUT", "Official Cloud request timed out", { cause: error }) : cloudError("NETWORK_ERROR", error.message || "Official Cloud request failed", { cause: error });
      if (requireCloud) return { config: null, source: "error", error, code: error.code, warnings: [] };
      const cached = readCache(storage);
      if (cached) {
        const resolved = reconcile(cached, bundled, registry);
        if (!resolved.empty) return { config: resolved.config, source: "cache", error, code: error.code, warnings: resolved.warnings };
      }
      return { config: bundled, source: "bundled", error, code: error.code, warnings: [] };
    } finally { clearTimeout(timer); }
  }

  async function authenticate(password, fetchImpl = global.fetch) {
    const response = await fetchImpl(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "authenticateAdmin", password }) });
    const payload = await response.json();
    if (!response.ok || payload.success !== true || !payload.sessionToken) throw new Error(payload.error || "Authentication failed");
    sessionStorage.setItem(SESSION_KEY, payload.sessionToken);
    return payload;
  }

  async function writeOfficial(config, fetchImpl = global.fetch) {
    const sessionToken = sessionStorage.getItem(SESSION_KEY);
    if (!sessionToken) throw new Error("Admin authentication required");
    const cards = (config.items || []).map(card => ({ id: card.id, type: card.type || "app", title: card.title, subtitle: card.subtitle, emoji: card.emoji, module_key: card.moduleKey || "", url: card.url || "", category: card.category || "", default_visible: card.defaultVisible !== false, default_order: card.order, default_area: card.areaId || "area-1", enabled: card.enabled !== false }));
    const response = await fetchImpl(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "saveHomepageConfig", sessionToken, cards, settings: config.settings || {} }) });
    const payload = await response.json();
    if (!response.ok || payload.success !== true) throw new Error(payload.error || "Cloud sync failed");
    return payload;
  }

  global.AVAHomepageCloud = Object.freeze({ ENDPOINT, CACHE_KEY, SESSION_KEY, DEFAULT_TIMEOUT_MS, parseResponse, reconcile, readCache, load, authenticate, writeOfficial });
})(typeof window === "undefined" ? globalThis : window);

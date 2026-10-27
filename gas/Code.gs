/** AVA Homepage Cloud — deploy as the existing Web App. Configure ADMIN_PASSWORD_HASH and SESSION_SECRET in Script Properties. */
const CARD_SHEET = "homepage_cards";
const SETTINGS_SHEET = "homepage_settings";
const NOTIFICATION_SHEET = "update_notifications";
const CARD_HEADERS = ["id","type","title","subtitle","emoji","module_key","url","category","default_visible","default_order","enabled","updated_at","default_area"];
const NOTIFICATION_HEADERS = ["notification_id","type","app_id","title","summary","version","published_at","active","show_popup","action_type","sort_order"];

function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) {
  const action = String(e.parameter.action || "");
  if (action === "health") return json_({ success: true, service: "AVA Platform Cloud", status: "ok" });
  if (action === "getHomepageConfig") return json_({ success: true, data: readConfig_() });
  if (action === "getNotifications") return json_({ success: true, data: { notifications: readNotifications_() } });
  return json_({ success: false, error: "Unsupported action" });
}
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body.action === "authenticateAdmin") return json_(authenticate_(body.password));
    if (body.action === "logoutAdmin") return json_(logout_(body.sessionToken));
    // Temporary migration compatibility. Legacy Apps must migrate to the
    // browser-bound ava-admin-session-v1 contract before these routes are removed.
    if (body.action === "issueAppLaunch") return json_(issueAppLaunch_(body.sessionToken, body.appId));
    if (body.action === "exchangeAppLaunch") return json_(exchangeAppLaunch_(body.launchTicket, body.appId));
    if (body.action === "verifyAppGrant") return json_(verifyAppGrant_(body.appGrant, body.appId, body.operation));
    if (body.action === "issueAdminSession") return json_(issueAdminSession_(body.sessionToken, body.appId));
    if (body.action === "requestAdminBrowserProof") return json_(requestAdminBrowserProof_(body.sessionToken, body.launchTicket, body.appId, body.launchNonce));
    if (body.action === "exchangeAdminSession") return json_(exchangeAdminSession_(body.launchTicket, body.appId, body.browserProof, body.launchNonce));
    if (body.action === "verifyAdminSession") return json_(verifyAdminSession_(body.adminSessionProof, body.appId, body.operation));
    if (body.action === "upsertAppRegistration") { verifySession_(body.sessionToken); return json_(mutateHomepage_(body)); }
    if (body.action === "saveHomepageConfig" || body.action === "saveWorkspaceConfig") { verifySession_(body.sessionToken); return json_(saveConfig_(body)); }
    if (body.action === "saveNotifications") { verifySession_(body.sessionToken); return json_(saveNotifications_(body)); }
    return json_({ success: false, error: "Unsupported action" });
  } catch (error) { return json_({ success: false, error: error.message }); }
}
function digest_(value) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value).map(byte => (byte + 256).toString(16).slice(-2)).join(""); }
function authenticate_(password) {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("ADMIN_PASSWORD_HASH") || digest_(String(password || "")) !== props.getProperty("ADMIN_PASSWORD_HASH")) throw new Error("Invalid credentials");
  const expiry = Date.now() + 30 * 60 * 1000, nonce = Utilities.getUuid();
  const data = `${expiry}.${nonce}`, signature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(data, props.getProperty("SESSION_SECRET")));
  props.setProperty(`AVA_ADMIN_SESSION_${nonce}`, String(expiry));
  return { success: true, sessionToken: `${data}.${signature}`, expiresAt: new Date(expiry).toISOString() };
}
function verifySession_(token) {
  const parts = String(token || "").split("."), props = PropertiesService.getScriptProperties(), sessionKey = `AVA_ADMIN_SESSION_${parts[1]}`; if (parts.length !== 3 || Number(parts[0]) <= Date.now()) { if (parts.length === 3) props.deleteProperty(sessionKey); throw new Error("Admin session expired"); }
  if (props.getProperty(sessionKey) !== String(parts[0])) throw new Error("Admin session is not active");
  const expected = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(`${parts[0]}.${parts[1]}`, props.getProperty("SESSION_SECRET")));
  if (expected !== parts[2]) throw new Error("Unauthorized");
  return { expiry: Number(parts[0]), nonce: parts[1] };
}
function logout_(token) { const session = verifySession_(token), props = PropertiesService.getScriptProperties(); props.deleteProperty(`AVA_ADMIN_SESSION_${session.nonce}`); return { success: true }; }
function issueAdminSession_(token, appId) {
  const session = verifySession_(token), registry = platformAdminApps_(); if (!registry.includes(String(appId))) throw new Error("App Admin capability is not registered");
  const expiry = Math.min(session.expiry, Date.now() + 2 * 60 * 1000), ticket = Utilities.getUuid(), launchNonce = Utilities.getUuid(), props = PropertiesService.getScriptProperties();
  props.setProperty(`AVA_ADMIN_LAUNCH_${ticket}`, JSON.stringify({ appId: String(appId), launchNonce, sessionNonce: session.nonce, sessionExpiry: Number(props.getProperty(`AVA_ADMIN_SESSION_${session.nonce}`)), expiresAt: expiry }));
  return { success: true, launchTicket: ticket, launchNonce, expiresAt: new Date(expiry).toISOString(), contract: "ava-admin-session-v1" };
}
function issueAppLaunch_(token, appId) {
  const session = verifySession_(token), registry = platformAdminApps_();
  if (!registry.includes(String(appId))) throw new Error("App Admin capability is not registered");
  const expiry = Math.min(session.expiry, Date.now() + 2 * 60 * 1000), ticket = Utilities.getUuid(), props = PropertiesService.getScriptProperties();
  props.setProperty(`AVA_ADMIN_LAUNCH_${ticket}`, JSON.stringify({ appId: String(appId), sessionNonce: session.nonce, sessionExpiry: Number(props.getProperty(`AVA_ADMIN_SESSION_${session.nonce}`)), expiresAt: expiry, legacy: true }));
  return { success: true, launchTicket: ticket, expiresAt: new Date(expiry).toISOString(), contract: "ava-legacy-app-grant-v1" };
}
function requestAdminBrowserProof_(token, ticket, appId, launchNonce) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const session = verifySession_(token), props = PropertiesService.getScriptProperties(), key = `AVA_ADMIN_LAUNCH_${String(ticket || "")}`, raw = props.getProperty(key); if (!raw) throw new Error("Invalid or expired Admin launch");
    const launch = JSON.parse(raw); if (launch.legacy || launch.appId !== String(appId) || launch.launchNonce !== String(launchNonce || "") || launch.expiresAt <= Date.now() || launch.sessionNonce !== session.nonce) { if (launch.legacy || launch.expiresAt <= Date.now()) props.deleteProperty(key); throw new Error("Invalid or expired Admin launch"); }
    const browserProof = launch.browserProof || Utilities.getUuid();
    if (!launch.browserProof) { launch.browserProof = browserProof; props.setProperty(key, JSON.stringify(launch)); }
    props.setProperty(`AVA_ADMIN_BROWSER_PROOF_${browserProof}`, JSON.stringify({ ticket: String(ticket), appId: launch.appId, launchNonce: launch.launchNonce, sessionNonce: launch.sessionNonce, sessionExpiry: launch.sessionExpiry, expiresAt: launch.expiresAt }));
    return { success: true, appId: launch.appId, browserProof, expiresAt: new Date(launch.expiresAt).toISOString(), contract: "ava-admin-session-v1" };
  } finally { lock.releaseLock(); }
}
function exchangeAdminSession_(ticket, appId, browserProof, launchNonce) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties(), key = `AVA_ADMIN_LAUNCH_${String(ticket || "")}`, raw = props.getProperty(key), proofKey = `AVA_ADMIN_BROWSER_PROOF_${String(browserProof || "")}`, proofRaw = props.getProperty(proofKey); if (!raw) throw new Error("Invalid or expired Admin launch"); if (!proofRaw) { let launchOnly; try { launchOnly = JSON.parse(raw); } catch (_) { launchOnly = null; } if (launchOnly && launchOnly.expiresAt <= Date.now()) props.deleteProperty(key); throw new Error("Invalid or expired Admin launch"); }
    const launch = JSON.parse(raw), browserRecord = JSON.parse(proofRaw); if (launch.legacy || launch.appId !== String(appId) || launch.launchNonce !== String(launchNonce || "") || launch.expiresAt <= Date.now() || browserRecord.ticket !== String(ticket) || browserRecord.appId !== String(appId) || browserRecord.launchNonce !== launch.launchNonce || browserRecord.expiresAt <= Date.now()) { if (launch.expiresAt <= Date.now() || browserRecord.expiresAt <= Date.now()) { props.deleteProperty(key); props.deleteProperty(proofKey); } throw new Error("Invalid or expired Admin launch"); }
    const sessionKey = `AVA_ADMIN_SESSION_${launch.sessionNonce}`;
    if (Number(launch.sessionExpiry) <= Date.now() || props.getProperty(sessionKey) !== String(launch.sessionExpiry)) { props.deleteProperty(key); props.deleteProperty(proofKey); if (Number(launch.sessionExpiry) <= Date.now()) props.deleteProperty(sessionKey); throw new Error("Admin session is not active"); }
    props.deleteProperty(key);
    const expiry = Number(launch.sessionExpiry), data = JSON.stringify({ appId: launch.appId, sessionNonce: launch.sessionNonce, sessionExpiry: expiry, expiresAt: expiry });
    const proof = Utilities.base64EncodeWebSafe(data) + "." + Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(data, props.getProperty("SESSION_SECRET")));
    props.deleteProperty(proofKey);
    return { success: true, appId: launch.appId, adminSessionProof: proof, expiresAt: new Date(expiry).toISOString(), contract: "ava-admin-session-v1" };
  } finally { lock.releaseLock(); }
}
function exchangeAppLaunch_(ticket, appId) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties(), key = `AVA_ADMIN_LAUNCH_${String(ticket || "")}`, raw = props.getProperty(key); if (!raw) throw new Error("Invalid or expired Admin launch");
    const launch = JSON.parse(raw); if (!launch.legacy || launch.appId !== String(appId) || launch.expiresAt <= Date.now()) { if (launch.expiresAt <= Date.now()) props.deleteProperty(key); throw new Error("Invalid or expired Admin launch"); }
    const sessionKey = `AVA_ADMIN_SESSION_${launch.sessionNonce}`;
    if (Number(launch.sessionExpiry) <= Date.now() || props.getProperty(sessionKey) !== String(launch.sessionExpiry)) { props.deleteProperty(key); if (Number(launch.sessionExpiry) <= Date.now()) props.deleteProperty(sessionKey); throw new Error("Admin session is not active"); }
    props.deleteProperty(key);
    const grant = Utilities.getUuid(), expiry = Number(launch.sessionExpiry);
    props.setProperty(`AVA_ADMIN_GRANT_${grant}`, JSON.stringify({ appId: launch.appId, sessionNonce: launch.sessionNonce, sessionExpiry: launch.sessionExpiry, expiresAt: expiry, legacy: true }));
    return { success: true, appId: launch.appId, appGrant: grant, expiresAt: new Date(expiry).toISOString(), contract: "ava-legacy-app-grant-v1" };
  } finally { lock.releaseLock(); }
}
function verifyAppGrant_(grant, appId, operation) {
  const props = PropertiesService.getScriptProperties(), key = `AVA_ADMIN_GRANT_${String(grant || "")}`, raw = props.getProperty(key); if (!raw) throw new Error("Invalid or expired App Admin authorization");
  const value = JSON.parse(raw); if (!value.legacy || value.appId !== String(appId) || value.expiresAt <= Date.now()) { props.deleteProperty(key); throw new Error("Invalid or expired App Admin authorization"); }
  if (props.getProperty(`AVA_ADMIN_SESSION_${value.sessionNonce}`) !== String(value.sessionExpiry)) { props.deleteProperty(key); throw new Error("Admin session is not active"); }
  return { success: true, appId: value.appId, operation: String(operation || "official-write"), expiresAt: new Date(value.expiresAt).toISOString(), contract: "ava-legacy-app-grant-v1" };
}
function verifyAdminSession_(proof, appId, operation) {
  const props = PropertiesService.getScriptProperties(), parts = String(proof || "").split("."), invalid = () => { throw new Error("Invalid or expired AVA Admin session"); };
  if (parts.length !== 2) invalid();
  let value, data; try { data = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString(); value = JSON.parse(data); } catch (_) { invalid(); }
  const expected = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(data, props.getProperty("SESSION_SECRET")));
  if (expected !== parts[1] || value.appId !== String(appId) || Number(value.expiresAt) <= Date.now()) invalid();
  if (props.getProperty(`AVA_ADMIN_SESSION_${value.sessionNonce}`) !== String(value.sessionExpiry)) throw new Error("Admin session is not active");
  return { success: true, appId: value.appId, operation: String(operation || "official-write"), expiresAt: new Date(value.expiresAt).toISOString(), contract: "ava-admin-session-v1" };
}
function platformAdminApps_() { return String(PropertiesService.getScriptProperties().getProperty("AVA_ADMIN_APP_IDS") || "").split(",").map(value => value.trim()).filter(Boolean); }
function sheet_(name) { const sheet = SpreadsheetApp.getActive().getSheetByName(name); if (!sheet) throw new Error(`Missing sheet: ${name}`); return sheet; }
function rows_(sheet) { const values = sheet.getDataRange().getValues(); const headers = values.shift().map(String); return values.filter(row => row.some(Boolean)).map(row => Object.fromEntries(headers.map((key, index) => [key, row[index]]))); }
function readConfig_() { return { cards: rows_(sheet_(CARD_SHEET)), settings: Object.fromEntries(rows_(sheet_(SETTINGS_SHEET)).map(row => [row.key, row.value])) }; }
function notificationBoolean_(value, fallback) { if (typeof value === "boolean") return value; const text = String(value || "").trim().toLowerCase(); if (["true","1","yes"].includes(text)) return true; if (["false","0","no",""].includes(text)) return false; return fallback; }
function cleanNotification_(row, index) {
  const type = String(row.type || "").trim().toLowerCase(), action = String(row.action_type || row.actionType || "none").trim().toLowerCase(), publishedAt = row.published_at || row.publishedAt;
  if (!row.notification_id || !["new_app","app_update","platform_update","announcement"].includes(type) || !String(row.title || "").trim() || !["view_app","view_update","add_to_home","none"].includes(action) || !publishedAt || isNaN(new Date(publishedAt).getTime())) throw new Error("Invalid notification row");
  return [String(row.notification_id).slice(0,120), type, String(row.app_id || row.appId || "").slice(0,120), String(row.title).slice(0,160), String(row.summary || "").slice(0,1000), String(row.version || "").slice(0,80), new Date(publishedAt), notificationBoolean_(row.active, false), notificationBoolean_(row.show_popup ?? row.showPopup, false), action, Number(row.sort_order ?? row.sortOrder) || index];
}
function readNotifications_() { return rows_(sheet_(NOTIFICATION_SHEET)).map((row, index) => { try { return cleanNotification_(row, index); } catch (error) { return null; } }).filter(Boolean).map(row => Object.fromEntries(NOTIFICATION_HEADERS.map((key, index) => [key, row[index]]))); }
function saveNotifications_(body) {
  if (!Array.isArray(body.notifications)) throw new Error("Notifications are required");
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sheet = sheet_(NOTIFICATION_SHEET), rows = body.notifications.map((row, index) => cleanNotification_(row, index));
    sheet.clearContents(); sheet.getRange(1, 1, 1, NOTIFICATION_HEADERS.length).setValues([NOTIFICATION_HEADERS]);
    if (rows.length) sheet.getRange(2, 1, rows.length, NOTIFICATION_HEADERS.length).setValues(rows);
    return { success: true, count: rows.length };
  } finally { lock.releaseLock(); }
}
function cleanCard_(card, index) { return [String(card.id || "").slice(0,80),String(card.type||"app").slice(0,30),String(card.title||"").slice(0,100),String(card.subtitle||"").slice(0,500),String(card.emoji||"").slice(0,8),String(card.module_key||"").slice(0,80),/^https?:|^(\.\.\/|\.\/|modules\/)/.test(String(card.url||""))?String(card.url):"",String(card.category||"").slice(0,60),card.default_visible!==false,Number(card.default_order)||index,card.enabled!==false,new Date(),["area-1","area-2","area-3"].includes(card.default_area)?card.default_area:"area-1"]; }
function saveConfig_(body) { return mutateHomepage_(body); }

// Same bound workbook/tabs. No privileged credential is sent to the browser.
const REGISTRY_COLUMN = "registration_json";
function table_(sheet) {
  const values = sheet.getDataRange().getValues(), headers = values[0].map(String);
  if (new Set(headers).size !== headers.length || headers.some(key => !key)) throw new Error("Ambiguous Sheet headers");
  const last = values.reduce((last,row,index)=>row.some(value=>value!=="")?index:last,0);
  if(values.slice(1,last+1).some(row=>row.every(value=>value===""))) throw new Error("Blank row inside registry; lossless mapping required");
  return { sheet, headers, values, rows: values.slice(1).filter(row => row.some(value => value !== "")).map(row => Object.fromEntries(headers.map((key, i) => [key, row[i] ?? ""]))) };
}
function uniqueCards_(cards) {
  const ids = new Set(), keys = new Set();
  cards.forEach(card => { if (!card.id || ids.has(String(card.id)) || (card.module_key && keys.has(String(card.module_key)))) throw new Error("Duplicate or missing identity"); ids.add(String(card.id)); if (card.module_key) keys.add(String(card.module_key)); });
}
function allowedText_(value, max) { if (typeof value !== "string" || value.length > max || /^[=+@-]/.test(value)) throw new Error("Invalid text"); return value; }
function validateApp_(app) {
  const fields = ["id","moduleId","name","displayNameZh","entry","entryModes","capabilities","roleVisibility","category","order","enabled","visible","allowFavorite","icon","description","area","repository","integrationVersion","userSettings","adminSettings","defaultVisible","adminLaunchContract","market"];
  if (!app || Object.keys(app).some(key => !fields.includes(key)) || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(app.id) || app.moduleId !== app.id) throw new Error("Invalid App identity/fields");
  allowedText_(app.name,100); if (!app.name.trim()) throw new Error("Name required");
  ["displayNameZh","category","description","repository","integrationVersion","area","market","icon"].forEach(key => { if (app[key] !== undefined) allowedText_(app[key],key === "description" ? 500 : 160); });
  if (typeof app.order !== "number" || !isFinite(app.order) || app.order < 0 || ["enabled","visible","allowFavorite"].some(key => typeof app[key] !== "boolean")) throw new Error("Invalid flags/order");
  // Explicit deployment allowlist, configured only by the owner after review.
  // Match full deployment base, never just a mutable URL identity or origin.
  const allowed = JSON.parse(PropertiesService.getScriptProperties().getProperty("AVA_REGISTRY_ALLOWED_DEPLOYMENTS") || "[]");
  if (!Array.isArray(allowed) || !allowed.includes(app.entry) || !/^https:\/\/[^/?#@]+\/[^?#]*\/$/.test(app.entry)) throw new Error("Deployment is not allowlisted");
  if (!app.entryModes || Object.keys(app.entryModes).some(key => !["frontend","user","admin"].includes(key))) throw new Error("Invalid entry modes");
  ["frontend","user","admin"].forEach(mode => {
    if (typeof app.capabilities?.[mode] !== "boolean" || typeof app.roleVisibility?.[mode] !== "boolean") throw new Error("Explicit capabilities required");
    if (app.capabilities[mode] && app.entryModes[mode] !== app.entry + "?avaEntry=" + mode) throw new Error("Invalid canonical route");
  });
  if (!app.capabilities.frontend) throw new Error("Front entry required");
  if (app.adminLaunchContract && !["ava-admin-session-v1","ava-legacy-app-grant-v1"].includes(app.adminLaunchContract)) throw new Error("Invalid Admin contract");
  return app;
}
function registrationPayload_(app) { const payload={...app}; ["name","displayNameZh"].forEach(key=>delete payload[key]); return JSON.stringify(payload); }
function immutableApp_(app) { return JSON.stringify([app.id,app.moduleId,app.entry,app.entryModes,app.capabilities,app.roleVisibility,app.adminLaunchContract || ""]); }
function sameCell_(left,right) { const text=value=>value instanceof Date ? value.toISOString() : String(value ?? ""); return text(left)===text(right); }
function setCells_(table, rowIndex, patch) {
  Object.keys(patch).forEach(key => {
    let column = table.headers.indexOf(key);
    if (column < 0) { column = table.headers.length; table.headers.push(key); table.sheet.getRange(1,column+1).setValue(key); }
    table.sheet.getRange(rowIndex+2,column+1).setValue(patch[key]);
  });
}
function validateCategories_(categories, previous) {
  if (!Array.isArray(categories) || categories.length < 3 || categories.length > 9 || new Set(categories.map(c => c.id)).size !== categories.length) throw new Error("Invalid category inventory");
  categories.forEach(c => { if(!/^area-[1-9]$/.test(c.id)||typeof c.enabled!=="boolean"||!Number.isFinite(c.order))throw new Error("Invalid category");allowedText_(c.title,80);if(!c.title.trim())throw new Error("Category name required"); });
  const old = previous ? JSON.parse(previous) : [{id:"area-1"},{id:"area-2"},{id:"area-3"}];
  if (old.some(c => !categories.some(next => next.id === c.id))) throw new Error("Category identity removal is forbidden");
}
function mutateHomepage_(body) {
  // Authentication again under the lock: expiry/revocation while queued is denied.
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    verifySession_(body.sessionToken);
    if (!/^[a-zA-Z0-9-]{8,100}$/.test(body.requestId || "") || typeof body.expectedRevision !== "string") throw new Error("Revision/request identity required");
    const cards = table_(sheet_(CARD_SHEET)), settings = table_(sheet_(SETTINGS_SHEET));
    uniqueCards_(cards.rows);
    const state = Object.fromEntries(settings.rows.map(row => [row.key,row.value]));
    const fingerprint = digest_(JSON.stringify([body.action,body.expectedRevision,body.cards || null,body.registration || null,body.settings || null,body.categories || null]));
    const receiptKey = "workspace_request_" + body.requestId, prior = state[receiptKey] && JSON.parse(state[receiptKey]);
    if (prior) {
      if (prior.fingerprint !== fingerprint) throw new Error("Idempotency key reused with different data");
      if (String(state.homepage_version) !== prior.version) throw new Error("Request already committed; reload newer Official state");
      return {success:true,persisted:true,readAfterWrite:true,requestId:body.requestId,version:prior.version,data:readConfig_()};
    }
    if (String(state.homepage_version) !== body.expectedRevision) throw new Error("Stale revision; reload Official state (draft preserved)");
    let patches = [], settingPatch = {};
    if (body.action === "upsertAppRegistration") {
      if (String(state.registry_schema_version) !== "1") throw new Error("Reviewed registry migration has not been applied");
      const app = validateApp_(body.registration), existing = cards.rows.find(row => row.module_key === app.id);
      if (!existing && (app.capabilities.user || app.capabilities.admin) && !platformAdminApps_().includes(app.id)) throw new Error("Capability requires reviewed authorization allowlist");
      if (existing && !existing.registration_json) throw new Error("Existing registration is not losslessly mapped");
      if (existing && immutableApp_(JSON.parse(existing.registration_json)) !== immutableApp_(app)) throw new Error("Immutable App identity/routing/permissions cannot change");
      const urlCollision = cards.rows.find(row => row.module_key !== app.id && row.registration_json && JSON.parse(row.registration_json).entry === app.entry);
      if (urlCollision) throw new Error("Deployment is already registered under another identity");
      const row = existing ? {...existing,title:app.displayNameZh || app.name,category:app.category,default_order:app.order,enabled:app.enabled,registration_json:registrationPayload_(app)} : {id:app.id,module_key:app.id,type:"official_app",title:app.displayNameZh || app.name,subtitle:app.description || "",emoji:"",url:"",category:app.category,default_visible:false,default_order:app.order,default_area:"area-1",enabled:app.enabled,registration_json:registrationPayload_(app)};
      if (!existing && cards.rows.some(c => c.id === app.id)) throw new Error("Card identity already exists");
      patches = [row];
    } else if (body.action === "saveHomepageConfig" || body.action === "saveWorkspaceConfig") {
      if (!Array.isArray(body.cards)) throw new Error("Cards required");uniqueCards_(body.cards);
      // No omission/deletion through bulk presentation writes, including disabled
      // cards and unknown legacy records. STOP instead of silently losing data.
      if (cards.rows.some(row => !body.cards.some(card => card.id === row.id))) throw new Error("Existing card omitted; lossless mapping required");
      const allowed = CARD_HEADERS.filter(key => key !== "updated_at");
      patches = body.cards.map(card => {
        const old = cards.rows.find(row => row.id === card.id);
        if (!old && card.module_key) throw new Error("Use authorized registration upsert");
        if (old && ["module_key","url","type","registration_json"].some(key => String(old[key] || "") !== String(card[key] || ""))) throw new Error("Immutable registration field changed");
        const patch = {};
        Object.keys(card).forEach(key => { if (!allowed.includes(key)) { if (!old || (key !== "updated_at" && !sameCell_(old[key],card[key]))) throw new Error("Field not allowlisted"); return; } patch[key]=card[key]; });
        ["title","subtitle","emoji","category"].forEach(key => allowedText_(patch[key] || "",key === "subtitle" ? 500 : 100));
        if (!/^area-[1-9]$/.test(patch.default_area) || !Number.isFinite(patch.default_order) || ["enabled","default_visible"].some(key => typeof patch[key] !== "boolean")) throw new Error("Invalid presentation data");
        return {...old,...patch};
      });
      if (body.categories) {validateCategories_(body.categories,state.workspace_categories);settingPatch.workspace_categories=JSON.stringify(body.categories);}
      ["personal_cards_enabled","search_enabled"].forEach(key => {const camel={personal_cards_enabled:"personalCardsEnabled",search_enabled:"searchEnabled"}[key],value=body.settings?.[camel]??body.settings?.[key];if(value!==undefined){if(typeof value!=="boolean")throw new Error("Invalid setting");settingPatch[key]=value;}});
    } else throw new Error("Unsupported mutation");
    const newRows = cards.rows.slice();
    patches.forEach(patch => {const index=newRows.findIndex(row=>row.id===patch.id);if(index<0)newRows.push(patch);else newRows[index]=patch;});uniqueCards_(newRows);
    // Save originals for compensating rollback. Only allowlisted cells are
    // touched; unknown columns, descriptions, row order and formulas survive.
    const undo = [], apply=(table,index,patch)=>{
      Object.entries(patch).forEach(([key,value])=>{const col=table.headers.indexOf(key),range=col<0?null:table.sheet.getRange(index+2,col+1);undo.push({table,index,key,formula:range?.getFormula()||"",value:range?.getValue()??""});});setCells_(table,index,patch);
    };
    try {
      patches.forEach(row=>{const index=cards.rows.findIndex(old=>old.id===row.id);const nextIndex=index<0?cards.rows.length:index;const old=index<0?{}:cards.rows[index],changed=Object.fromEntries(Object.entries(row).filter(([key,value])=>!sameCell_(old[key],value)));apply(cards,nextIndex,changed);if(index<0)cards.rows.push(row);});
      SpreadsheetApp.flush();
      const actual = rows_(sheet_(CARD_SHEET));uniqueCards_(actual);
      if (JSON.stringify(actual.map(row=>row.id))!==JSON.stringify(newRows.map(row=>row.id)) || newRows.some(patch=>{const row=actual.find(r=>r.id===patch.id);return !row||Object.keys(patch).some(key=>!sameCell_(row[key],patch[key]));})) throw new Error("Read-after-write mismatch");
      const version=Utilities.getUuid();settingPatch.homepage_version=version;settingPatch[receiptKey]=JSON.stringify({fingerprint,version});
      Object.entries(settingPatch).forEach(([key,value])=>{let index=settings.rows.findIndex(row=>row.key===key);if(index<0){index=settings.rows.length;settings.rows.push({key,value});apply(settings,index,{key,value});}else apply(settings,index,{value});});
      SpreadsheetApp.flush();
      const data=readConfig_();if(String(data.settings.homepage_version)!==version||Object.keys(settingPatch).some(key=>String(data.settings[key])!==String(settingPatch[key])))throw new Error("Read-after-write settings mismatch");
      return {success:true,persisted:true,readAfterWrite:true,requestId:body.requestId,version,data};
    } catch(error) {
      // SpreadsheetApp has no multi-range transaction. Best-effort compensation
      // under the lock; never acknowledge an uncertain mutation as success.
      let restored=true;undo.reverse().forEach(cell=>{try{const column=cell.table.headers.indexOf(cell.key);if(column>=0)cell.table.sheet.getRange(cell.index+2,column+1).setValue(cell.formula||cell.value);}catch(_){restored=false;}});try{SpreadsheetApp.flush();}catch(_){restored=false;}
      throw new Error(error.message+(restored?"; previous values restored":"; persistence uncertain, reload and inspect before retry"));
    }
  } finally { lock.releaseLock(); }
}

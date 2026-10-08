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
    if (body.action === "exchangeAdminSession") return json_(exchangeAdminSession_(body.launchTicket, body.appId, body.launchNonce));
    if (body.action === "verifyAdminSession") return json_(verifyAdminSession_(body.adminSessionProof, body.appId, body.operation));
    if (body.action === "saveHomepageConfig") { verifySession_(body.sessionToken); return json_(saveConfig_(body)); }
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
function exchangeAdminSession_(ticket, appId, launchNonce) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties(), key = `AVA_ADMIN_LAUNCH_${String(ticket || "")}`, raw = props.getProperty(key); if (!raw) throw new Error("Invalid or expired Admin launch");
    const launch = JSON.parse(raw); if (launch.legacy || launch.appId !== String(appId) || launch.launchNonce !== String(launchNonce || "") || launch.expiresAt <= Date.now()) { if (launch.expiresAt <= Date.now()) props.deleteProperty(key); throw new Error("Invalid or expired Admin launch"); }
    const sessionKey = `AVA_ADMIN_SESSION_${launch.sessionNonce}`;
    if (Number(launch.sessionExpiry) <= Date.now() || props.getProperty(sessionKey) !== String(launch.sessionExpiry)) { props.deleteProperty(key); if (Number(launch.sessionExpiry) <= Date.now()) props.deleteProperty(sessionKey); throw new Error("Admin session is not active"); }
    props.deleteProperty(key);
    const expiry = Number(launch.sessionExpiry), data = JSON.stringify({ appId: launch.appId, sessionNonce: launch.sessionNonce, sessionExpiry: expiry, expiresAt: expiry });
    const proof = Utilities.base64EncodeWebSafe(data) + "." + Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(data, props.getProperty("SESSION_SECRET")));
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
function saveConfig_(body) {
  if (!Array.isArray(body.cards)) throw new Error("Cards are required");
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { const sheet=sheet_(CARD_SHEET); sheet.clearContents(); sheet.getRange(1,1,1,CARD_HEADERS.length).setValues([CARD_HEADERS]); if(body.cards.length)sheet.getRange(2,1,body.cards.length,CARD_HEADERS.length).setValues(body.cards.map(cleanCard_)); const settings=sheet_(SETTINGS_SHEET), version=String(Date.now()); const values=rows_(settings); const map=new Map(values.map(row=>[String(row.key),row.value])); map.set("homepage_version",version); ["personal_cards_enabled","search_enabled"].forEach(key=>{if(body.settings&&key in body.settings)map.set(key,Boolean(body.settings[key]))}); settings.clearContents(); settings.getRange(1,1,1,2).setValues([["key","value"]]); settings.getRange(2,1,map.size,2).setValues([...map]); return {success:true,version}; } finally { lock.releaseLock(); }
}

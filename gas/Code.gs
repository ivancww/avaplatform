/** AVA Homepage Cloud — deploy as the existing Web App. Configure ADMIN_PASSWORD_HASH and SESSION_SECRET in Script Properties. */
const CARD_SHEET = "homepage_cards";
const SETTINGS_SHEET = "homepage_settings";
const CARD_HEADERS = ["id","type","title","subtitle","emoji","module_key","url","category","default_visible","default_order","enabled","updated_at","default_area"];

function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) {
  const action = String(e.parameter.action || "");
  if (action === "health") return json_({ success: true, service: "AVA Platform Cloud", status: "ok" });
  if (action === "getHomepageConfig") return json_({ success: true, data: readConfig_() });
  return json_({ success: false, error: "Unsupported action" });
}
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body.action === "authenticateAdmin") return json_(authenticate_(body.password));
    if (body.action === "saveHomepageConfig") { verifySession_(body.sessionToken); return json_(saveConfig_(body)); }
    return json_({ success: false, error: "Unsupported action" });
  } catch (error) { return json_({ success: false, error: error.message }); }
}
function digest_(value) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value).map(byte => (byte + 256).toString(16).slice(-2)).join(""); }
function authenticate_(password) {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("ADMIN_PASSWORD_HASH") || digest_(String(password || "")) !== props.getProperty("ADMIN_PASSWORD_HASH")) throw new Error("Invalid credentials");
  const expiry = Date.now() + 30 * 60 * 1000, nonce = Utilities.getUuid();
  const data = `${expiry}.${nonce}`, signature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(data, props.getProperty("SESSION_SECRET")));
  return { success: true, sessionToken: `${data}.${signature}`, expiresAt: new Date(expiry).toISOString() };
}
function verifySession_(token) {
  const parts = String(token || "").split("."); if (parts.length !== 3 || Number(parts[0]) < Date.now()) throw new Error("Admin session expired");
  const expected = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(`${parts[0]}.${parts[1]}`, PropertiesService.getScriptProperties().getProperty("SESSION_SECRET")));
  if (expected !== parts[2]) throw new Error("Unauthorized");
}
function sheet_(name) { const sheet = SpreadsheetApp.getActive().getSheetByName(name); if (!sheet) throw new Error(`Missing sheet: ${name}`); return sheet; }
function rows_(sheet) { const values = sheet.getDataRange().getValues(); const headers = values.shift().map(String); return values.filter(row => row.some(Boolean)).map(row => Object.fromEntries(headers.map((key, index) => [key, row[index]]))); }
function readConfig_() { return { cards: rows_(sheet_(CARD_SHEET)), settings: Object.fromEntries(rows_(sheet_(SETTINGS_SHEET)).map(row => [row.key, row.value])) }; }
function cleanCard_(card, index) { return [String(card.id || "").slice(0,80),String(card.type||"app").slice(0,30),String(card.title||"").slice(0,100),String(card.subtitle||"").slice(0,500),String(card.emoji||"").slice(0,8),String(card.module_key||"").slice(0,80),/^https?:|^(\.\.\/|\.\/|modules\/)/.test(String(card.url||""))?String(card.url):"",String(card.category||"").slice(0,60),card.default_visible!==false,Number(card.default_order)||index,card.enabled!==false,new Date(),["area-1","area-2","area-3"].includes(card.default_area)?card.default_area:"area-1"]; }
function saveConfig_(body) {
  if (!Array.isArray(body.cards)) throw new Error("Cards are required");
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { const sheet=sheet_(CARD_SHEET); sheet.clearContents(); sheet.getRange(1,1,1,CARD_HEADERS.length).setValues([CARD_HEADERS]); if(body.cards.length)sheet.getRange(2,1,body.cards.length,CARD_HEADERS.length).setValues(body.cards.map(cleanCard_)); const settings=sheet_(SETTINGS_SHEET), version=String(Date.now()); const values=rows_(settings); const map=new Map(values.map(row=>[String(row.key),row.value])); map.set("homepage_version",version); ["personal_cards_enabled","search_enabled"].forEach(key=>{if(body.settings&&key in body.settings)map.set(key,Boolean(body.settings[key]))}); settings.clearContents(); settings.getRange(1,1,1,2).setValues([["key","value"]]); settings.getRange(2,1,map.size,2).setValues([...map]); return {success:true,version}; } finally { lock.releaseLock(); }
}

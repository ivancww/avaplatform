(function (global) {
  "use strict";

  const MODULE_ID = "5pay";
  const SCHEMA_VERSION = 1;
  const KEYS = Object.freeze({
    user: "ava:modules:5pay:user-config",
    official: "ava:modules:5pay:official-config",
    version: "ava:modules:5pay:schema-version",
    legacy: "ava:modules:5pay:legacy-snapshot"
  });
  const LEGACY_KEYS = ["5pay_user_config", "5pay:user-config", "fivepay_user_config", "5payUserConfig"];

  const sections = Object.freeze([
    { id: "scenarios", label: "情境管理", help: "四個情境、情境名稱及情境流程。", fields: ["scenarios", "flow"] },
    { id: "questions", label: "頁面與問題", help: "Dynamic Question、標題、副標題、選項、Visual Steps、按鈕、圖片、排序及顯示狀態。", fields: ["questions", "pages"] },
    { id: "gap", label: "Gap", help: "Gap 頁面所使用的文字內容。", fields: ["gap"] },
    { id: "compound", label: "時光複利", help: "時光複利頁面的可管理文字。", fields: ["compound"] },
    { id: "jar", label: "水庫", help: "水庫名稱、描述、欄位名稱及年期選項文字。", fields: ["jar"] },
    { id: "blueprint", label: "人生藍圖", help: "人生藍圖文字及 Blueprint Image。", fields: ["blueprint"] },
    { id: "mapping", label: "Mapping", help: "5Pay 現有資料 Mapping。", fields: ["mapping"], adminOnly: true },
    { id: "system", label: "系統參數與同步", help: "5Pay-specific System Parameters 及 Cloud / Google Sheet 官方同步。", fields: ["system", "sync"], adminOnly: true }
  ]);

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function parse(key) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value && typeof value === "object" ? value : null; }
    catch (_) { return null; }
  }
  function emptyConfig(scope) {
    return { schemaVersion: SCHEMA_VERSION, moduleId: MODULE_ID, scope, updatedAt: null, data: {} };
  }
  function migrate(input) {
    if (!input || typeof input !== "object") return emptyConfig("personal");
    if (input.schemaVersion === SCHEMA_VERSION && input.moduleId === MODULE_ID) return clone(input);
    const data = input.data && typeof input.data === "object" ? input.data : input;
    return { schemaVersion: SCHEMA_VERSION, moduleId: MODULE_ID, scope: input.scope || "personal", updatedAt: input.updatedAt || null, data: clone(data) };
  }
  function migrateLegacy() {
    if (localStorage.getItem(KEYS.user)) return false;
    for (const key of LEGACY_KEYS) {
      const value = parse(key);
      if (!value) continue;
      localStorage.setItem(KEYS.legacy, JSON.stringify({ sourceKey: key, value: clone(value) }));
      localStorage.setItem(KEYS.user, JSON.stringify(migrate(value)));
      localStorage.setItem(KEYS.version, String(SCHEMA_VERSION));
      return true;
    }
    return false;
  }
  function load(scope) {
    if (scope !== "official") migrateLegacy();
    const key = scope === "official" ? KEYS.official : KEYS.user;
    const config = parse(key);
    return config ? migrate(config) : emptyConfig(scope === "official" ? "official" : "personal");
  }
  function save(config, scope) {
    const targetScope = scope === "official" ? "official" : "personal";
    const normalized = migrate(config);
    normalized.scope = targetScope;
    normalized.updatedAt = new Date().toISOString();
    localStorage.setItem(targetScope === "official" ? KEYS.official : KEYS.user, JSON.stringify(normalized));
    localStorage.setItem(KEYS.version, String(SCHEMA_VERSION));
    return clone(normalized);
  }
  function merge(base, override) {
    if (!base || typeof base !== "object" || Array.isArray(base) || !override || typeof override !== "object" || Array.isArray(override)) return clone(override);
    const result = clone(base);
    Object.entries(override).forEach(([key, value]) => { result[key] = value && typeof value === "object" && !Array.isArray(value) && result[key] && typeof result[key] === "object" && !Array.isArray(result[key]) ? merge(result[key], value) : clone(value); });
    return result;
  }
  function resolve() {
    const official = load("official"), personal = load("personal");
    return { schemaVersion: SCHEMA_VERSION, moduleId: MODULE_ID, scope: "resolved", updatedAt: personal.updatedAt || official.updatedAt, data: merge(official.data, personal.data) };
  }
  function restoreDefault(scope) {
    const key = scope === "official" ? KEYS.official : KEYS.user;
    localStorage.removeItem(key);
    return load(scope);
  }
  function exportData() { return load("personal"); }
  function importData(payload) { return save(migrate(payload), "personal"); }

  global.AVAModules = global.AVAModules || {};
  global.AVAModules[MODULE_ID] = Object.freeze({
    metadata: Object.freeze({ id: MODULE_ID, name: "5Pay", version: "1.0.0", schemaVersion: SCHEMA_VERSION }),
    userConfig: Object.freeze({ scope: "personal", sections: sections.filter(section => !section.adminOnly) }),
    adminConfig: Object.freeze({ scope: "official", sections }),
    keys: KEYS, load, resolve, save, restoreDefault, export: exportData, import: importData, migrate, migrateLegacy
  });
})(window);

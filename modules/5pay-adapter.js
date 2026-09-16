(function (global) {
  "use strict";

  const MODULE_ID = "5pay";
  // 5Pay owns these names and their values. AVA deliberately does not namespace,
  // translate or merge them, so an existing installation remains readable.
  const PERSONAL_KEYS = Object.freeze([
    "ava_user_has_customized",
    "ava_scenario_database",
    "ava_scenarios_db",
    "ava_jar_texts",
    "ava_blueprint_summary",
    "ava_blueprint_img",
    "ava_planner_display_name",
    "ava_strategy_by_term",
    "ava_jar_configs"
  ]);

  function exportData() {
    const values = {};
    PERSONAL_KEYS.forEach(function (key) {
      const value = localStorage.getItem(key);
      if (value !== null) values[key] = value;
    });
    return { moduleId: MODULE_ID, format: "5pay-local-storage-v1", values: values };
  }

  function migrate(payload) {
    if (!payload || typeof payload !== "object") throw new Error("無效的 5Pay 備份資料。");
    if (payload.format === "5pay-local-storage-v1" && payload.values) return payload;
    // Read the envelope produced by AVA 1.2 without deleting the source. It is
    // retained in the backup package, but cannot safely be projected onto 5Pay's
    // mature field-level storage model.
    if (payload.moduleId === MODULE_ID && payload.data) {
      return { moduleId: MODULE_ID, format: "ava-1.2-compatibility-snapshot", values: {} };
    }
    throw new Error("不支援的 5Pay 備份格式。");
  }

  function importData(payload) {
    const normalized = migrate(payload);
    Object.entries(normalized.values).forEach(function (entry) {
      const key = entry[0], value = entry[1];
      if (PERSONAL_KEYS.includes(key) && typeof value === "string") localStorage.setItem(key, value);
    });
    return true;
  }

  function resetToDefault() {
    PERSONAL_KEYS.forEach(function (key) { localStorage.removeItem(key); });
    return true;
  }

  global.AVAModules = global.AVAModules || {};
  global.AVAModules[MODULE_ID] = Object.freeze({
    metadata: Object.freeze({ id: MODULE_ID, name: "5Pay", version: "1.1.0" }),
    personalKeys: PERSONAL_KEYS,
    export: exportData,
    import: importData,
    migrate: migrate,
    resetToDefault: resetToDefault
  });
})(window);

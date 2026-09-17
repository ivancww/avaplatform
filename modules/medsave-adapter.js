(function (global) {
  "use strict";

  const MODULE_ID = "medsave";
  const PERSONAL_KEYS = Object.freeze([
    "ava_med_user_customized",
    "ava_med_scenario_db_v3",
    "ava_med_custom_timing",
    "ava_med_blueprint_summary",
    "ava_med_custom_blueprint_img",
    "ava_med_system_topic"
  ]);

  function exportData() {
    const values = {};
    PERSONAL_KEYS.forEach(function (key) {
      const value = localStorage.getItem(key);
      if (value !== null) values[key] = value;
    });
    return { moduleId: MODULE_ID, format: "medsave-local-storage-v1", values: values };
  }

  function migrate(payload) {
    if (!payload || typeof payload !== "object") throw new Error("無效的 Medsave 備份資料。");
    if (payload.format === "medsave-local-storage-v1" && payload.values) return payload;
    throw new Error("不支援的 Medsave 備份格式。");
  }

  function importData(payload) {
    const normalized = migrate(payload);
    Object.entries(normalized.values).forEach(function (entry) {
      const key = entry[0], value = entry[1];
      if (PERSONAL_KEYS.includes(key) && typeof value === "string") localStorage.setItem(key, value);
    });
    localStorage.setItem("ava_med_user_customized", "true");
    return true;
  }

  function resetToDefault() {
    PERSONAL_KEYS.forEach(function (key) { localStorage.removeItem(key); });
    return true;
  }

  global.AVAModules = global.AVAModules || {};
  global.AVAModules[MODULE_ID] = Object.freeze({
    metadata: Object.freeze({ id: MODULE_ID, name: "Medsave", version: "1.0.0" }),
    personalKeys: PERSONAL_KEYS,
    export: exportData,
    import: importData,
    migrate: migrate,
    resetToDefault: resetToDefault
  });
})(window);

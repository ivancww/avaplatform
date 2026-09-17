(function (global) {
  "use strict";

  const MODULE_ID = "medical-claims";
  // Personal Agent Configuration only. System cache, credentials, endpoints,
  // cloud calculation data, auth state and transient answers are excluded.
  const PERSONAL_KEYS = Object.freeze([
    "AVA_MED_APP_TAILOR_V1",
    "AVA_MED_HIDDEN_CLOUD_CASE_IDS_V1",
    "AVA_MED_CASE_OVERRIDES_V1",
    "AVA_MED_LOCAL_USER_CASES_V1",
    "AVA_MED_HIDDEN_CLOUD_DOCUMENT_IDS_V1",
    "AVA_MED_LOCAL_DOCUMENT_METADATA_V1",
    "AVA_MED_DOCUMENT_ORDER_V1"
  ]);

  function exportData() {
    const values = {};
    PERSONAL_KEYS.forEach(function (key) {
      const value = localStorage.getItem(key);
      if (value !== null) values[key] = value;
    });
    return { moduleId: MODULE_ID, format: "medical-claims-personal-v1", values: values };
  }

  function migrate(payload) {
    if (!payload || typeof payload !== "object") throw new Error("無效的 Medical Claims 備份資料。");
    if (payload.format === "medical-claims-personal-v1" && payload.values && typeof payload.values === "object") return payload;
    throw new Error("不支援的 Medical Claims 備份格式。");
  }

  function importData(payload) {
    const normalized = migrate(payload);
    Object.entries(normalized.values).forEach(function (entry) {
      const key = entry[0], value = entry[1];
      if (!PERSONAL_KEYS.includes(key) || typeof value !== "string") return;
      if (key === "AVA_MED_LOCAL_DOCUMENT_METADATA_V1") {
        try {
          const metadata = JSON.parse(value).map(function (item) {
            const storageProvider = item.storageProvider || "local";
            return { ...item, source: "personal", storageProvider, missingFile: storageProvider === "local" };
          });
          localStorage.setItem(key, JSON.stringify(metadata));
          return;
        } catch (error) {
          throw new Error("Medical Claims私人文件metadata無法還原。");
        }
      }
      localStorage.setItem(key, value);
    });
    return true;
  }

  function resetToDefault() {
    try {
      const metadata = JSON.parse(localStorage.getItem("AVA_MED_LOCAL_DOCUMENT_METADATA_V1") || "[]");
      metadata.forEach(function (item) {
        const providerId = item.storageProvider || "local";
        const reference = item.providerReference || item.fileId || item.id;
        if (reference && global.AVAStorage) global.AVAStorage.deletePersonalFile(providerId, reference).catch(function () {});
      });
    } catch (error) {
      console.warn("Unable to clear Medical Claims personal file payloads", error);
    }
    PERSONAL_KEYS.forEach(function (key) { localStorage.removeItem(key); });
    return true;
  }

  global.AVAModules = global.AVAModules || {};
  global.AVAModules[MODULE_ID] = Object.freeze({
    metadata: Object.freeze({ id: MODULE_ID, name: "Medical Claims", version: "7.7.0" }),
    personalKeys: PERSONAL_KEYS,
    export: exportData,
    import: importData,
    migrate: migrate,
    resetToDefault: resetToDefault
  });
})(window);

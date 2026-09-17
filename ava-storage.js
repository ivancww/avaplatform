(function (global) {
  "use strict";

  const providers = new Map();
  const LOCAL_DB = "AVA_USER_STORAGE_V1";
  const LOCAL_STORE = "files";

  function assertProvider(provider) {
    if (!provider || typeof provider.id !== "string" || !provider.id) throw new Error("Storage Provider需要有效ID。");
    ["saveFile", "resolveFile", "deletePersonalFile", "getMetadata"].forEach(function (method) {
      if (typeof provider[method] !== "function") throw new Error(`Storage Provider ${provider.id} 缺少 ${method}()。`);
    });
  }

  function registerProvider(provider) {
    assertProvider(provider);
    if (providers.has(provider.id)) throw new Error(`Storage Provider已註冊：${provider.id}`);
    providers.set(provider.id, Object.freeze(provider));
    return provider;
  }

  async function getAvailableProviders(context) {
    const results = [];
    for (const provider of providers.values()) {
      const available = typeof provider.isAvailable !== "function" || await provider.isAvailable(context || {});
      if (available) results.push(provider);
    }
    return results;
  }

  function getProvider(providerId) {
    const provider = providers.get(providerId);
    if (!provider) throw new Error(`目前無法使用此儲存位置：${providerId}`);
    return provider;
  }

  function saveFile(providerId, file, context) { return getProvider(providerId).saveFile(file, context || {}); }
  function resolveFile(providerId, reference) { return getProvider(providerId).resolveFile(reference); }
  function deletePersonalFile(providerId, reference) { return getProvider(providerId).deletePersonalFile(reference); }
  function getMetadata(providerId, reference) { return getProvider(providerId).getMetadata(reference); }

  function openLocalDB() {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(LOCAL_DB, 1);
      request.onupgradeneeded = function () {
        if (!request.result.objectStoreNames.contains(LOCAL_STORE)) request.result.createObjectStore(LOCAL_STORE, { keyPath: "id" });
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  async function localOperation(mode, operation) {
    const database = await openLocalDB();
    try {
      return await new Promise(function (resolve, reject) {
        const transaction = database.transaction(LOCAL_STORE, mode);
        const request = operation(transaction.objectStore(LOCAL_STORE));
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { reject(request.error); };
        transaction.onerror = function () { reject(transaction.error); };
      });
    } finally {
      database.close();
    }
  }

  registerProvider({
    id: "local",
    name: "此裝置",
    description: "只儲存在這部裝置",
    privacyNote: "換機、清除瀏覽器或移除PWA資料後，檔案需要重新上載。",
    icon: "📱",
    isAvailable: function () { return "indexedDB" in global; },
    async saveFile(file, context) {
      if (!file || typeof file.name !== "string") throw new Error("請選擇有效檔案。");
      const now = new Date().toISOString();
      const reference = context.reference || `ava-file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const record = { id: reference, blob: file, filename: file.name, mimeType: file.type || "application/octet-stream", size: Number(file.size) || 0, createdAt: now, updatedAt: now };
      await localOperation("readwrite", store => store.put(record));
      return { providerId: "local", reference, filename: record.filename, mimeType: record.mimeType, size: record.size, createdAt: now, updatedAt: now };
    },
    async resolveFile(reference) {
      const record = await localOperation("readonly", store => store.get(reference));
      return record ? record.blob : null;
    },
    async deletePersonalFile(reference) {
      await localOperation("readwrite", store => store.delete(reference));
      return true;
    },
    async getMetadata(reference) {
      const record = await localOperation("readonly", store => store.get(reference));
      if (!record) return null;
      const { blob, ...metadata } = record;
      return metadata;
    }
  });

  global.AVAStorage = Object.freeze({ registerProvider, getAvailableProviders, getProvider, saveFile, resolveFile, deletePersonalFile, getMetadata });
})(window);

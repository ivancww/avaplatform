(function (global) {
  "use strict";
  const PACKAGE_VERSION = 1;
  const PLATFORM_KEYS = ["ava:platform:homepage-order", "ava:platform:branding"];

  function modules() { return Object.values(global.AVAModules || {}); }
  function createPackage() {
    const platform = {};
    PLATFORM_KEYS.forEach(key => { const value = localStorage.getItem(key); if (value !== null) platform[key] = value; });
    const moduleData = {};
    modules().forEach(adapter => { moduleData[adapter.metadata.id] = adapter.export(); });
    return { kind: "ava-backup", packageVersion: PACKAGE_VERSION, createdAt: new Date().toISOString(), platform, modules: moduleData };
  }
  function restorePackage(pkg) {
    if (!pkg || pkg.kind !== "ava-backup" || !pkg.platform || !pkg.modules) throw new Error("這不是有效的 AVA Backup Package。");
    Object.entries(pkg.platform).forEach(([key, value]) => { if (PLATFORM_KEYS.includes(key) && typeof value === "string") localStorage.setItem(key, value); });
    modules().forEach(adapter => { if (pkg.modules[adapter.metadata.id]) adapter.import(adapter.migrate(pkg.modules[adapter.metadata.id])); });
    return true;
  }
  global.AVABackup = Object.freeze({ createPackage, restorePackage, packageVersion: PACKAGE_VERSION });
})(window);

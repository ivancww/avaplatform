(function (global) {
  "use strict";
  const STATE_KEY = "ava:platform:lifecycle-v1";
  const INSTALL_PARAM = "install";

  function isStandalone() { return global.matchMedia?.("(display-mode: standalone)").matches || global.navigator?.standalone === true; }
  function read(storage = global.localStorage) {
    try { return { onboardingCompleted: false, initialized: false, cloudVersion: "", userName: "", ...(JSON.parse(storage.getItem(STATE_KEY)) || {}) }; }
    catch (error) { return { onboardingCompleted: false, initialized: false, cloudVersion: "", userName: "" }; }
  }
  function save(next, storage = global.localStorage) { const state = { ...read(storage), ...next }; storage.setItem(STATE_KEY, JSON.stringify(state)); return state; }
  function needsInstallationGateway(location = global.location) { return !isStandalone(); }
  function completeOfficialInitialization(cloudVersion, storage = global.localStorage) { return save({ initialized: true, cloudVersion }, storage); }
  function completeOnboarding(userName, storage = global.localStorage) {
    const name = String(userName || "").trim();
    if (!name) throw new Error("User Name is required");
    storage.setItem("ava:platform:user-name", name);
    return save({ onboardingCompleted: true, initialized: true, userName: name }, storage);
  }
  function installationUrl(location = global.location) { const url = new URL("install.html", location.href); url.searchParams.set(INSTALL_PARAM, "1"); return url.href; }
  function moduleState(moduleId, storage = global.localStorage) {
    try { return { initialized: false, cloudVersion: "", userData: {}, userOverrides: {}, ...(JSON.parse(storage.getItem(`ava:module:${moduleId}:lifecycle`)) || {}) }; }
    catch (error) { return { initialized: false, cloudVersion: "", userData: {}, userOverrides: {} }; }
  }
  function markModuleInitialized(moduleId, cloudVersion, storage = global.localStorage) {
    const state = { ...moduleState(moduleId, storage), initialized: true, cloudVersion, lastCheckedAt: new Date().toISOString() };
    storage.setItem(`ava:module:${moduleId}:lifecycle`, JSON.stringify(state)); return state;
  }
  global.AVALifecycle = Object.freeze({ STATE_KEY, INSTALL_PARAM, isStandalone, read, save, needsInstallationGateway, installationUrl, completeOfficialInitialization, completeOnboarding, moduleState, markModuleInitialized });
})(typeof window === "undefined" ? globalThis : window);

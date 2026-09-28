(function (global) {
  "use strict";

  const ENDPOINT = "https://script.google.com/macros/s/AKfycbzVf1fuxcq8GPSOzS8WvcAtubqaawFj0rbVjxe0LOLKfwbYkRZf7Vs61Q0T73UG6dznww/exec";
  const SESSION_KEY = "ava:platform:admin-session";
  const SESSION_MAX_AGE_MS = 30 * 60 * 1000;

  function sessionToken(storage = global.sessionStorage) {
    try { return storage.getItem(SESSION_KEY) || ""; } catch (_) { return ""; }
  }

  function clearSession(storage = global.sessionStorage) {
    try { storage.removeItem(SESSION_KEY); } catch (_) { /* private browsing */ }
  }

  async function request(body, fetchImpl = global.fetch) {
    const response = await fetchImpl(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    });
    let payload;
    try { payload = await response.json(); } catch (_) { throw new Error("Invalid AVA Admin response"); }
    if (!response.ok || payload.success !== true) throw new Error(payload.error || "AVA Admin request failed");
    return payload;
  }

  async function authenticate(password, fetchImpl = global.fetch, storage = global.sessionStorage) {
    if (!password) throw new Error("Admin password is required");
    const payload = await request({ action: "authenticateAdmin", password }, fetchImpl);
    if (!payload.sessionToken || !payload.expiresAt) throw new Error("AVA Admin session was not established");
    try { storage.setItem(SESSION_KEY, payload.sessionToken); } catch (_) { throw new Error("Unable to establish Admin session"); }
    return payload;
  }

  async function logout(fetchImpl = global.fetch, storage = global.sessionStorage) {
    const token = sessionToken(storage);
    clearSession(storage);
    if (!token) return { success: true, alreadyLoggedOut: true };
    try { return await request({ action: "logoutAdmin", sessionToken: token }, fetchImpl); }
    catch (error) { return { success: false, error: error.message }; }
  }

  async function issueAppLaunch(appId, fetchImpl = global.fetch, storage = global.sessionStorage) {
    if (!appId) throw new Error("App ID is required");
    const payload = await request({ action: "issueAppLaunch", sessionToken: sessionToken(storage), appId }, fetchImpl);
    if (!payload.launchTicket || !payload.expiresAt) throw new Error("AVA App Admin launch was not authorized");
    return payload;
  }

  function adminEntryUrl(destination, launchTicket) {
    const url = new URL(destination, global.location?.href || "https://ava.invalid/");
    url.searchParams.set("avaAdminLaunch", launchTicket);
    return url.href;
  }

  global.AVAAdminAuth = Object.freeze({
    ENDPOINT, SESSION_KEY, SESSION_MAX_AGE_MS, sessionToken, clearSession,
    authenticate, logout, issueAppLaunch, adminEntryUrl
  });
})(typeof window === "undefined" ? globalThis : window);

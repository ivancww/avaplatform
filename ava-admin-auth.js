(function (global) {
  "use strict";

  const ENDPOINT = "https://script.google.com/macros/s/AKfycbzVf1fuxcq8GPSOzS8WvcAtubqaawFj0rbVjxe0LOLKfwbYkRZf7Vs61Q0T73UG6dznww/exec";
  const SESSION_KEY = "ava:platform:admin-session";
  const SESSION_MAX_AGE_MS = 30 * 60 * 1000;
  const BROWSER_CONTEXT_PREFIX = "ava-admin-session-v1:";
  const BROWSER_CONTEXT_APP_IDS = new Set(["medical", "5pay", "critical-illness"]);

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

  async function issueAdminSession(appId, fetchImpl = global.fetch, storage = global.sessionStorage) {
    if (!appId) throw new Error("App ID is required");
    const payload = await request({ action: "issueAdminSession", sessionToken: sessionToken(storage), appId }, fetchImpl);
    if (!payload.launchTicket || !payload.launchNonce || !payload.expiresAt || payload.contract !== "ava-admin-session-v1") throw new Error("AVA App Admin launch was not authorized");
    return payload;
  }

  async function requestAdminBrowserProof(launch, fetchImpl = global.fetch, storage = global.sessionStorage) {
    const payload = await request({ action: "requestAdminBrowserProof", sessionToken: sessionToken(storage), launchTicket: launch.launchTicket, appId: launch.appId, launchNonce: launch.launchNonce }, fetchImpl);
    if (!payload.browserProof || payload.appId !== launch.appId || payload.contract !== "ava-admin-session-v1") throw new Error("AVA browser binding was not established");
    return payload;
  }

  function adminEntryUrl(destination, launchTicket, launchNonce) {
    const url = new URL(destination, global.location?.href || "https://ava.invalid/");
    url.searchParams.set("avaAdminLaunch", launchTicket);
    url.searchParams.set("avaAdminLaunchNonce", launchNonce);
    return url.href;
  }

  function browserContextEnvelope(launch, browser) {
    return BROWSER_CONTEXT_PREFIX + JSON.stringify({
      type: "ava-admin-session-context",
      appId: launch.appId,
      launchTicket: launch.launchTicket,
      launchNonce: launch.launchNonce,
      browserProof: browser.browserProof,
      expiresAt: browser.expiresAt,
      contract: browser.contract
    });
  }

  async function launchAdminApp(appId, destination, fetchImpl = global.fetch, storage = global.sessionStorage) {
    // Reserve the child synchronously while still inside the user gesture.
    // Awaiting the ticket request first makes iOS/PWA browsers open a child
    // without a reliable opener, which breaks the browser-bound handshake.
    let child = null;
    try { child = global.open?.("", "_blank"); } catch (_) { child = null; }
    if (!child) throw new Error("AVA Admin App window was blocked; browser binding is required");
    try {
      const launch = { ...(await issueAdminSession(appId, fetchImpl, storage)), appId };
      const launchUrl = adminEntryUrl(destination, launch.launchTicket, launch.launchNonce);
      const targetOrigin = new URL(destination, global.location?.href || "https://ava.invalid/").origin;
      if (!BROWSER_CONTEXT_APP_IDS.has(appId)) {
        return await new Promise((resolve, reject) => {
          let settled = false;
          const finish = (error, value) => { if (settled) return; settled = true; global.removeEventListener?.("message", onMessage); global.clearTimeout?.(timer); if (error) reject(error); else resolve(value); };
          const timer = global.setTimeout(() => finish(new Error("AVA Admin browser binding expired")), Math.max(1000, new Date(launch.expiresAt).getTime() - Date.now()));
          const onMessage = event => {
            const data = event?.data || {};
            if (event.source !== child || event.origin !== targetOrigin || data.type !== "ava-admin-session-request") return;
            if (data.appId !== appId || data.launchTicket !== launch.launchTicket || data.launchNonce !== launch.launchNonce) return;
            requestAdminBrowserProof(launch, fetchImpl, storage).then(browser => {
              child.postMessage({ type: "ava-admin-session-response", appId, launchTicket: launch.launchTicket, launchNonce: launch.launchNonce, browserProof: browser.browserProof, expiresAt: browser.expiresAt, contract: browser.contract }, targetOrigin);
              finish(null, launch);
            }).catch(error => finish(error));
          };
          global.addEventListener?.("message", onMessage);
          try { child.location.href = launchUrl; } catch (error) { finish(error); }
        });
      }

      // Bind the one-time proof to the exact reserved browsing context before
      // navigation only for the Android-affected Apps. Working integrations
      // retain the original postMessage-only contract. window.name is never
      // placed in URL/referrer/storage and the destination clears it before
      // exchanging the proof with its server.
      const browser = await requestAdminBrowserProof(launch, fetchImpl, storage);
      child.name = browserContextEnvelope(launch, browser);
      let timer;
      const cleanup = () => { global.removeEventListener?.("message", onMessage); global.clearTimeout?.(timer); };
      const onMessage = event => {
        const data = event?.data || {};
        if (event.source !== child || event.origin !== targetOrigin || data.type !== "ava-admin-session-request") return;
        if (data.appId !== appId || data.launchTicket !== launch.launchTicket || data.launchNonce !== launch.launchNonce) return;
        child.postMessage({ type: "ava-admin-session-response", appId, launchTicket: launch.launchTicket, launchNonce: launch.launchNonce, browserProof: browser.browserProof, expiresAt: browser.expiresAt, contract: browser.contract }, targetOrigin);
        cleanup();
      };
      global.addEventListener?.("message", onMessage);
      timer = global.setTimeout(cleanup, Math.max(1000, new Date(launch.expiresAt).getTime() - Date.now()));
      child.location.href = launchUrl;
      return launch;
    } catch (error) {
      try { child.close?.(); } catch (_) { /* best effort */ }
      throw error;
    }
  }

  global.AVAAdminAuth = Object.freeze({
    ENDPOINT, SESSION_KEY, SESSION_MAX_AGE_MS, sessionToken, clearSession,
    authenticate, logout, issueAdminSession, requestAdminBrowserProof, launchAdminApp, adminEntryUrl,
    BROWSER_CONTEXT_PREFIX
  });
})(typeof window === "undefined" ? globalThis : window);

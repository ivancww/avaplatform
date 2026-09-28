(function (global) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const STATE_KEY = "ava:platform:notification-state-v1";
  const CACHE_KEY = "ava:platform:notification-feed-lkg-v1";
  const TYPES = Object.freeze(["new_app", "app_update", "platform_update", "announcement"]);
  const ACTIONS = Object.freeze(["view_app", "view_update", "add_to_home", "none"]);

  function bool(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return ["true", "yes", "1"].includes(value.trim().toLowerCase()) ? true : ["false", "no", "0", ""].includes(value.trim().toLowerCase()) ? false : fallback;
    return fallback;
  }

  function normalize(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = String(raw.notification_id ?? raw.notificationId ?? raw.id ?? "").trim();
    const type = String(raw.type ?? "").trim().toLowerCase();
    const actionType = String(raw.action_type ?? raw.actionType ?? "none").trim().toLowerCase();
    const title = String(raw.title ?? "").trim();
    const publishedAt = String(raw.published_at ?? raw.publishedAt ?? "").trim();
    if (!id || !TYPES.includes(type) || !title || !ACTIONS.includes(actionType) || !publishedAt || Number.isNaN(Date.parse(publishedAt))) return null;
    return {
      id: id.slice(0, 120), type, appId: String(raw.app_id ?? raw.appId ?? "").trim().slice(0, 120),
      title: title.slice(0, 160), summary: String(raw.summary ?? "").trim().slice(0, 1000),
      version: String(raw.version ?? "").trim().slice(0, 80), publishedAt,
      active: bool(raw.active, false), showPopup: bool(raw.show_popup ?? raw.showPopup, false), actionType,
      sortOrder: Number.isFinite(Number(raw.sort_order ?? raw.sortOrder)) ? Number(raw.sort_order ?? raw.sortOrder) : 0
    };
  }

  function parseFeed(rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map(normalize).filter(row => row && row.active).sort((a, b) => a.sortOrder - b.sortOrder || Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
  }

  function state(storage = global.localStorage) {
    try {
      const value = JSON.parse(storage.getItem(STATE_KEY));
      const readIds = Array.isArray(value?.readIds) ? value.readIds : [], promptedIds = Array.isArray(value?.promptedIds) ? value.promptedIds : [];
      return { schemaVersion: SCHEMA_VERSION, readIds: [...new Set(readIds.filter(id => typeof id === "string"))], promptedIds: [...new Set(promptedIds.filter(id => typeof id === "string"))], feedVersion: String(value?.feedVersion || "") };
    } catch (error) { return { schemaVersion: SCHEMA_VERSION, readIds: [], promptedIds: [], feedVersion: "" }; }
  }
  function saveState(next, storage = global.localStorage) { const value = { ...state(storage), ...next, schemaVersion: SCHEMA_VERSION }; storage.setItem(STATE_KEY, JSON.stringify(value)); return value; }
  function unread(feed, current = state()) { return feed.filter(item => !current.readIds.includes(item.id)); }
  function eligiblePrompt(feed, current = state()) { return feed.filter(item => item.showPopup && !current.promptedIds.includes(item.id)); }
  function markRead(ids, storage = global.localStorage) { const current = state(storage); return saveState({ readIds: [...new Set([...current.readIds, ...ids.filter(id => typeof id === "string")])] }, storage); }
  function markPrompted(ids, storage = global.localStorage) { const current = state(storage); return saveState({ promptedIds: [...new Set([...current.promptedIds, ...ids.filter(id => typeof id === "string")])] }, storage); }
  function cacheFeed(feed, storage = global.localStorage) { storage.setItem(CACHE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, notifications: feed })); return feed; }
  function readCache(storage = global.localStorage) { try { return parseFeed(JSON.parse(storage.getItem(CACHE_KEY))?.notifications); } catch (error) { return []; } }

  async function sync(options = {}) {
    const { endpoint, storage = global.localStorage, fetchImpl = global.fetch, timeoutMs = 8000 } = options;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = setTimeout(() => controller?.abort(), timeoutMs);
    try {
      const response = await fetchImpl(`${endpoint}?action=getNotifications`, { signal: controller?.signal, cache: "no-store" });
      if (!response.ok) throw new Error(`Notification feed HTTP ${response.status}`);
      const payload = await response.json();
      const rows = payload?.data?.notifications ?? payload?.notifications;
      if (payload?.success !== true || !Array.isArray(rows)) throw new Error("Invalid notification feed");
      const feed = parseFeed(rows); cacheFeed(feed, storage); return { feed, source: "cloud" };
    } catch (error) { const feed = readCache(storage); return { feed, source: feed.length ? "cache" : "empty", error }; }
    finally { clearTimeout(timer); }
  }

  global.AVANotifications = Object.freeze({ SCHEMA_VERSION, STATE_KEY, CACHE_KEY, TYPES, ACTIONS, normalize, parseFeed, state, saveState, unread, eligiblePrompt, markRead, markPrompted, cacheFeed, readCache, sync });
})(typeof window === "undefined" ? globalThis : window);

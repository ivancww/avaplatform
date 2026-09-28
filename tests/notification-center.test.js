const assert = require("node:assert/strict");
require("../notification-center.js");
const api = globalThis.AVANotifications;
const values = new Map();
const storage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
const rows = [
  { notification_id: "update-1", type: "platform_update", title: "AVA 更新", summary: "更新通知中心", published_at: "2026-09-28T00:00:00Z", active: "TRUE", show_popup: "TRUE", action_type: "view_update", sort_order: 1 },
  { notification_id: "bad", type: "unknown", title: "ignored", published_at: "bad", active: true, action_type: "none" },
  { notification_id: "inactive", type: "announcement", title: "hidden", published_at: "2026-09-28T00:00:00Z", active: false, action_type: "none" }
];
const feed = api.parseFeed(rows);
assert.equal(feed.length, 1);
assert.equal(api.unread(feed, api.state(storage)).length, 1);
assert.equal(api.eligiblePrompt(feed, api.state(storage)).length, 1);
api.markPrompted(["update-1"], storage);
assert.equal(api.eligiblePrompt(feed, api.state(storage)).length, 0);
assert.equal(api.unread(feed, api.state(storage)).length, 1);
api.markRead(["update-1"], storage);
assert.equal(api.unread(feed, api.state(storage)).length, 0);
console.log("Notification feed validation, inactive filtering and local read/prompt state passed");

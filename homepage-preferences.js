(function (global) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "ava:platform:homepage-preference";

  function cleanStrings(values) {
    return Array.isArray(values) ? values.filter(value => typeof value === "string") : [];
  }

  function normalizePersonalCard(card) {
    if (!card || typeof card !== "object" || typeof card.id !== "string") return null;
    return {
      id: card.id,
      emoji: typeof card.emoji === "string" ? card.emoji.slice(0, 8) : "📌",
      title: typeof card.title === "string" ? card.title.slice(0, 80) : "",
      content: typeof card.content === "string" ? card.content.slice(0, 500) : "",
      category: typeof card.category === "string" ? card.category.slice(0, 50) : "",
      createdAt: typeof card.createdAt === "string" ? card.createdAt : new Date().toISOString(),
      updatedAt: typeof card.updatedAt === "string" ? card.updatedAt : new Date().toISOString()
    };
  }

  function normalizePreference(value) {
    const input = value && typeof value === "object" ? value : {};
    return {
      schemaVersion: SCHEMA_VERSION,
      hiddenOfficialIds: cleanStrings(input.hiddenOfficialIds),
      shownOfficialIds: cleanStrings(input.shownOfficialIds),
      officialOrder: cleanStrings(input.officialOrder),
      cardOrder: cleanStrings(input.cardOrder),
      personalCards: Array.isArray(input.personalCards) ? input.personalCards.map(normalizePersonalCard).filter(Boolean) : []
    };
  }

  function merge(cloudDefault, preference) {
    const official = Array.isArray(cloudDefault?.items) ? cloudDefault.items.filter(item => item && typeof item.id === "string") : [];
    const personal = normalizePreference(preference);
    const byId = new Map(official.map(item => [item.id, item]));
    const defaultOrder = official.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map(item => item.id);
    const officialOrder = [...personal.officialOrder.filter(id => byId.has(id)), ...defaultOrder.filter(id => !personal.officialOrder.includes(id))];
    const hidden = new Set(personal.hiddenOfficialIds);
    const shown = new Set(personal.shownOfficialIds);
    const visibleOfficial = officialOrder.filter(id => {
      const item = byId.get(id);
      return !hidden.has(id) && (shown.has(id) || item.defaultVisible !== false);
    });
    const personalIds = personal.personalCards.map(card => card.id);
    const naturalCardOrder = [...visibleOfficial.map(id => `official:${id}`), ...personalIds.map(id => `personal:${id}`)];
    const cardOrder = [...personal.cardOrder.filter(key => naturalCardOrder.includes(key)), ...naturalCardOrder.filter(key => !personal.cardOrder.includes(key))];
    return { cloudVersion: cloudDefault?.version || "local", official, officialOrder, visibleOfficial, personalCards: personal.personalCards, cardOrder, preference: personal };
  }

  function isSafeHttpUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try { return ["http:", "https:"].includes(new URL(value.trim()).protocol); }
    catch (error) { return false; }
  }

  function greetingForHour(hour) {
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
  }

  function load(storage) {
    try { return normalizePreference(JSON.parse(storage.getItem(STORAGE_KEY))); }
    catch (error) { return normalizePreference(); }
  }

  function save(storage, preference) {
    const normalized = normalizePreference(preference);
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  global.AVAHomepage = Object.freeze({ SCHEMA_VERSION, STORAGE_KEY, normalizePreference, merge, isSafeHttpUrl, greetingForHour, load, save });
})(typeof window === "undefined" ? globalThis : window);

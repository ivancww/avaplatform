(function (global) {
  "use strict";

  const SCHEMA_VERSION = 2;
  const STORAGE_KEY = "ava:platform:homepage-preference";
  const AREAS = Object.freeze(["area-1", "area-2", "area-3"]);

  function text(value, length) { return typeof value === "string" ? value.slice(0, length) : ""; }
  function strings(values) { return [...new Set(Array.isArray(values) ? values.filter(value => typeof value === "string") : [])]; }
  function area(value, fallback = AREAS[0]) { return AREAS.includes(value) ? value : fallback; }
  function number(value, fallback) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }

  function normalizePersonalCard(card, index = 0) {
    if (!card || typeof card !== "object" || typeof card.id !== "string") return null;
    return {
      id: card.id,
      emoji: text(card.emoji, 8) || "📌",
      title: text(card.title, 80),
      subtitle: text(card.subtitle, 240),
      content: text(card.content, 1000),
      category: text(card.category, 50),
      areaId: area(card.areaId),
      order: number(card.order, index),
      createdAt: text(card.createdAt, 40) || new Date().toISOString(),
      updatedAt: text(card.updatedAt, 40) || new Date().toISOString()
    };
  }

  function normalizeOverride(value) {
    if (!value || typeof value !== "object") return {};
    const result = {};
    if (typeof value.title === "string") result.title = text(value.title, 80);
    if (typeof value.subtitle === "string") result.subtitle = text(value.subtitle, 240);
    if (typeof value.emoji === "string") result.emoji = text(value.emoji, 8);
    if (AREAS.includes(value.areaId)) result.areaId = value.areaId;
    if (Number.isFinite(Number(value.order))) result.order = Number(value.order);
    if (typeof value.visible === "boolean") result.visible = value.visible;
    return result;
  }

  function normalizePreference(value) {
    const input = value && typeof value === "object" ? value : {};
    const overrides = {};
    Object.entries(input.officialOverrides || {}).forEach(([id, override]) => { overrides[id] = normalizeOverride(override); });
    // Migrate v1 visibility and ordering without reviving cloud-deleted cards.
    strings(input.hiddenOfficialIds).forEach(id => { overrides[id] = { ...(overrides[id] || {}), visible: false }; });
    strings(input.shownOfficialIds).forEach(id => { overrides[id] = { ...(overrides[id] || {}), visible: true }; });
    strings(input.officialOrder).forEach((id, index) => { overrides[id] = { ...(overrides[id] || {}), order: index }; });
    const legacyOrder = input.schemaVersion === SCHEMA_VERSION ? [] : strings(input.cardOrder);
    legacyOrder.forEach((key, index) => { if (key.startsWith("official:")) { const id = key.slice(9); overrides[id] = { ...(overrides[id] || {}), order: index }; } });
    const personalCards = Array.isArray(input.personalCards) ? input.personalCards.map(normalizePersonalCard).filter(Boolean).map(card => {
      const legacyIndex = legacyOrder.indexOf(`personal:${card.id}`);
      return legacyIndex < 0 ? card : { ...card, order: legacyIndex };
    }) : [];
    return {
      schemaVersion: SCHEMA_VERSION,
      officialOverrides: overrides,
      personalCards,
      expandedAreas: strings(input.expandedAreas).filter(id => AREAS.includes(id))
    };
  }

  function merge(cloudDefault, preference) {
    const personal = normalizePreference(preference);
    const official = (Array.isArray(cloudDefault?.items) ? cloudDefault.items : []).filter(item => item && typeof item.id === "string").map((item, index) => {
      const override = personal.officialOverrides[item.id] || {};
      return {
        ...item,
        title: override.title ?? item.title,
        subtitle: override.subtitle ?? item.subtitle,
        emoji: override.emoji ?? item.emoji,
        areaId: area(override.areaId, area(item.areaId || item.defaultArea)),
        order: number(override.order, number(item.order, index)),
        visible: override.visible ?? item.defaultVisible !== false,
        personalOverride: override
      };
    });
    const cards = [
      ...official.filter(card => card.visible).map(card => ({ ...card, kind: "official", key: `official:${card.id}` })),
      ...personal.personalCards.map(card => ({ ...card, kind: "personal", key: `personal:${card.id}`, visible: true }))
    ].sort((a, b) => {
      const areaDifference = AREAS.indexOf(a.areaId) - AREAS.indexOf(b.areaId);
      if (areaDifference) return areaDifference;
      return a.order - b.order;
    });
    const areas = Object.fromEntries(AREAS.map(id => [id, cards.filter(card => card.areaId === id)]));
    return { cloudVersion: cloudDefault?.version || "local", official, visibleOfficial: official.filter(card => card.visible).map(card => card.id), personalCards: personal.personalCards, cards, areas, preference: personal };
  }

  function updateCardPosition(preference, kind, id, areaId, order) {
    const next = normalizePreference(preference);
    if (kind === "official") next.officialOverrides[id] = { ...(next.officialOverrides[id] || {}), areaId: area(areaId), order: number(order, 0) };
    else next.personalCards = next.personalCards.map(card => card.id === id ? { ...card, areaId: area(areaId), order: number(order, 0), updatedAt: new Date().toISOString() } : card);
    return next;
  }

  function isSafeHttpUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try { return ["http:", "https:"].includes(new URL(value.trim()).protocol); } catch (error) { return false; }
  }
  function greetingForHour(hour) { if (hour >= 5 && hour < 12) return "Good morning"; if (hour >= 12 && hour < 17) return "Good afternoon"; if (hour >= 17 && hour < 22) return "Good evening"; return "Good night"; }
  function load(storage) { try { return normalizePreference(JSON.parse(storage.getItem(STORAGE_KEY))); } catch (error) { return normalizePreference(); } }
  function save(storage, preference) { const normalized = normalizePreference(preference); storage.setItem(STORAGE_KEY, JSON.stringify(normalized)); return normalized; }

  global.AVAHomepage = Object.freeze({ SCHEMA_VERSION, STORAGE_KEY, AREAS, normalizePersonalCard, normalizePreference, merge, updateCardPosition, isSafeHttpUrl, greetingForHour, load, save });
})(typeof window === "undefined" ? globalThis : window);

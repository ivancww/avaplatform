(function (global) {
  "use strict";

  const SCHEMA_VERSION = 3;
  const STORAGE_KEY = "ava:platform:homepage-preference";
  const AREAS = Object.freeze(["area-1", "area-2", "area-3"]);
  const OFFICIAL_AREA_NAMES = Object.freeze({ "area-1": "Area 1", "area-2": "Area 2", "area-3": "Area 3" });

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
    if (typeof value.folderId === "string") result.folderId = text(value.folderId, 80);
    if (Number.isFinite(Number(value.order))) result.order = Number(value.order);
    if (typeof value.visible === "boolean") result.visible = value.visible;
    return result;
  }

  function normalizeAreaOverrides(value) {
    const result = {};
    if (!value || typeof value !== "object") return result;
    AREAS.forEach(id => { if (typeof value[id] === "string" && value[id].trim()) result[id] = text(value[id].trim(), 80); });
    return result;
  }

  function normalizeFolder(folder, index = 0) {
    if (!folder || typeof folder !== "object" || typeof folder.id !== "string" || !folder.id) return null;
    return {
      id: text(folder.id, 80),
      name: text(folder.name, 80).trim() || "新資料夾",
      areaId: area(folder.areaId),
      order: number(folder.order, index),
      moduleIds: [...new Set(Array.isArray(folder.moduleIds) ? folder.moduleIds.filter(id => typeof id === "string" && id).map(id => text(id, 80)) : [])]
    };
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
      areaOverrides: normalizeAreaOverrides(input.areaOverrides),
      folders: Array.isArray(input.folders) ? input.folders.map(normalizeFolder).filter(Boolean) : [],
      personalCards,
      expandedAreas: strings(input.expandedAreas).filter(id => AREAS.includes(id))
    };
  }

  function merge(cloudDefault, preference) {
    const personal = normalizePreference(preference);
    const official = (Array.isArray(cloudDefault?.items) ? cloudDefault.items : []).filter(item => item && typeof item.id === "string").map((item, index) => {
      const override = personal.officialOverrides[item.id] || {};
      const folder = personal.folders.find(candidate => candidate.moduleIds.includes(item.id));
      return {
        ...item,
        title: override.title ?? item.title,
        subtitle: override.subtitle ?? item.subtitle,
        emoji: override.emoji ?? item.emoji,
        areaId: area(override.areaId, area(item.areaId || item.defaultArea)),
        order: number(override.order, number(item.order, index)),
        visible: override.visible ?? item.defaultVisible !== false,
        folderId: override.folderId || folder?.id || "",
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
    const areas = Object.fromEntries(AREAS.map(id => [id, cards.filter(card => card.areaId === id && !card.folderId)]));
    const folders = personal.folders.map(folder => ({ ...folder, cards: folder.moduleIds.map(id => cards.find(card => card.id === id)).filter(Boolean) })).sort((a, b) => a.areaId.localeCompare(b.areaId) || a.order - b.order);
    const areaNames = Object.fromEntries(AREAS.map(id => [id, personal.areaOverrides[id] || OFFICIAL_AREA_NAMES[id]]));
    return { cloudVersion: cloudDefault?.version || "local", official, visibleOfficial: official.filter(card => card.visible).map(card => card.id), personalCards: personal.personalCards, cards, areas, folders, areaNames, preference: personal };
  }

  function updateCardPosition(preference, kind, id, areaId, order) {
    const next = normalizePreference(preference);
    if (kind === "official") next.officialOverrides[id] = { ...(next.officialOverrides[id] || {}), areaId: area(areaId), order: number(order, 0) };
    else next.personalCards = next.personalCards.map(card => card.id === id ? { ...card, areaId: area(areaId), order: number(order, 0), updatedAt: new Date().toISOString() } : card);
    return next;
  }

  function updateAreaName(preference, areaId, name) {
    const next = normalizePreference(preference);
    if (!AREAS.includes(areaId)) return next;
    const value = text(name, 80).trim();
    if (value && value !== OFFICIAL_AREA_NAMES[areaId]) next.areaOverrides[areaId] = value;
    else delete next.areaOverrides[areaId];
    return next;
  }

  function upsertFolder(preference, folder) {
    const next = normalizePreference(preference);
    const normalized = normalizeFolder(folder, next.folders.length);
    if (!normalized) return next;
    const exists = next.folders.some(item => item.id === normalized.id);
    next.folders = exists ? next.folders.map(item => item.id === normalized.id ? normalized : item) : [...next.folders, normalized];
    return next;
  }

  function deleteFolder(preference, folderId) {
    const next = normalizePreference(preference);
    next.folders = next.folders.filter(folder => folder.id !== folderId);
    Object.keys(next.officialOverrides).forEach(id => { if (next.officialOverrides[id].folderId === folderId) delete next.officialOverrides[id].folderId; });
    return next;
  }

  function reorderFolder(preference, folderId, areaId, order) {
    const next = normalizePreference(preference);
    next.folders = next.folders.map(folder => folder.id === folderId ? { ...folder, areaId: area(areaId), order: number(order, folder.order) } : folder);
    return next;
  }

  function updateFolderModules(preference, folderId, moduleIds) {
    const next = normalizePreference(preference);
    next.folders = next.folders.map(folder => folder.id === folderId ? { ...folder, moduleIds: [...new Set(moduleIds.filter(id => typeof id === "string"))] } : { ...folder, moduleIds: folder.moduleIds.filter(id => !moduleIds.includes(id)) });
    return next;
  }

  function reorderFolderModule(preference, folderId, moduleId, target) {
    const next = normalizePreference(preference);
    const folder = next.folders.find(item => item.id === folderId);
    if (!folder) return next;
    const ids = folder.moduleIds.filter(id => id !== moduleId);
    ids.splice(Math.max(0, Math.min(target, ids.length)), 0, moduleId);
    return updateFolderModules(next, folderId, ids);
  }

  function isSafeHttpUrl(value) {
    if (typeof value !== "string" || !value.trim()) return false;
    try { return ["http:", "https:"].includes(new URL(value.trim()).protocol); } catch (error) { return false; }
  }
  function greetingForHour(hour) { if (hour >= 5 && hour < 12) return "Good morning"; if (hour >= 12 && hour < 17) return "Good afternoon"; if (hour >= 17 && hour < 22) return "Good evening"; return "Good night"; }
  function load(storage) { try { return normalizePreference(JSON.parse(storage.getItem(STORAGE_KEY))); } catch (error) { return normalizePreference(); } }
  function save(storage, preference) { const normalized = normalizePreference(preference); storage.setItem(STORAGE_KEY, JSON.stringify(normalized)); return normalized; }

  global.AVAHomepage = Object.freeze({ SCHEMA_VERSION, STORAGE_KEY, AREAS, OFFICIAL_AREA_NAMES, normalizePersonalCard, normalizeFolder, normalizePreference, merge, updateCardPosition, updateAreaName, upsertFolder, deleteFolder, reorderFolder, updateFolderModules, reorderFolderModule, isSafeHttpUrl, greetingForHour, load, save });
})(typeof window === "undefined" ? globalThis : window);

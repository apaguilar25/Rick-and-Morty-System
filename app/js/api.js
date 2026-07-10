// API Rick and Morty con caché en localStorage (modo offline)
(function () {
  const BASE = 'https://rickandmortyapi.com/api';
  const CACHE_PREFIX = 'ram_cache_';
  const OVERRIDES_KEY = 'ram_overrides'; // ediciones locales

  function cacheKey(url) { return CACHE_PREFIX + url; }

  async function fetchWithCache(url) {
    const key = cacheKey(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), data })); } catch {}
      return { data, fromCache: false };
    } catch (err) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try { return { data: JSON.parse(raw).data, fromCache: true }; } catch {}
      }
      throw err;
    }
  }

  function getOverrides(kind) {
    try {
      const all = JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {};
      return all[kind] || {};
    } catch { return {}; }
  }
  function saveOverride(kind, id, patch) {
    const all = (function () {
      try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY)) || {}; }
      catch { return {}; }
    })();
    all[kind] = all[kind] || {};
    all[kind][id] = { ...(all[kind][id] || {}), ...patch };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
  }
  function applyOverride(kind, item) {
    const ov = getOverrides(kind)[item.id];
    return ov ? { ...item, ...ov } : item;
  }

  async function fetchAll(kind) {
    // Descarga todas las páginas y aplica overrides
    let url = `${BASE}/${kind}?page=1`;
    let results = [];
    let anyCache = false;
    while (url) {
      const { data, fromCache } = await fetchWithCache(url);
      if (fromCache) anyCache = true;
      results = results.concat(data.results || []);
      url = data.info && data.info.next;
      if (fromCache && !data.info) break;
    }
    results = results.map(r => applyOverride(kind, r));
    return { results, fromCache: anyCache };
  }

  async function fetchOne(kind, id) {
    const { data, fromCache } = await fetchWithCache(`${BASE}/${kind}/${id}`);
    return { data: applyOverride(kind, data), fromCache };
  }

  window.API = { fetchAll, fetchOne, saveOverride, getOverrides };
})();

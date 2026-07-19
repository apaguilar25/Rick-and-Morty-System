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
    // Descarga página 1 para saber el total, luego el resto en paralelo.
    // Si alguna página falla, seguimos con las que sí cargaron.
    let results = [];
    let anyCache = false;
    let firstPage;
    try {
      firstPage = await fetchWithCache(`${BASE}/${kind}?page=1`);
    } catch (e) {
      throw e; // sin página 1 no hay nada
    }
    if (firstPage.fromCache) anyCache = true;
    results = results.concat(firstPage.data.results || []);
    const totalPages = (firstPage.data.info && firstPage.data.info.pages) || 1;

    const pageNums = [];
    for (let p = 2; p <= totalPages; p++) pageNums.push(p);

    const settled = await Promise.allSettled(
      pageNums.map(p => fetchWithCache(`${BASE}/${kind}?page=${p}`))
    );
    settled.forEach(s => {
      if (s.status === 'fulfilled') {
        if (s.value.fromCache) anyCache = true;
        results = results.concat(s.value.data.results || []);
      } else {
        anyCache = true; // marcamos que hubo datos incompletos/parciales
      }
    });

    results = results.map(r => applyOverride(kind, r));
    return { results, fromCache: anyCache };
  }

  async function fetchOne(kind, id) {
    const { data, fromCache } = await fetchWithCache(`${BASE}/${kind}/${id}`);
    return { data: applyOverride(kind, data), fromCache };
  }

  window.API = { fetchAll, fetchOne, saveOverride, getOverrides };
})();

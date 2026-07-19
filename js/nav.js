// Header/navegación compartida + banner offline
(function () {
  function render() {
    const header = document.getElementById('appHeader');
    if (!header) return;
    const session = window.Auth && window.Auth.session();
    const path = location.pathname;
    const link = (href, label) => {
      const active = path.endsWith(href) ? 'active' : '';
      return `<a href="${href}" class="${active}">${label}</a>`;
    };
    header.innerHTML = `
      <div id="offlineBanner" class="offline-banner" style="display:none;">Sin conexión — mostrando datos en caché</div>
      <nav class="nav" aria-label="Principal">
        <a class="brand" href="/characters.html">
          <span class="portal" aria-hidden="true"></span>
          <span>Rick &amp; Morty <span class="acento-oliva">System</span></span>
        </a>

        <div class="nav-links">
          ${link('/characters.html', 'Personajes')}
          ${link('/episodes.html', 'Episodios')}
        </div>
        <div class="nav-actions">
          ${session ? `<span class="user-chip">Hola, <strong>${session.username}</strong></span>` : ''}
          <button id="themeBtn" class="btn btn-icon" aria-label="Cambiar tema" title="Cambiar tema">🌙</button>
          ${session ? `<button id="logoutBtn" class="btn btn-ghost">Salir</button>` : ''}
        </div>
      </nav>
    `;
    // #themeBtn se maneja por delegación en theme.js; solo refrescamos el ícono.
    if (window.Theme && window.Theme.refreshButton) window.Theme.refreshButton();
    const lo = document.getElementById('logoutBtn');
    if (lo) lo.addEventListener('click', () => window.Auth.logout());
    updateOffline();
  }

  function updateOffline() {
    const b = document.getElementById('offlineBanner');
    if (!b) return;
    b.style.display = navigator.onLine ? 'none' : 'block';
  }

  window.addEventListener('online', updateOffline);
  window.addEventListener('offline', updateOffline);
  document.addEventListener('DOMContentLoaded', render);
})();

// Selector de tema claro/oscuro con variables CSS
(function () {
  const KEY = 'ram_theme';
  const saved = localStorage.getItem(KEY);
  const initial = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);

  function updateBtn() {
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = window.Theme.current() === 'dark' ? '☀️' : '🌙';
  }

  window.Theme = {
    toggle() {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem(KEY, cur);
      updateBtn();
    },
    current() { return document.documentElement.getAttribute('data-theme'); },
    refreshButton: updateBtn
  };

  // Delegación: un único listener en document maneja cualquier #themeBtn,
  // incluso si el header se renderiza después (nav.js).
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.closest && t.closest('#themeBtn')) window.Theme.toggle();
  });

  document.addEventListener('DOMContentLoaded', updateBtn);
})();

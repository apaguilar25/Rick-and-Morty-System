// Autenticación con localStorage (datos simulados)
(function () {
  const USERS_KEY = 'ram_users';
  const SESSION_KEY = 'ram_session';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  // Seed demo user una sola vez
  if (!localStorage.getItem(USERS_KEY)) {
    saveUsers([{ username: 'rick', email: 'rick@c137.com', password: 'wubbalubba' }]);
  }

  const Auth = {
    login(identifier, password) {
      const u = getUsers().find(x =>
        (x.username === identifier || x.email === identifier) && x.password === password
      );
      if (!u) return { ok: false, error: 'Credenciales inválidas' };
      localStorage.setItem(SESSION_KEY, JSON.stringify({ username: u.username, email: u.email }));
      return { ok: true };
    },
    register({ username, email, password }) {
      const users = getUsers();
      if (users.some(u => u.username === username)) return { ok: false, error: 'El usuario ya existe' };
      if (users.some(u => u.email === email)) return { ok: false, error: 'El email ya está registrado' };
      users.push({ username, email, password });
      saveUsers(users);
      return { ok: true };
    },
    recover(email, newPassword) {
      const users = getUsers();
      const i = users.findIndex(u => u.email === email);
      if (i === -1) return { ok: false, error: 'No existe una cuenta con ese email' };
      users[i].password = newPassword;
      saveUsers(users);
      return { ok: true };
    },
    logout() { localStorage.removeItem(SESSION_KEY); location.href = '/app/login.html'; },
    session() {
      try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
      catch { return null; }
    },
    require() {
      if (!Auth.session()) location.href = '/app/login.html';
    }
  };

  window.Auth = Auth;
})();

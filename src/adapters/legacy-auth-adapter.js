(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};
  let active = false;
  let cleanupTasks = [];

  function byId(id) {
    return document.getElementById(id);
  }

  function currentDatabase() {
    return AP.database.read();
  }

  function currentAccount() {
    const userId = AP.auth.readSession();
    return currentDatabase().users.find((account) => account.id === userId) || null;
  }

  function bindTabs() {
    document.querySelectorAll('.tab[data-auth]').forEach((button) => {
      const handler = () => {
        document.querySelectorAll('.tab[data-auth]').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        const mode = button.dataset.auth;
        byId('loginForm')?.classList.toggle('hidden', mode !== 'login');
        byId('registerForm')?.classList.toggle('hidden', mode !== 'register');
      };
      button.addEventListener('click', handler);
      cleanupTasks.push(() => button.removeEventListener('click', handler));
    });
  }

  function bindProfileChoice() {
    document.querySelectorAll('[data-entry]').forEach((button) => {
      const handler = () => {
        document.querySelectorAll('[data-entry]').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');

        const advertiser = button.dataset.entry === 'advertiser';
        const userCheckbox = byId('regAsUser');
        const advertiserCheckbox = byId('regAsAdvertiser');
        if (userCheckbox) userCheckbox.checked = true;
        if (advertiserCheckbox) advertiserCheckbox.checked = advertiser;
      };
      button.addEventListener('click', handler);
      cleanupTasks.push(() => button.removeEventListener('click', handler));
    });
  }

  function login(email, password) {
    const account = AP.auth.findAccountByCredentials(currentDatabase(), email, password);
    if (!account) return { ok: false, error: 'invalid-credentials' };

    AP.auth.saveSession(account.id);
    AP.database.audit('auth:login', {}, account.id);
    AP.events.emit('auth:login-success', { account });
    return { ok: true, account };
  }

  function register(input) {
    const database = currentDatabase();
    if (AP.auth.emailExists(database, input.email)) {
      return { ok: false, error: 'email-exists' };
    }

    const account = AP.auth.buildAccount(input);
    database.users.push(account);
    AP.database.write(database);
    AP.auth.saveSession(account.id);
    AP.database.audit('auth:register', { roles: account.roles }, account.id);
    AP.events.emit('auth:register-success', { account });
    return { ok: true, account };
  }

  function logout() {
    const account = currentAccount();
    AP.auth.clearSession();
    AP.events.emit('auth:logout', { accountId: account?.id || null });
  }

  function start() {
    if (active) return;
    active = true;
    bindTabs();
    bindProfileChoice();
    AP.logger?.info('Adaptador legado de autenticação preparado.');
  }

  function stop() {
    cleanupTasks.forEach((cleanup) => cleanup());
    cleanupTasks = [];
    active = false;
  }

  AP.legacyAuthAdapter = Object.freeze({
    start,
    stop,
    login,
    register,
    logout,
    currentAccount,
    isActive: () => active
  });
})(window);

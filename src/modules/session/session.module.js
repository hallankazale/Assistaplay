(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function getCurrentUserId() {
    return AP.auth.readSession();
  }

  function getCurrentAccount() {
    const userId = getCurrentUserId();
    if (!userId) return null;
    return AP.database.findUserById(userId);
  }

  function isAuthenticated() {
    return Boolean(getCurrentAccount());
  }

  function login(account) {
    if (!account?.id) throw new Error('Conta inválida para iniciar sessão.');
    AP.auth.saveSession(account.id);
    AP.events.emit('session:started', { accountId: account.id });
    return account;
  }

  function logout() {
    const account = getCurrentAccount();
    AP.auth.clearSession();
    AP.events.emit('session:ended', { accountId: account?.id || null });
    return account;
  }

  AP.engine.register('session', {
    start() {
      AP.logger.info('Módulo de sessão iniciado.', {
        authenticated: isAuthenticated()
      });
    },
    api: {
      getCurrentUserId,
      getCurrentAccount,
      isAuthenticated,
      login,
      logout
    }
  });
})(window);

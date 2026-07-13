(function (global) {
  'use strict';

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function findAccountByCredentials(database, email, password) {
    const normalizedEmail = normalizeEmail(email);
    return database?.users?.find(
      (account) => account.email === normalizedEmail && account.password === password
    ) || null;
  }

  function emailExists(database, email) {
    const normalizedEmail = normalizeEmail(email);
    return Boolean(database?.users?.some((account) => account.email === normalizedEmail));
  }

  function buildAccount({ id, name, email, password, roles }) {
    const safeRoles = Array.isArray(roles) && roles.length ? [...new Set(roles)] : ['user'];

    return {
      id,
      name: String(name || '').trim(),
      email: normalizeEmail(email),
      password,
      roles: safeRoles,
      points: 0,
      interests: {}
    };
  }

  function saveSession(userId) {
    const key = global.AssistaPay?.config?.storage?.currentUserKey || 'assistapay_current_user';
    global.AssistaPay?.storage?.setText(key, userId);
  }

  function readSession() {
    const key = global.AssistaPay?.config?.storage?.currentUserKey || 'assistapay_current_user';
    return global.AssistaPay?.storage?.getText(key, null) || null;
  }

  function clearSession() {
    const key = global.AssistaPay?.config?.storage?.currentUserKey || 'assistapay_current_user';
    global.AssistaPay?.storage?.remove(key);
  }

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.auth = Object.freeze({
    normalizeEmail,
    findAccountByCredentials,
    emailExists,
    buildAccount,
    saveSession,
    readSession,
    clearSession
  });
})(window);

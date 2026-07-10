(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function sessionApi() {
    const api = AP.engine.get('session');
    if (!api) throw new Error('O módulo de sessão precisa estar registrado antes da autenticação.');
    return api;
  }

  function validateRegistration(input) {
    const errors = [];
    const name = String(input?.name || '').trim();
    const email = AP.auth.normalizeEmail(input?.email);
    const password = String(input?.password || '');
    const roles = Array.isArray(input?.roles) ? [...new Set(input.roles)] : [];

    if (name.length < 2) errors.push('name-too-short');
    if (!email || !email.includes('@')) errors.push('invalid-email');
    if (password.length < 4) errors.push('password-too-short');
    if (!roles.length) roles.push('user');

    return { valid: errors.length === 0, errors, value: { name, email, password, roles } };
  }

  function signIn(email, password) {
    const database = AP.database.read();
    const account = AP.auth.findAccountByCredentials(database, email, password);

    if (!account) {
      AP.events.emit('auth:failed', { reason: 'invalid-credentials' });
      return { ok: false, error: 'invalid-credentials' };
    }

    sessionApi().login(account);
    AP.database.audit('auth:login', {}, account.id);
    AP.events.emit('auth:signed-in', { accountId: account.id, roles: account.roles });
    return { ok: true, account };
  }

  function signUp(input) {
    const validation = validateRegistration(input);
    if (!validation.valid) {
      AP.events.emit('auth:failed', { reason: 'invalid-registration', errors: validation.errors });
      return { ok: false, error: 'invalid-registration', errors: validation.errors };
    }

    const database = AP.database.read();
    if (AP.auth.emailExists(database, validation.value.email)) {
      AP.events.emit('auth:failed', { reason: 'email-exists' });
      return { ok: false, error: 'email-exists' };
    }

    const account = AP.auth.buildAccount({
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      ...validation.value
    });

    database.users.push(account);
    AP.database.write(database);
    sessionApi().login(account);
    AP.database.audit('auth:register', { roles: account.roles }, account.id);
    AP.events.emit('auth:signed-up', { accountId: account.id, roles: account.roles });
    return { ok: true, account };
  }

  function signOut() {
    const account = sessionApi().logout();
    AP.events.emit('auth:signed-out', { accountId: account?.id || null });
    return { ok: true, account };
  }

  AP.engine.register('auth-module', {
    start() {
      AP.logger.info('Módulo de autenticação iniciado.');
    },
    api: {
      validateRegistration,
      signIn,
      signUp,
      signOut
    }
  });
})(window);

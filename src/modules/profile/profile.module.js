(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function sessionApi() {
    const api = AP.engine.get('session');
    if (!api) throw new Error('O módulo de sessão precisa estar disponível.');
    return api;
  }

  function getProfile() {
    const account = sessionApi().getCurrentAccount();
    if (!account) return null;

    const database = AP.database.read();
    const orders = database.orders.filter((order) => order.buyerId === account.id);
    const withdrawals = database.withdrawals.filter((item) => item.userId === account.id);
    const interests = account.interests || {};
    const topInterest = Object.entries(interests).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      id: account.id,
      name: account.name,
      email: account.email,
      roles: AP.permissions.rolesOf(account),
      points: Number(account.points || 0),
      topInterest,
      orderCount: orders.length,
      withdrawalCount: withdrawals.length
    };
  }

  function updateProfile(changes = {}) {
    const account = sessionApi().getCurrentAccount();
    if (!account) return { ok: false, error: 'not-authenticated' };

    const allowed = {};
    if (typeof changes.name === 'string' && changes.name.trim().length >= 2) {
      allowed.name = changes.name.trim();
    }

    if (!Object.keys(allowed).length) {
      return { ok: false, error: 'no-valid-changes' };
    }

    AP.database.transaction((database) => {
      const target = database.users.find((user) => user.id === account.id);
      Object.assign(target, allowed);
    });

    AP.database.audit('profile:updated', { fields: Object.keys(allowed) }, account.id);
    AP.events.emit('profile:updated', { accountId: account.id, changes: allowed });
    return { ok: true, profile: getProfile() };
  }

  AP.engine.register('profile', {
    start() {
      AP.logger.info('Módulo de perfil iniciado.');
    },
    api: { getProfile, updateProfile }
  });
})(window);

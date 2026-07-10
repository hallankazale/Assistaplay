(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function validateProduct(input = {}) {
    const errors = [];
    const name = String(input.name || '').trim();
    const price = Number(input.price || 0);
    const stock = Number(input.stock || 0);
    const commissionPercent = Number(input.commissionPercent || 0);

    if (name.length < 2) errors.push('invalid-name');
    if (price <= 0) errors.push('invalid-price');
    if (!Number.isInteger(stock) || stock < 0) errors.push('invalid-stock');
    if (commissionPercent < 0 || commissionPercent > 80) errors.push('invalid-commission');

    return {
      valid: errors.length === 0,
      errors,
      value: {
        name,
        desc: String(input.desc || '').trim(),
        category: String(input.category || 'Outros'),
        price,
        stock,
        commissionPercent,
        checkoutLink: String(input.checkoutLink || '').trim()
      }
    };
  }

  function create(advertiserId, input) {
    const account = AP.database.findUserById(advertiserId);
    if (!account || (!AP.permissions.hasRole(account, 'advertiser') && !AP.permissions.hasRole(account, 'admin'))) {
      return { ok: false, error: 'advertiser-required' };
    }

    const validation = validateProduct(input);
    if (!validation.valid) return { ok: false, error: 'invalid-product', errors: validation.errors };

    const product = {
      id: `product_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      advertiserId,
      ...validation.value,
      status: 'active',
      sales: 0,
      affiliates: [],
      createdAt: new Date().toISOString()
    };

    AP.database.transaction((database) => {
      database.products.push(product);
      database.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action: 'product:created',
        actorId: advertiserId,
        details: { productId: product.id },
        createdAt: new Date().toISOString()
      });
    });

    AP.events.emit('product:created', product);
    return { ok: true, product };
  }

  function list(options = {}) {
    const database = AP.database.read();
    return database.products.filter((product) => {
      if (options.advertiserId && product.advertiserId !== options.advertiserId) return false;
      if (options.status && product.status !== options.status) return false;
      if (options.category && product.category !== options.category) return false;
      return true;
    });
  }

  function update(actorId, productId, changes = {}) {
    const actor = AP.database.findUserById(actorId);
    const database = AP.database.read();
    const current = database.products.find((product) => product.id === productId);
    if (!actor || !current) return { ok: false, error: 'not-found' };
    if (current.advertiserId !== actorId && !AP.permissions.hasRole(actor, 'admin')) {
      return { ok: false, error: 'permission-denied' };
    }

    const merged = { ...current, ...changes };
    const validation = validateProduct(merged);
    if (!validation.valid) return { ok: false, error: 'invalid-product', errors: validation.errors };

    AP.database.transaction((db) => {
      const target = db.products.find((product) => product.id === productId);
      Object.assign(target, validation.value, { updatedAt: new Date().toISOString() });
    });

    AP.events.emit('product:updated', { productId, actorId });
    return { ok: true, product: AP.database.read().products.find((product) => product.id === productId) };
  }

  function setStatus(actorId, productId, status) {
    if (!['active', 'paused', 'archived'].includes(status)) return { ok: false, error: 'invalid-status' };
    return update(actorId, productId, { status });
  }

  AP.engine.register('products', {
    start() { AP.logger.info('Módulo de produtos iniciado.'); },
    api: { validateProduct, create, list, update, setStatus }
  });
})(window);

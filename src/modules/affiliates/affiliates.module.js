(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function join(userId, productId) {
    const database = AP.database.read();
    const user = database.users.find((item) => item.id === userId);
    const product = database.products.find((item) => item.id === productId);

    if (!user) return { ok: false, error: 'user-not-found' };
    if (!product || product.status !== 'active') return { ok: false, error: 'product-unavailable' };
    if (Number(product.commissionPercent || 0) <= 0) return { ok: false, error: 'affiliate-not-allowed' };

    const existing = database.affiliateLinks.find((item) => item.userId === userId && item.productId === productId);
    if (existing) return { ok: true, affiliate: existing, existing: true };

    const affiliate = {
      id: `affiliate_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      userId,
      productId,
      code: `${userId.slice(-6)}_${productId.slice(-6)}_${Math.random().toString(36).slice(2, 8)}`,
      clicks: 0,
      sales: 0,
      commissionEarned: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    AP.database.transaction((db) => {
      db.affiliateLinks.push(affiliate);
      const target = db.products.find((item) => item.id === productId);
      target.affiliates = Array.isArray(target.affiliates) ? target.affiliates : [];
      if (!target.affiliates.includes(userId)) target.affiliates.push(userId);
    });

    AP.events.emit('affiliate:joined', affiliate);
    return { ok: true, affiliate, existing: false };
  }

  function resolve(code) {
    return AP.database.read().affiliateLinks.find((item) => item.code === code && item.status === 'active') || null;
  }

  function recordClick(code) {
    let affiliate;
    AP.database.transaction((database) => {
      affiliate = database.affiliateLinks.find((item) => item.code === code && item.status === 'active');
      if (!affiliate) throw new Error('Link de afiliado inválido.');
      affiliate.clicks = Number(affiliate.clicks || 0) + 1;
    });
    AP.events.emit('affiliate:click-recorded', { affiliateId: affiliate.id });
    return { ok: true, affiliate };
  }

  function creditSale(database, affiliateId, orderId, commissionAmount) {
    if (!affiliateId || Number(commissionAmount || 0) <= 0) return null;
    const affiliate = database.affiliateLinks.find((item) => item.id === affiliateId && item.status === 'active');
    if (!affiliate) return null;
    affiliate.sales = Number(affiliate.sales || 0) + 1;
    affiliate.commissionEarned = Number(affiliate.commissionEarned || 0) + Number(commissionAmount);
    database.auditLogs.push({
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      action: 'affiliate:commission-credited',
      actorId: affiliate.userId,
      details: { affiliateId, orderId, commissionAmount },
      createdAt: new Date().toISOString()
    });
    return affiliate;
  }

  AP.engine.register('affiliates', {
    start() { AP.logger.info('Módulo de afiliados iniciado.'); },
    api: { join, resolve, recordClick, creditSale }
  });
})(window);

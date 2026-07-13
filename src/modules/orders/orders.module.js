(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function createOrder({ buyerId, productId, quantity = 1, affiliateCode = null }) {
    const database = AP.database.read();
    const buyer = database.users.find((item) => item.id === buyerId);
    const product = database.products.find((item) => item.id === productId);
    const qty = Number(quantity || 0);

    if (!buyer) return { ok: false, error: 'buyer-not-found' };
    if (!product || product.status !== 'active') return { ok: false, error: 'product-unavailable' };
    if (!Number.isInteger(qty) || qty <= 0) return { ok: false, error: 'invalid-quantity' };
    if (Number(product.stock || 0) < qty) return { ok: false, error: 'insufficient-stock' };

    const affiliate = affiliateCode ? AP.engine.get('affiliates')?.resolve(affiliateCode) : null;
    const subtotal = Number(product.price) * qty;
    const commissionAmount = affiliate && affiliate.productId === product.id
      ? subtotal * (Number(product.commissionPercent || 0) / 100)
      : 0;

    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      buyerId,
      advertiserId: product.advertiserId,
      productId,
      productName: product.name,
      quantity: qty,
      unitPrice: Number(product.price),
      subtotal,
      affiliateId: affiliate?.id || null,
      commissionAmount,
      status: 'pending_payment',
      createdAt: new Date().toISOString()
    };

    AP.database.transaction((db) => {
      const targetProduct = db.products.find((item) => item.id === productId);
      if (Number(targetProduct.stock || 0) < qty) throw new Error('Estoque mudou antes da criação do pedido.');
      targetProduct.stock = Number(targetProduct.stock || 0) - qty;
      db.orders.push(order);
      db.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action: 'order:created',
        actorId: buyerId,
        details: { orderId: order.id, productId, quantity: qty, subtotal },
        createdAt: new Date().toISOString()
      });
    });

    AP.events.emit('order:created', order);
    return { ok: true, order };
  }

  function updateStatus(orderId, status, actorId) {
    const allowed = ['paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!allowed.includes(status)) return { ok: false, error: 'invalid-status' };

    let updated;
    AP.database.transaction((database) => {
      const order = database.orders.find((item) => item.id === orderId);
      const actor = database.users.find((item) => item.id === actorId);
      if (!order || !actor) throw new Error('Pedido ou usuário não encontrado.');

      const authorized = actorId === order.advertiserId || AP.permissions.hasRole(actor, 'admin');
      if (!authorized) throw new Error('Sem permissão para alterar o pedido.');

      const previousStatus = order.status;
      if (status === 'cancelled' && !['pending_payment', 'paid', 'processing'].includes(previousStatus)) {
        throw new Error('Pedido não pode mais ser cancelado.');
      }

      if (status === 'cancelled' && previousStatus !== 'cancelled') {
        const product = database.products.find((item) => item.id === order.productId);
        product.stock = Number(product.stock || 0) + Number(order.quantity || 0);
      }

      order.status = status;
      order.updatedAt = new Date().toISOString();

      if (status === 'paid' && previousStatus !== 'paid') {
        const product = database.products.find((item) => item.id === order.productId);
        product.sales = Number(product.sales || 0) + Number(order.quantity || 0);
        AP.engine.get('affiliates')?.creditSale(database, order.affiliateId, order.id, order.commissionAmount);
      }

      database.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action: 'order:status-changed',
        actorId,
        details: { orderId, previousStatus, status },
        createdAt: new Date().toISOString()
      });
      updated = { ...order };
    });

    AP.events.emit('order:status-changed', updated);
    return { ok: true, order: updated };
  }

  function listForUser(userId) {
    return AP.database.read().orders.filter((order) => order.buyerId === userId);
  }

  function listForAdvertiser(advertiserId) {
    return AP.database.read().orders.filter((order) => order.advertiserId === advertiserId);
  }

  AP.engine.register('orders', {
    start() { AP.logger.info('Módulo de pedidos iniciado.'); },
    api: { createOrder, updateStatus, listForUser, listForAdvertiser }
  });
})(window);

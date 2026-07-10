(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function pointsToBRL(points) {
    return Number(points || 0) / Number(AP.config.rewards.pointsToBRL || 1000);
  }

  function getWallet(userId) {
    const database = AP.database.read();
    const account = database.users.find((user) => user.id === userId);
    if (!account) return null;

    const pending = database.withdrawals
      .filter((item) => item.userId === userId && item.status === 'pending')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      userId,
      points: Number(account.points || 0),
      availableBRL: pointsToBRL(account.points),
      pendingBRL: pending,
      withdrawals: database.withdrawals.filter((item) => item.userId === userId)
    };
  }

  function validateWithdrawal({ userId, pixKey, amountBRL }) {
    const wallet = getWallet(userId);
    if (!wallet) return { ok: false, error: 'user-not-found' };
    if (!String(pixKey || '').trim()) return { ok: false, error: 'pix-required' };

    const amount = Number(amountBRL || wallet.availableBRL);
    if (amount < Number(AP.config.rewards.minimumWithdrawalBRL || 20)) {
      return { ok: false, error: 'below-minimum' };
    }
    if (amount > wallet.availableBRL) return { ok: false, error: 'insufficient-balance' };

    const antifraud = AP.engine.get('antifraud');
    const risk = antifraud?.canReceiveReward(userId) || { allowed: true };
    if (!risk.allowed) return { ok: false, error: risk.reason };

    return { ok: true, wallet, amount, pixKey: String(pixKey).trim() };
  }

  function requestWithdrawal(input) {
    const validation = validateWithdrawal(input);
    if (!validation.ok) {
      AP.events.emit('wallet:withdrawal-rejected', { ...input, reason: validation.error });
      return validation;
    }

    const pointsToDebit = Math.round(validation.amount * Number(AP.config.rewards.pointsToBRL || 1000));
    let withdrawal;

    AP.database.transaction((database) => {
      const account = database.users.find((user) => user.id === input.userId);
      if (Number(account.points || 0) < pointsToDebit) {
        throw new Error('Saldo alterado antes da conclusão do saque.');
      }

      account.points = Number(account.points || 0) - pointsToDebit;
      withdrawal = {
        id: `withdraw_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: input.userId,
        pix: validation.pixKey,
        amount: validation.amount,
        points: pointsToDebit,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      database.withdrawals.push(withdrawal);
      database.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action: 'wallet:withdrawal-requested',
        actorId: input.userId,
        details: { withdrawalId: withdrawal.id, amount: withdrawal.amount, points: pointsToDebit },
        createdAt: new Date().toISOString()
      });
    });

    AP.events.emit('wallet:withdrawal-requested', withdrawal);
    return { ok: true, withdrawal, wallet: getWallet(input.userId) };
  }

  function updateWithdrawalStatus(withdrawalId, status, adminId) {
    const allowed = ['approved', 'paid', 'rejected'];
    if (!allowed.includes(status)) return { ok: false, error: 'invalid-status' };

    let updated;
    AP.database.transaction((database) => {
      const admin = database.users.find((user) => user.id === adminId);
      if (!admin || !AP.permissions.hasRole(admin, 'admin')) throw new Error('Acesso administrativo necessário.');

      const withdrawal = database.withdrawals.find((item) => item.id === withdrawalId);
      if (!withdrawal) throw new Error('Saque não encontrado.');
      if (withdrawal.status !== 'pending' && status === 'rejected') throw new Error('Saque não pode mais ser estornado.');

      if (status === 'rejected' && withdrawal.status === 'pending') {
        const account = database.users.find((user) => user.id === withdrawal.userId);
        account.points = Number(account.points || 0) + Number(withdrawal.points || 0);
      }

      withdrawal.status = status;
      withdrawal.reviewedBy = adminId;
      withdrawal.reviewedAt = new Date().toISOString();
      updated = { ...withdrawal };

      database.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action: 'wallet:withdrawal-status-changed',
        actorId: adminId,
        details: { withdrawalId, status },
        createdAt: new Date().toISOString()
      });
    });

    AP.events.emit('wallet:withdrawal-status-changed', updated);
    return { ok: true, withdrawal: updated };
  }

  AP.engine.register('wallet', {
    start() { AP.logger.info('Módulo de carteira iniciado.'); },
    api: { pointsToBRL, getWallet, validateWithdrawal, requestWithdrawal, updateWithdrawalStatus }
  });
})(window);

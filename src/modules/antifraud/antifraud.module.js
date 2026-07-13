(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  const rules = Object.freeze({
    tooManyViewsPerHour: 120,
    tooManyClaimsPerDay: 80,
    minimumHumanWatchRatio: 0.8,
    repeatedDeviceLimit: 4,
    suspiciousScoreThreshold: 60,
    blockScoreThreshold: 100
  });

  function evaluate(input = {}) {
    let score = 0;
    const reasons = [];

    if (Number(input.viewsLastHour || 0) > rules.tooManyViewsPerHour) {
      score += 35;
      reasons.push('too-many-views-per-hour');
    }
    if (Number(input.claimsToday || 0) > rules.tooManyClaimsPerDay) {
      score += 40;
      reasons.push('too-many-claims-per-day');
    }
    if (Number(input.averageWatchRatio || 0) < rules.minimumHumanWatchRatio) {
      score += 20;
      reasons.push('low-average-watch-ratio');
    }
    if (Number(input.accountsOnDevice || 0) > rules.repeatedDeviceLimit) {
      score += 30;
      reasons.push('too-many-accounts-on-device');
    }
    if (input.vpnDetected) {
      score += 15;
      reasons.push('vpn-detected');
    }
    if (input.emulatorDetected) {
      score += 35;
      reasons.push('emulator-detected');
    }
    if (input.impossibleTiming) {
      score += 45;
      reasons.push('impossible-timing');
    }
    if (input.duplicateIdentity) {
      score += 60;
      reasons.push('duplicate-identity');
    }

    const status = score >= rules.blockScoreThreshold
      ? 'blocked'
      : score >= rules.suspiciousScoreThreshold
        ? 'review'
        : 'clear';

    return { score, reasons, status };
  }

  function reviewUser(userId, signals = {}) {
    const result = evaluate(signals);
    AP.database.transaction((database) => {
      const account = database.users.find((user) => user.id === userId);
      if (!account) throw new Error('Usuário não encontrado.');
      account.risk = {
        score: result.score,
        status: result.status,
        reasons: result.reasons,
        reviewedAt: new Date().toISOString()
      };
      database.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action: 'antifraud:user-reviewed',
        actorId: userId,
        details: result,
        createdAt: new Date().toISOString()
      });
    });

    AP.events.emit('antifraud:user-reviewed', { userId, ...result });
    return result;
  }

  function canReceiveReward(userId) {
    const account = AP.database.findUserById(userId);
    if (!account) return { allowed: false, reason: 'user-not-found' };
    if (account.risk?.status === 'blocked') return { allowed: false, reason: 'risk-blocked' };
    if (account.risk?.status === 'review') return { allowed: false, reason: 'risk-review' };
    return { allowed: true };
  }

  AP.engine.register('antifraud', {
    start() { AP.logger.info('Motor antifraude iniciado.'); },
    api: { rules, evaluate, reviewUser, canReceiveReward }
  });
})(window);

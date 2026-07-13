(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function findCampaign(database, campaignId) {
    return database.campaigns.find((campaign) => campaign.id === campaignId) || null;
  }

  function alreadyRewarded(database, userId, campaignId, date = today()) {
    return database.views.some((view) =>
      view.userId === userId &&
      view.campaignId === campaignId &&
      view.date === date &&
      view.valid === true
    );
  }

  function validateClaim({ userId, campaignId, watchedRatio, answer }) {
    const database = AP.database.read();
    const user = database.users.find((account) => account.id === userId);
    const campaign = findCampaign(database, campaignId);

    if (!user) return { ok: false, error: 'user-not-found' };
    if (!campaign) return { ok: false, error: 'campaign-not-found' };
    if (campaign.status !== 'active') return { ok: false, error: 'campaign-not-active' };
    if (alreadyRewarded(database, userId, campaignId)) return { ok: false, error: 'already-rewarded' };
    if (Number(watchedRatio || 0) < 0.8) return { ok: false, error: 'insufficient-watch-time' };

    const expected = String(campaign.answer || '').trim().toLowerCase();
    const received = String(answer || '').trim().toLowerCase();
    if (expected && !received.includes(expected)) return { ok: false, error: 'invalid-answer' };

    const points = Number(campaign.pointsPerView || 0);
    const costBRL = points / Number(AP.config.rewards.pointsToBRL || 1000);
    if (points <= 0) return { ok: false, error: 'invalid-reward' };
    if (Number(campaign.rewardReserve || 0) < costBRL) return { ok: false, error: 'insufficient-reserve' };

    return { ok: true, user, campaign, points, costBRL };
  }

  function claim(input) {
    const validation = validateClaim(input);
    if (!validation.ok) {
      AP.events.emit('reward:rejected', { ...input, reason: validation.error });
      return validation;
    }

    const date = today();
    AP.database.transaction((database) => {
      if (alreadyRewarded(database, input.userId, input.campaignId, date)) {
        throw new Error('Recompensa duplicada detectada durante a transação.');
      }

      const user = database.users.find((account) => account.id === input.userId);
      const campaign = findCampaign(database, input.campaignId);
      user.points = Number(user.points || 0) + validation.points;
      campaign.rewardReserve = Number(campaign.rewardReserve || 0) - validation.costBRL;
      campaign.metrics = campaign.metrics || {};
      campaign.metrics.views = Number(campaign.metrics.views || 0) + 1;
      campaign.metrics.completions = Number(campaign.metrics.completions || 0) + 1;

      database.views.push({
        id: `view_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: input.userId,
        campaignId: input.campaignId,
        date,
        valid: true,
        points: validation.points,
        watchedRatio: Number(input.watchedRatio || 0),
        createdAt: new Date().toISOString()
      });

      database.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action: 'reward:credited',
        actorId: input.userId,
        details: {
          campaignId: input.campaignId,
          points: validation.points,
          costBRL: validation.costBRL
        },
        createdAt: new Date().toISOString()
      });
    });

    AP.events.emit('reward:credited', {
      userId: input.userId,
      campaignId: input.campaignId,
      points: validation.points,
      costBRL: validation.costBRL
    });

    return { ok: true, points: validation.points, costBRL: validation.costBRL };
  }

  AP.engine.register('rewards', {
    start() { AP.logger.info('Motor de recompensas iniciado.'); },
    api: { today, alreadyRewarded, validateClaim, claim }
  });
})(window);

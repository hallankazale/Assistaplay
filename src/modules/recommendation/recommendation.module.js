(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  const weights = Object.freeze({
    view: 2,
    completion: 5,
    like: 6,
    save: 8,
    share: 10,
    click: 12,
    purchase: 20,
    skip: -4,
    hide: -15,
    report: -30
  });

  function scoreCategory(interests, category, eventType) {
    const current = Number(interests[category] || 0);
    const delta = Number(weights[eventType] || 0);
    interests[category] = Math.max(0, current + delta);
    return interests[category];
  }

  function recordInteraction({ userId, category, eventType, contentId = null, productId = null }) {
    if (!userId || !category || !(eventType in weights)) {
      return { ok: false, error: 'invalid-interaction' };
    }

    let newScore = 0;
    AP.database.transaction((database) => {
      const account = database.users.find((user) => user.id === userId);
      if (!account) throw new Error('Usuário não encontrado.');
      account.interests = account.interests || {};
      newScore = scoreCategory(account.interests, category, eventType);
      database.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action: 'recommendation:interaction',
        actorId: userId,
        details: { category, eventType, contentId, productId, score: newScore },
        createdAt: new Date().toISOString()
      });
    });

    AP.events.emit('recommendation:interaction-recorded', {
      userId, category, eventType, contentId, productId, score: newScore
    });
    return { ok: true, score: newScore };
  }

  function contentScore(content, account) {
    const categoryAffinity = Number(account?.interests?.[content.category] || 0);
    const metrics = content.metrics || {};
    const quality =
      Number(metrics.completions || 0) * 0.35 +
      Number(metrics.likes || 0) * 0.15 +
      Number(metrics.shares || 0) * 0.25 +
      Number(metrics.clicks || 0) * 0.25;
    const freshness = content.createdAt
      ? Math.max(0, 30 - ((Date.now() - new Date(content.createdAt).getTime()) / 86400000)) * 0.1
      : 0;
    return categoryAffinity + quality + freshness;
  }

  function rank(contents, account, options = {}) {
    const limit = Number(options.limit || contents.length);
    const seen = new Set(options.seenIds || []);
    return [...contents]
      .filter((item) => item?.status === 'active' && !seen.has(item.id))
      .map((item) => ({ item, score: contentScore(item, account) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item, score }) => ({ ...item, recommendationScore: score }));
  }

  function getInterestProfile(account) {
    const entries = Object.entries(account?.interests || {}).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
    return entries.map(([category, value]) => ({
      category,
      score: Number(value),
      percentage: total ? Math.round((Number(value) / total) * 100) : 0
    }));
  }

  AP.engine.register('recommendation', {
    start() { AP.logger.info('Motor de recomendação iniciado.'); },
    api: { weights, recordInteraction, contentScore, rank, getInterestProfile }
  });
})(window);

(function (global) {
  'use strict';

  const CURRENT_SCHEMA_VERSION = 3;

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeUser(account) {
    const roles = Array.isArray(account?.roles)
      ? account.roles
      : account?.role
        ? [account.role]
        : ['user'];

    return {
      ...account,
      roles: [...new Set(roles)],
      points: Number(account?.points || 0),
      interests: account?.interests && typeof account.interests === 'object'
        ? account.interests
        : {}
    };
  }

  function normalizeCampaign(campaign) {
    return {
      ...campaign,
      productId: campaign?.productId || null,
      productLink: campaign?.productLink || '',
      ctaText: campaign?.ctaText || 'Ver produto',
      creativeType: campaign?.creativeType || 'video',
      metrics: {
        views: Number(campaign?.metrics?.views || 0),
        likes: Number(campaign?.metrics?.likes || 0),
        shares: Number(campaign?.metrics?.shares || 0),
        clicks: Number(campaign?.metrics?.clicks || 0),
        completions: Number(campaign?.metrics?.completions || 0)
      }
    };
  }

  function migrate(database) {
    const source = database && typeof database === 'object' ? database : {};

    return {
      ...source,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      users: ensureArray(source.users).map(normalizeUser),
      products: ensureArray(source.products),
      campaigns: ensureArray(source.campaigns).map(normalizeCampaign),
      views: ensureArray(source.views),
      likes: ensureArray(source.likes),
      shares: ensureArray(source.shares),
      clicks: ensureArray(source.clicks),
      withdrawals: ensureArray(source.withdrawals),
      orders: ensureArray(source.orders),
      affiliateLinks: ensureArray(source.affiliateLinks),
      auditLogs: ensureArray(source.auditLogs)
    };
  }

  function migrateStoredDatabase() {
    const AP = global.AssistaPay;
    const key = AP?.config?.storage?.databaseKey || 'assistapay_db_v3_shop';
    const existing = AP?.storage?.get(key, null);
    if (!existing) return null;

    AP.storage.backup(key);
    const migrated = migrate(existing);
    AP.storage.set(key, migrated);
    return migrated;
  }

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.migrations = Object.freeze({
    CURRENT_SCHEMA_VERSION,
    migrate,
    migrateStoredDatabase
  });
})(window);

(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function databaseKey() {
    return AP.config?.storage?.databaseKey || 'assistapay_db_v3_shop';
  }

  function createEmptyDatabase() {
    return {
      schemaVersion: AP.migrations?.CURRENT_SCHEMA_VERSION || 3,
      users: [],
      products: [],
      campaigns: [],
      views: [],
      likes: [],
      shares: [],
      clicks: [],
      withdrawals: [],
      orders: [],
      affiliateLinks: [],
      auditLogs: []
    };
  }

  function read() {
    const stored = AP.storage?.get(databaseKey(), null);
    if (!stored) return createEmptyDatabase();
    return AP.migrations?.migrate(stored) || stored;
  }

  function write(database) {
    const normalized = AP.migrations?.migrate(database) || database;
    AP.storage?.set(databaseKey(), normalized);
    return normalized;
  }

  function transaction(mutator) {
    if (typeof mutator !== 'function') {
      throw new TypeError('A transação precisa receber uma função.');
    }

    const database = read();
    const result = mutator(database);
    const saved = write(database);
    return { database: saved, result };
  }

  function findUserById(userId) {
    return read().users.find((account) => account.id === userId) || null;
  }

  function audit(action, details = {}, actorId = null) {
    return transaction((database) => {
      database.auditLogs.push({
        id: `audit_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        action,
        actorId,
        details,
        createdAt: new Date().toISOString()
      });
    });
  }

  AP.database = Object.freeze({
    createEmptyDatabase,
    read,
    write,
    transaction,
    findUserById,
    audit
  });
})(window);

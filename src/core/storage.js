(function (global) {
  'use strict';

  function safeParse(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('[AssistaPay] Falha ao ler dados locais.', error);
      return fallback;
    }
  }

  const storage = {
    get(key, fallback = null) {
      return safeParse(localStorage.getItem(key), fallback);
    },

    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
      return value;
    },

    getText(key, fallback = null) {
      return localStorage.getItem(key) ?? fallback;
    },

    setText(key, value) {
      localStorage.setItem(key, String(value));
      return value;
    },

    remove(key) {
      localStorage.removeItem(key);
    },

    backup(key) {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const backupKey = `${key}_backup_${new Date().toISOString()}`;
      localStorage.setItem(backupKey, raw);
      return backupKey;
    }
  };

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.storage = storage;
})(window);

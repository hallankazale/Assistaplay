(function (global) {
  'use strict';

  const listeners = new Map();

  function on(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('O listener precisa ser uma função.');
    }

    const handlers = listeners.get(eventName) || new Set();
    handlers.add(handler);
    listeners.set(eventName, handlers);

    return function unsubscribe() {
      handlers.delete(handler);
      if (!handlers.size) listeners.delete(eventName);
    };
  }

  function once(eventName, handler) {
    const unsubscribe = on(eventName, (payload) => {
      unsubscribe();
      handler(payload);
    });
    return unsubscribe;
  }

  function emit(eventName, payload = {}) {
    const handlers = [...(listeners.get(eventName) || [])];
    const errors = [];

    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        errors.push(error);
        console.error(`[AssistaPay] Falha no evento ${eventName}.`, error);
      }
    });

    return { delivered: handlers.length, errors };
  }

  function clear(eventName) {
    if (eventName) listeners.delete(eventName);
    else listeners.clear();
  }

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.events = Object.freeze({ on, once, emit, clear });
})(window);

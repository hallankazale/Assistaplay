(function (global) {
  'use strict';

  const history = [];
  const MAX_ITEMS = 300;

  function write(level, message, context = {}) {
    const entry = {
      level,
      message,
      context,
      createdAt: new Date().toISOString()
    };

    history.push(entry);
    if (history.length > MAX_ITEMS) history.shift();

    const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[method](`[AssistaPay:${level}] ${message}`, context);
    global.AssistaPay?.events?.emit('logger:entry', entry);
    return entry;
  }

  function list() {
    return history.map((entry) => ({ ...entry }));
  }

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.logger = Object.freeze({
    info: (message, context) => write('info', message, context),
    warn: (message, context) => write('warn', message, context),
    error: (message, context) => write('error', message, context),
    list
  });
})(window);

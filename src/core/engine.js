(function (global) {
  'use strict';

  const modules = new Map();
  let started = false;

  function register(name, moduleDefinition) {
    if (!name || typeof name !== 'string') {
      throw new TypeError('O módulo precisa ter um nome válido.');
    }
    if (!moduleDefinition || typeof moduleDefinition !== 'object') {
      throw new TypeError(`O módulo ${name} precisa ser um objeto.`);
    }
    if (modules.has(name)) {
      throw new Error(`O módulo ${name} já foi registrado.`);
    }

    modules.set(name, {
      name,
      enabled: moduleDefinition.enabled !== false,
      start: moduleDefinition.start || null,
      stop: moduleDefinition.stop || null,
      api: moduleDefinition.api || {},
      status: 'registered'
    });

    global.AssistaPay?.events?.emit('engine:module-registered', { name });
    return modules.get(name).api;
  }

  function get(name) {
    return modules.get(name)?.api || null;
  }

  function startModule(module) {
    if (!module.enabled || module.status === 'started') return;
    if (typeof module.start === 'function') {
      module.start({
        config: global.AssistaPay.config,
        database: global.AssistaPay.database,
        events: global.AssistaPay.events,
        features: global.AssistaPay.features,
        permissions: global.AssistaPay.permissions
      });
    }
    module.status = 'started';
    global.AssistaPay?.events?.emit('engine:module-started', { name: module.name });
  }

  function start() {
    if (started) return;
    modules.forEach(startModule);
    started = true;
    global.AssistaPay?.events?.emit('engine:started', {
      modules: [...modules.keys()]
    });
  }

  function stop() {
    [...modules.values()].reverse().forEach((module) => {
      if (module.status !== 'started') return;
      if (typeof module.stop === 'function') module.stop();
      module.status = 'stopped';
    });
    started = false;
    global.AssistaPay?.events?.emit('engine:stopped');
  }

  function status() {
    return {
      started,
      modules: [...modules.values()].map((module) => ({
        name: module.name,
        enabled: module.enabled,
        status: module.status
      }))
    };
  }

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.engine = Object.freeze({
    register,
    get,
    start,
    stop,
    status
  });
})(window);

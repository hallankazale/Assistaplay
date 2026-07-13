(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};

  function validateDependencies() {
    const required = [
      'config',
      'storage',
      'permissions',
      'auth',
      'migrations',
      'database',
      'events',
      'features',
      'router',
      'engine',
      'logger'
    ];

    return required.filter((dependency) => !AP[dependency]);
  }

  function startCompatibilityMode() {
    const missing = validateDependencies();
    if (missing.length) {
      console.error('[AssistaPay] Módulos ausentes:', missing);
      return { started: false, missing };
    }

    AP.logger.info('Nova arquitetura carregada em modo de compatibilidade.');
    AP.events.emit('bootstrap:compatibility-ready', {
      databaseKey: AP.config.storage.databaseKey,
      currentFeatures: AP.features.snapshot()
    });

    return {
      started: true,
      compatibilityMode: true,
      engineStarted: AP.engine.status().started
    };
  }

  AP.bootstrap = Object.freeze({
    validateDependencies,
    startCompatibilityMode
  });
})(window);

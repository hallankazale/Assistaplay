(function (global) {
  'use strict';

  const defaults = Object.freeze({
    marketplace: true,
    rewardedVideos: true,
    wallet: true,
    affiliates: true,
    advertiserDashboard: true,
    adminDashboard: true,
    pixAutomatic: false,
    liveShopping: false,
    recommendationAI: true,
    externalCheckout: true
  });

  const overrides = new Map();

  function isEnabled(featureName) {
    if (overrides.has(featureName)) return overrides.get(featureName);
    return Boolean(defaults[featureName]);
  }

  function set(featureName, enabled) {
    overrides.set(featureName, Boolean(enabled));
    global.AssistaPay?.events?.emit('feature:changed', {
      featureName,
      enabled: Boolean(enabled)
    });
  }

  function reset(featureName) {
    if (featureName) overrides.delete(featureName);
    else overrides.clear();
  }

  function snapshot() {
    const state = { ...defaults };
    overrides.forEach((value, key) => { state[key] = value; });
    return state;
  }

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.features = Object.freeze({
    defaults,
    isEnabled,
    set,
    reset,
    snapshot
  });
})(window);

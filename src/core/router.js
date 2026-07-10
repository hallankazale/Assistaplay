(function (global) {
  'use strict';

  const routes = new Map();
  let currentRoute = null;

  function register(routeName, options = {}) {
    if (!routeName) throw new Error('A rota precisa de um nome.');

    routes.set(routeName, {
      screenId: options.screenId || routeName,
      feature: options.feature || null,
      guard: options.guard || null
    });
  }

  function resolve(routeName, account) {
    const route = routes.get(routeName);
    if (!route) return { allowed: false, reason: 'route-not-found' };

    if (route.feature && !global.AssistaPay.features?.isEnabled(route.feature)) {
      return { allowed: false, reason: 'feature-disabled' };
    }

    if (!global.AssistaPay.permissions?.canAccessScreen(account, route.screenId)) {
      return { allowed: false, reason: 'permission-denied' };
    }

    if (typeof route.guard === 'function' && !route.guard(account)) {
      return { allowed: false, reason: 'guard-denied' };
    }

    return { allowed: true, routeName, ...route };
  }

  function navigate(routeName, account) {
    const result = resolve(routeName, account);
    if (!result.allowed) {
      global.AssistaPay.events?.emit('router:blocked', { routeName, ...result });
      return result;
    }

    currentRoute = routeName;
    global.AssistaPay.events?.emit('router:navigated', result);
    return result;
  }

  function getCurrentRoute() {
    return currentRoute;
  }

  register('auth', { screenId: 'authScreen' });
  register('feed', { screenId: 'userScreen', feature: 'rewardedVideos' });
  register('shop', { screenId: 'marketScreen', feature: 'marketplace' });
  register('advertiser', { screenId: 'advertiserScreen', feature: 'advertiserDashboard' });
  register('wallet', { screenId: 'walletScreen', feature: 'wallet' });
  register('profile', { screenId: 'profileScreen' });
  register('admin', { screenId: 'adminScreen', feature: 'adminDashboard' });

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.router = Object.freeze({
    register,
    resolve,
    navigate,
    getCurrentRoute
  });
})(window);

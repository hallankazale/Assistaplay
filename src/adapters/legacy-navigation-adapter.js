(function (global) {
  'use strict';

  const AP = global.AssistaPay = global.AssistaPay || {};
  const screenToRoute = {
    authScreen: 'auth',
    userScreen: 'feed',
    marketScreen: 'shop',
    advertiserScreen: 'advertiser',
    walletScreen: 'wallet',
    profileScreen: 'profile',
    adminScreen: 'admin'
  };

  let active = false;
  let cleanupTasks = [];

  function currentAccount() {
    return AP.legacyAuthAdapter?.currentAccount?.() || null;
  }

  function applyScreen(screenId) {
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.toggle('active', screen.id === screenId);
    });

    document.body.classList.toggle('feed-mode', screenId === 'userScreen');
    document.querySelectorAll('#bottomNav button[data-go]').forEach((button) => {
      button.classList.toggle('active', button.dataset.go === screenId);
    });

    AP.events.emit('ui:screen-changed', { screenId });
  }

  function navigateByScreen(screenId) {
    const routeName = screenToRoute[screenId];
    if (!routeName) return { allowed: false, reason: 'unknown-screen' };

    const result = AP.router.navigate(routeName, currentAccount());
    if (!result.allowed) return result;
    applyScreen(result.screenId);
    return result;
  }

  function refreshPermissions() {
    const account = currentAccount();
    const logged = Boolean(account);
    const nav = document.getElementById('bottomNav');
    const logout = document.getElementById('logoutBtn');

    nav?.classList.toggle('hidden', !logged);
    logout?.classList.toggle('hidden', !logged);

    document.querySelectorAll('#bottomNav button[data-go]').forEach((button) => {
      const routeName = screenToRoute[button.dataset.go];
      const result = AP.router.resolve(routeName, account);
      button.classList.toggle('hidden', !result.allowed);
    });
  }

  function bindNavigation() {
    const nav = document.getElementById('bottomNav');
    if (!nav) return;

    const handler = (event) => {
      const button = event.target.closest('button[data-go]');
      if (!button) return;
      const result = navigateByScreen(button.dataset.go);
      if (!result.allowed) {
        AP.logger?.warn('Navegação bloqueada.', result);
      }
    };

    nav.addEventListener('click', handler);
    cleanupTasks.push(() => nav.removeEventListener('click', handler));
  }

  function start() {
    if (active) return;
    active = true;
    bindNavigation();
    refreshPermissions();
    AP.logger?.info('Adaptador legado de navegação preparado.');
  }

  function stop() {
    cleanupTasks.forEach((cleanup) => cleanup());
    cleanupTasks = [];
    active = false;
  }

  AP.legacyNavigationAdapter = Object.freeze({
    start,
    stop,
    navigateByScreen,
    refreshPermissions,
    applyScreen,
    isActive: () => active
  });
})(window);

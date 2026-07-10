(function (global) {
  'use strict';

  const roles = global.AssistaPay?.config?.roles || {
    user: 'user',
    advertiser: 'advertiser',
    admin: 'admin'
  };

  function rolesOf(account) {
    if (!account) return [];
    if (Array.isArray(account.roles)) return account.roles;
    if (account.role) return [account.role];
    return [roles.user];
  }

  function hasRole(account, role) {
    return rolesOf(account).includes(role);
  }

  function firstAllowedScreen(account) {
    if (hasRole(account, roles.admin)) return 'adminScreen';
    if (hasRole(account, roles.user)) return 'userScreen';
    if (hasRole(account, roles.advertiser)) return 'advertiserScreen';
    return 'authScreen';
  }

  function canAccessScreen(account, screenId) {
    if (screenId === 'authScreen') return true;
    if (!account) return false;

    const rules = {
      userScreen: [roles.user, roles.admin],
      marketScreen: [roles.user, roles.advertiser, roles.admin],
      advertiserScreen: [roles.advertiser, roles.admin],
      walletScreen: [roles.user, roles.admin],
      profileScreen: [roles.user, roles.advertiser, roles.admin],
      adminScreen: [roles.admin]
    };

    const allowedRoles = rules[screenId];
    if (!allowedRoles) return true;
    return allowedRoles.some((role) => hasRole(account, role));
  }

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.permissions = Object.freeze({
    rolesOf,
    hasRole,
    firstAllowedScreen,
    canAccessScreen
  });
})(window);

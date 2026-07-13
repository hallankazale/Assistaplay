(function (global) {
  'use strict';

  const config = Object.freeze({
    appName: 'AssistaPay',
    locale: 'pt-BR',
    currency: 'BRL',
    storage: Object.freeze({
      databaseKey: 'assistapay_db_v3_shop',
      currentUserKey: 'assistapay_current_user'
    }),
    rewards: Object.freeze({
      pointsToBRL: 1000,
      minimumWithdrawalBRL: 20
    }),
    campaignAllocation: Object.freeze({
      userRewards: 0.50,
      platformProfit: 0.25,
      safetyReserve: 0.15,
      operatingCosts: 0.10
    }),
    roles: Object.freeze({
      user: 'user',
      advertiser: 'advertiser',
      admin: 'admin'
    })
  });

  global.AssistaPay = global.AssistaPay || {};
  global.AssistaPay.config = config;
})(window);

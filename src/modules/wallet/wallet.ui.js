(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const read=(key,fallback)=>AP.storage?.get?.(key,fallback)??fallback;
const money=value=>Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function render(container){
  const wallet=read('wallet',{balance:0,points:0,transactions:[]});
  const transactions=Array.isArray(wallet.transactions)?wallet.transactions:[];
  container.innerHTML=`<main class="ap-page"><header class="ap-page-header"><a href="../feed.html">‹</a><h1>Carteira</h1><span></span></header><section class="ap-card"><small>Saldo disponível</small><h2>${money(wallet.balance)}</h2><p>${Number(wallet.points||0)} pontos</p></section><section class="ap-card"><h2>Extrato</h2>${transactions.length?transactions.map(item=>`<article><strong>${String(item.title||item.type||'Movimentação')}</strong><span>${money(item.value)}</span></article>`).join(''):'<p>Nenhuma movimentação registrada.</p>'}</section></main>`;
}
AP.walletUI=Object.freeze({render});
})(window);
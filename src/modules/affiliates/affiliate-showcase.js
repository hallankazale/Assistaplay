(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const read=(key,fallback=[])=>AP.storage?.get?.(key,fallback)??fallback;
function products(){
  const affiliations=read('affiliations',[]);
  const ids=new Set(affiliations.map(x=>x.productId||x.id));
  return read('seller-products',[]).filter(p=>ids.has(p.id));
}
function renderPage(container){
  const list=products();
  container.innerHTML=`<main class="ap-page"><header class="ap-page-header"><a href="../feed.html">←</a><h1>Minha Vitrine</h1></header><section class="ap-grid">${list.length?list.map(p=>`<article class="ap-card"><img src="${p.image||''}" alt=""><h3>${p.name||'Produto'}</h3><p>R$ ${Number(p.price||0).toFixed(2).replace('.',',')}</p><a href="app.html?view=checkout&product=${encodeURIComponent(p.id)}">Ver produto</a></article>`).join(''):'<p>Nenhum produto afiliado na vitrine.</p>'}</section></main>`;
  return list;
}
function mount(container){return container;}
AP.affiliateShowcase=Object.freeze({renderPage,mount,products});
})(window);
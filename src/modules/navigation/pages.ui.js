(function(global){
'use strict';

const AP=global.AssistaPay=global.AssistaPay||{};

const read=(key,fallback=[])=>{
  try{
    const value=JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));
    return value==null?fallback:value;
  }catch{
    return fallback;
  }
};

const money=value=>Number(value||0).toLocaleString('pt-BR',{
  style:'currency',
  currency:'BRL'
});

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[char]));

function getProducts(){
  const sellerProducts=read('ap:seller-products',[]);
  if(Array.isArray(sellerProducts)&&sellerProducts.length)return sellerProducts;

  try{
    const legacy=JSON.parse(localStorage.getItem('assistapay_db_v3_shop')||'null');
    if(Array.isArray(legacy?.products)){
      return legacy.products.map(product=>({
        id:product.id,
        name:product.name,
        title:product.name,
        description:product.desc||'',
        price:Number(product.price||0),
        stock:Number(product.stock||0),
        commission:Number(product.commissionPercent||0),
        status:product.status||'active',
        image:product.image||'',
        seller:product.seller||'Loja AssistaPay'
      }));
    }
  }catch{}

  return [];
}

function navigation(){
  return `<nav class="ap-page-nav" aria-label="Menu principal">
    <a href="../feed.html"><span>⌂</span><small>Início</small></a>
    <a href="app-main.html?view=shop"><span>▱</span><small>Shop</small></a>
    <a href="app-main.html?view=create" class="create"><span>+</span><small>Criar</small></a>
    <a href="app-main.html?view=messages"><span>✉</span><small>Mensagens</small></a>
    <a href="app-main.html?view=profile"><span>♙</span><small>Perfil</small></a>
  </nav>`;
}

function home(container){
  container.innerHTML=`<main class="ap-page">
    <header class="ap-page-header"><h1>AssistaPay</h1></header>
    <section class="ap-page-section">
      <h2>Escolha uma área</h2>
      <div class="ap-menu-list">
        <a href="../feed.html">Feed</a>
        <a href="app-main.html?view=shop">Shop</a>
        <a href="app-main.html?view=showcase">Minha Vitrine</a>
        <a href="app-main.html?view=seller-center">Centro do Vendedor</a>
        <a href="app-main.html?view=wallet">Carteira</a>
        <a href="app-main.html?view=profile">Perfil</a>
      </div>
    </section>
  </main>${navigation()}`;
}

function shop(container){
  const products=getProducts().filter(product=>product.status!=='paused');
  container.innerHTML=`<main class="ap-page">
    <header class="ap-page-header"><a href="app-main.html">‹</a><h1>Shop</h1></header>
    <section class="ap-page-section">
      <div class="ap-product-grid">
        ${products.length?products.map(product=>`<article class="ap-product-card" data-product-id="${escapeHtml(product.id)}">
          ${product.image?`<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name||product.title||'Produto')}">`:''}
          <div><strong>${escapeHtml(product.name||product.title||'Produto')}</strong>
          <small>${money(product.price)}</small>
          <p>Estoque: ${Number(product.stock||0)}</p>
          <a href="app-main.html?view=checkout&product=${encodeURIComponent(product.id||'')}">Ver produto</a></div>
        </article>`).join(''):'<div class="ap-empty-state"><h2>Nenhum produto disponível</h2><p>Cadastre um produto no Centro do Vendedor.</p><a href="app-main.html?view=seller-center">Abrir Centro do Vendedor</a></div>'}
      </div>
    </section>
  </main>${navigation()}`;
}

function render(container){
  if(!container)throw new Error('pagesUI.render requer um container.');
  const view=new URLSearchParams(global.location.search).get('view');
  if(view==='shop'||view==='products')return shop(container);
  return home(container);
}

AP.pagesUI=Object.freeze({
  render,
  products:getProducts(),
  getProducts
});

try{AP.engine?.register?.('pagesUI',AP.pagesUI);}catch{}
})(window);

(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
function products(){
 const rows=AP.pagesUI?.getProducts?.();
 if(Array.isArray(rows)&&rows.length)return rows;
 const local=read('ap:seller-products',[]);
 return Array.isArray(local)?local:[];
}
function getProduct(id){return products().find(item=>String(item.id)===String(id))||null;}
function favorites(){try{return JSON.parse(localStorage.getItem('ap:product-favorites')||'{}');}catch{return {};}}
function setFavorite(id,active){const state=favorites();state[String(id)]=!!active;localStorage.setItem('ap:product-favorites',JSON.stringify(state));}
function render(container){
 const params=new URLSearchParams(location.search);
 const product=getProduct(params.get('product'));
 if(!product){container.innerHTML='<main class="ap-product-page"><header class="ap-product-header"><a href="app-main.html?view=shop">‹</a><h1>Produto</h1><span></span></header><section class="ap-product-missing"><strong>Produto não encontrado</strong><a href="app-main.html?view=shop">Voltar ao Marketplace</a></section></main>';return null;}
 const id=String(product.id||'');
 const name=product.name||product.title||'Produto';
 const description=product.description||product.desc||'Este produto ainda não possui uma descrição detalhada.';
 const image=product.image||product.imageUrl||'';
 const stock=Number(product.stock||0);
 const commission=Number(product.commission??product.commissionPercent??0);
 const seller=product.seller||product.sellerName||'Loja AssistaPay';
 const sellerId=product.sellerId||product.ownerId||product.userId||'';
 const active=!!favorites()[id];
 container.innerHTML=`<main class="ap-product-page">
  <header class="ap-product-header"><a href="app-main.html?view=shop" aria-label="Voltar">‹</a><h1>Detalhes do produto</h1><button type="button" data-share-product aria-label="Compartilhar">↗</button></header>
  <section class="ap-product-gallery">${image?`<img src="${esc(image)}" alt="${esc(name)}">`:'<div class="ap-product-image-placeholder">🛍</div>'}${commission>0?`<span>${commission}% de comissão</span>`:''}</section>
  <section class="ap-product-info">
   <div class="ap-product-title-row"><div><small>${esc(seller)}</small><h2>${esc(name)}</h2></div><button class="ap-product-favorite${active?' active':''}" type="button" data-favorite-product aria-pressed="${active}">♥</button></div>
   <strong class="ap-product-price">${money(product.price)}</strong>
   <div class="ap-product-meta"><span>${stock>0?`${stock} unidade${stock===1?'':'s'} em estoque`:'Produto sem estoque'}</span><span>Compra protegida</span></div>
  </section>
  <section class="ap-product-card"><h3>Descrição</h3><p>${esc(description)}</p></section>
  <section class="ap-product-card"><h3>Entrega e segurança</h3><div class="ap-product-benefits"><span>🚚 Entrega acompanhada</span><span>🔒 Pagamento seguro</span><span>↩ Suporte ao pedido</span></div></section>
  <section class="ap-product-card ap-product-seller"><div><span class="ap-product-seller-avatar">${esc(seller.slice(0,1).toUpperCase())}</span><div><small>Vendido por</small><strong>${esc(seller)}</strong></div></div>${sellerId?`<a href="app-main.html?view=shop&seller=${encodeURIComponent(sellerId)}&sellerName=${encodeURIComponent(seller)}">Ver loja</a>`:''}</section>
  <footer class="ap-product-buybar"><button type="button" data-add-cart ${stock<=0?'disabled':''}>Adicionar ao carrinho</button><a class="${stock<=0?'disabled':''}" href="${stock>0?`app-main.html?view=checkout&product=${encodeURIComponent(id)}`:'#'}">Comprar agora</a></footer>
 </main>`;
 container.querySelector('[data-favorite-product]')?.addEventListener('click',e=>{const next=!e.currentTarget.classList.contains('active');setFavorite(id,next);e.currentTarget.classList.toggle('active',next);e.currentTarget.setAttribute('aria-pressed',String(next));});
 container.querySelector('[data-share-product]')?.addEventListener('click',async()=>{const url=location.href;try{if(navigator.share)await navigator.share({title:name,url});else await navigator.clipboard?.writeText(url);}catch{}});
 container.querySelector('[data-add-cart]')?.addEventListener('click',e=>{const cart=read('ap:cart',[]);const existing=cart.find(x=>String(x.productId)===id);if(existing)existing.quantity=Number(existing.quantity||1)+1;else cart.push({productId:id,quantity:1});localStorage.setItem('ap:cart',JSON.stringify(cart));e.currentTarget.textContent='Adicionado ✓';setTimeout(()=>e.currentTarget.textContent='Adicionar ao carrinho',1400);});
 return product;
}
AP.productDetailUI=Object.freeze({render,getProduct});
})(window);
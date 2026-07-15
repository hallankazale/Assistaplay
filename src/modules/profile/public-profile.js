(function(g){
'use strict';
const AP=g.AssistaPay=g.AssistaPay||{};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function creatorProducts(id){
  const products=AP.pagesUI?.getProducts?.()||[];
  return products.filter(product=>product.status!=='paused'&&String(product.sellerId||product.ownerId||product.userId||product.advertiserId||'')===String(id));
}
function open(id){
  const user=(AP.searchStore?.users?.()||[]).find(u=>String(u.id)===String(id));
  if(!user)return false;
  const host=document.getElementById('appPage');
  if(!host)return false;
  const products=creatorProducts(id);
  const storeButton=products.length?`<a class="ap-primary-btn" href="app.html?view=shop&seller=${encodeURIComponent(id)}&sellerName=${encodeURIComponent(user.name||'Criador')}">🛍 Ver loja (${products.length})</a>`:'';
  host.innerHTML=`<main class="ap-page"><header class="ap-page-header"><a href="app.html?view=search">‹</a><h1>Perfil</h1></header><section style="padding:24px;text-align:center">${user.avatar?`<img src="${esc(user.avatar)}" style="width:96px;height:96px;border-radius:50%;object-fit:cover">`:'<div style="font-size:64px">👤</div>'}<h2>${esc(user.name)}</h2><p>@${esc(user.username||'usuario')}</p><div style="display:grid;grid-template-columns:${products.length?'1fr 1fr':'1fr'};gap:10px;max-width:360px;margin:18px auto"><button id="apFollowPublic" class="ap-primary-btn">Seguir</button>${storeButton}</div></section></main>`;
  host.querySelector('#apFollowPublic')?.addEventListener('click',e=>{const ids=AP.storage?.get?.('following',[])||[];if(!ids.includes(user.id))ids.push(user.id);AP.storage?.set?.('following',ids);e.currentTarget.textContent='Seguindo';});
  return true;
}
AP.publicProfile=Object.freeze({open});
})(window);
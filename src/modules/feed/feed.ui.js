(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const LIKES_KEY='ap:feed-likes';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f));}catch{return f;}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
async function loadItems(){
 try{
  if(AP.publicationStore?.listPublished){
   const rows=await AP.publicationStore.listPublished();
   const items=(rows||[]).filter(x=>x&&x.type!=='story'&&x.status!=='deleted');
   if(items.length)return items.map((x,i)=>({id:x.id||`post_${i}`,authorId:x.authorId||x.userId||'user',creator:x.creator||x.username||x.authorName||'Criador',description:x.description||x.caption||x.title||'',media:x.mediaBlob||x.media||x.videoUrl||x.image||'',mediaType:x.mediaType||x.type||'video',productId:x.productId||x.product?.id||'',productName:x.productName||x.product?.name||'',likes:Number(x.likes||0)}));
  }
 }catch(error){console.error(error);}
 try{
  const db=JSON.parse(localStorage.getItem('assistapay_db_v3_shop')||'null');
  if(db){
   const items=(db.campaigns||[]).filter(x=>x.status==='active').map((x,i)=>{const author=(db.users||[]).find(u=>u.id===x.advertiserId)||{};const product=(db.products||[]).find(p=>p.id===x.productId)||{};return{id:x.id||`campaign_${i}`,authorId:x.advertiserId||'advertiser',creator:author.name||'Loja AssistaPay',description:x.desc||x.title||'',media:x.videoUrl||'',mediaType:x.creativeType||'video',productId:product.id||'',productName:product.name||x.ctaText||'',likes:Number(x.metrics?.likes||0)};});
   if(items.length)return items;
  }
 }catch(error){console.error(error);}
 return [];
}
function media(item){const src=esc(item.media);if(String(item.mediaType).includes('image'))return `<img class="ap-feed-media" src="${src}" alt="">`;return `<video class="ap-feed-media" src="${src}" playsinline muted loop preload="metadata"></video>`;}
function card(item,liked){return `<article class="ap-video-slide" data-author-id="${esc(item.authorId)}"><div class="ap-feed-frame">${media(item)}<div class="ap-feed-overlay"></div><div class="ap-feed-text"><strong class="ap-creator-name">@${esc(item.creator)}</strong><p>${esc(item.description)}</p>${item.productId?`<a class="ap-feed-product" href="app.html?view=checkout&product=${encodeURIComponent(item.productId)}">🛒 ${esc(item.productName||'Ver produto')}</a>`:''}</div><div class="ap-feed-actions"><button data-like="${esc(item.id)}">${liked?'❤️':'♡'}</button><small data-count="${esc(item.id)}">${item.likes+(liked?1:0)}</small></div></div></article>`;}
function styles(){if(document.getElementById('apFeedBaseStyle'))return;const s=document.createElement('style');s.id='apFeedBaseStyle';s.textContent='.ap-feed{height:100dvh;overflow-y:auto;scroll-snap-type:y mandatory;background:#000;color:#fff}.ap-video-slide{height:100dvh;scroll-snap-align:start}.ap-feed-frame{height:100%;position:relative;overflow:hidden}.ap-feed-media{width:100%;height:100%;object-fit:cover}.ap-feed-overlay{position:absolute;inset:0;background:linear-gradient(transparent 45%,rgba(0,0,0,.8))}.ap-feed-text{position:absolute;left:16px;right:78px;bottom:90px}.ap-feed-text p{line-height:1.35}.ap-feed-product{display:inline-block;background:#1479ff;color:#fff;padding:10px 12px;border-radius:12px;text-decoration:none;font-weight:700}.ap-feed-actions{position:absolute;right:16px;bottom:110px;display:grid;justify-items:center}.ap-feed-actions button{width:48px;height:48px;border:0;border-radius:50%;background:rgba(0,0,0,.3);color:#fff;font-size:26px}.ap-feed-empty{min-height:100dvh;display:grid;place-items:center;text-align:center;padding:24px}';document.head.appendChild(s);}
function playVisible(container){let best=null,ratio=0;container.querySelectorAll('.ap-video-slide').forEach(slide=>{const r=slide.getBoundingClientRect();const visible=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,0));const value=visible/(r.height||1);if(value>ratio){ratio=value;best=slide;}});container.querySelectorAll('video').forEach(video=>{video.closest('.ap-video-slide')===best?video.play().catch(()=>{}):video.pause();});}
function bind(container,items){container.addEventListener('scroll',()=>requestAnimationFrame(()=>playVisible(container)),{passive:true});container.addEventListener('click',e=>{const button=e.target.closest('[data-like]');if(button){const state=read(LIKES_KEY,{});const id=button.dataset.like;state[id]=!state[id];write(LIKES_KEY,state);button.textContent=state[id]?'❤️':'♡';const item=items.find(x=>String(x.id)===String(id));const count=container.querySelector(`[data-count="${id}"]`);if(count)count.textContent=Number(item?.likes||0)+(state[id]?1:0);return;}const video=e.target.closest('video');if(video)video.paused?video.play().catch(()=>{}):video.pause();});setTimeout(()=>playVisible(container),100);}
async function render(container){styles();const items=await loadItems();const liked=read(LIKES_KEY,{});container.innerHTML=items.length?items.map(x=>card(x,!!liked[x.id])).join(''):'<div class="ap-feed-empty"><div><h1>AssistaPay</h1><p>Nenhuma publicação disponível.</p></div></div>';bind(container,items);AP.storyService?.rebuild?.();return items;}
AP.feedUI=Object.freeze({render,loadItems});
AP.engine?.register?.('feedUI',AP.feedUI);
})(window);
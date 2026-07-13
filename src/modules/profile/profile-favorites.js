(function(global){
  'use strict';
  if(global.__apProfileFavorites)return;
  global.__apProfileFavorites=true;
  const KEY='ap:favorite-items';
  function read(){try{return Object.values(JSON.parse(localStorage.getItem(KEY)||'{}')).sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt));}catch{return[];}}
  function render(){
    const content=document.getElementById('apProfileContent');
    if(!content)return;
    const items=read();
    if(!items.length){content.innerHTML='<div class="ap-profile-empty"><div>♡</div><h3>Nenhum favorito ainda</h3><p>Salve conteúdos no feed para encontrar depois.</p><a href="feed.html">Abrir feed</a></div>';return;}
    content.innerHTML=`<div class="ap-profile-grid ap-favorites-grid">${items.map(item=>`<article data-favorite-id="${item.id}" data-favorite-media="${item.media}" data-favorite-type="${item.mediaType}">${String(item.mediaType).startsWith('video/')?`<video src="${item.media}" muted playsinline preload="metadata"></video><span class="ap-profile-play">▶</span>`:`<img src="${item.media}" alt="Favorito">`}<small>${item.creator}</small><button type="button" data-remove-favorite="${item.id}">×</button></article>`).join('')}</div>`;
  }
  function openViewer(src,type){
    const viewer=document.getElementById('apProfileViewer');
    const host=document.getElementById('apProfileViewerMedia');
    if(!viewer||!host)return;
    host.innerHTML='';
    const media=String(type).startsWith('video/')?document.createElement('video'):document.createElement('img');
    media.src=src;
    if(media.tagName==='VIDEO'){media.controls=true;media.autoplay=true;media.playsInline=true;}
    host.appendChild(media);
    viewer.classList.add('open');
    viewer.setAttribute('aria-hidden','false');
  }
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-profile-tab="favorites"]');
    if(tab){event.preventDefault();event.stopImmediatePropagation();document.querySelectorAll('[data-profile-tab]').forEach(btn=>btn.classList.toggle('active',btn===tab));render();return;}
    const remove=event.target.closest('[data-remove-favorite]');
    if(remove){event.preventDefault();event.stopPropagation();const data=JSON.parse(localStorage.getItem(KEY)||'{}');delete data[remove.dataset.removeFavorite];localStorage.setItem(KEY,JSON.stringify(data));const social=JSON.parse(localStorage.getItem('ap:social')||'{"likes":{},"favorites":{},"comments":{}}');if(social.favorites)delete social.favorites[remove.dataset.removeFavorite];localStorage.setItem('ap:social',JSON.stringify(social));render();return;}
    const card=event.target.closest('[data-favorite-id]');
    if(card)openViewer(card.dataset.favoriteMedia,card.dataset.favoriteType);
  },true);
})(window);
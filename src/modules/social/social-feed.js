(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apSocialFeed)return;
  global.__apSocialFeed=true;
  let currentId='';

  function state(id){return AP.socialStore?.state(id)||{liked:false,favorite:false,comments:[]};}
  function refreshSlide(slide){
    const s=state(slide.dataset.id);
    const like=slide.querySelector('[data-action="like"]');
    if(like){like.textContent=s.liked?'♥':'♡';like.classList.toggle('liked',s.liked);}
    let favorite=slide.querySelector('[data-action="favorite"]');
    if(!favorite){
      const actions=slide.querySelector('.ap-actions');
      const node=document.createElement('div');
      node.className='ap-action';
      node.innerHTML='<button data-action="favorite" aria-label="Favoritar">☆</button><small>Salvar</small>';
      actions?.insertBefore(node,actions.lastElementChild);
      favorite=node.querySelector('button');
    }
    favorite.textContent=s.favorite?'★':'☆';
    favorite.classList.toggle('saved',s.favorite);
    const commentCount=slide.querySelector('[data-action="comment"]')?.parentElement?.querySelector('small');
    if(commentCount&&s.comments.length)commentCount.textContent=String(s.comments.length);
  }

  function ensureComments(){
    if(document.getElementById('apLocalComments'))return;
    document.body.insertAdjacentHTML('beforeend','<div id="apLocalCommentsBackdrop" class="ap-local-comments-backdrop"></div><section id="apLocalComments" class="ap-local-comments"><header><h2>Comentários</h2><button type="button">×</button></header><div id="apLocalCommentsList"></div><form><input placeholder="Adicionar comentário..." maxlength="280"><button>Enviar</button></form></section>');
    const close=()=>{document.getElementById('apLocalCommentsBackdrop').classList.remove('open');document.getElementById('apLocalComments').classList.remove('open');};
    document.querySelector('#apLocalComments header button').addEventListener('click',close);
    document.getElementById('apLocalCommentsBackdrop').addEventListener('click',close);
    document.querySelector('#apLocalComments form').addEventListener('submit',event=>{event.preventDefault();const input=event.currentTarget.querySelector('input');const text=input.value.trim();if(!text||!currentId)return;AP.socialStore.addComment(currentId,text);input.value='';renderComments();const slide=document.querySelector(`.ap-video-slide[data-id="${CSS.escape(currentId)}"]`);if(slide)refreshSlide(slide);});
  }
  function renderComments(){
    const list=document.getElementById('apLocalCommentsList');
    const comments=AP.socialStore?.listComments(currentId)||[];
    list.innerHTML=comments.length?comments.map(c=>`<article><img src="${c.img}" alt=""><div><strong>${c.name}</strong><p>${c.text}</p><small>${c.time}</small></div></article>`).join(''):'<p class="empty">Seja o primeiro a comentar.</p>';
  }
  function openComments(id){ensureComments();currentId=id;renderComments();document.getElementById('apLocalCommentsBackdrop').classList.add('open');document.getElementById('apLocalComments').classList.add('open');document.querySelectorAll('.ap-video-slide video').forEach(v=>v.pause());}

  document.addEventListener('click',event=>{
    const slide=event.target.closest('.ap-video-slide');
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(!slide||!action)return;
    if(action==='like'){
      event.preventDefault();event.stopImmediatePropagation();
      AP.socialStore.toggleLike(slide.dataset.id);refreshSlide(slide);
    }
    if(action==='favorite'){
      event.preventDefault();event.stopImmediatePropagation();
      AP.socialStore.toggleFavorite(slide.dataset.id);refreshSlide(slide);
    }
    if(action==='comment'){
      event.preventDefault();event.stopImmediatePropagation();openComments(slide.dataset.id);
    }
  },true);

  const observer=new MutationObserver(()=>document.querySelectorAll('.ap-video-slide').forEach(refreshSlide));
  observer.observe(document.documentElement,{subtree:true,childList:true});
  document.querySelectorAll('.ap-video-slide').forEach(refreshSlide);
})(window);
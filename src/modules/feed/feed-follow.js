(function(global){
  'use strict';
  if(global.__apFeedFollow)return;
  global.__apFeedFollow=true;
  const KEY='ap:follows';

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return{};}}
  function write(data){localStorage.setItem(KEY,JSON.stringify(data));}
  function updateButton(button,following){
    button.textContent=following?'✓':'+';
    button.classList.toggle('following',following);
    button.setAttribute('aria-label',following?'Deixar de seguir':'Seguir');
    button.title=following?'Seguindo':'Seguir';
  }
  function enhanceSlide(slide){
    const button=slide.querySelector('[data-action="follow"]');
    const authorId=slide.dataset.authorId;
    if(!button||!authorId)return;
    updateButton(button,!!read()[authorId]);
  }
  function enhanceAll(){document.querySelectorAll('.ap-video-slide').forEach(enhanceSlide);}

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action="follow"]');
    const slide=button?.closest('.ap-video-slide');
    const authorId=slide?.dataset.authorId;
    if(!button||!slide||!authorId)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const follows=read();
    follows[authorId]=!follows[authorId];
    if(!follows[authorId])delete follows[authorId];
    write(follows);
    updateButton(button,!!follows[authorId]);
    window.dispatchEvent(new CustomEvent('ap:follow-changed',{detail:{authorId,following:!!follows[authorId]}}));

    const friendsActive=slide.querySelector('[data-action="friends"]')?.classList.contains('active');
    if(friendsActive&&!follows[authorId]){
      slide.remove();
      if(!document.querySelector('.ap-video-slide'))location.reload();
    }
  },true);

  const observer=new MutationObserver(enhanceAll);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhanceAll);else enhanceAll();
})(window);
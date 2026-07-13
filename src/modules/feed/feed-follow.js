(function(global){
  'use strict';
  if(global.__apFeedFollow)return;
  global.__apFeedFollow=true;
  const KEY='ap:follows';

  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return{};}}
  function write(data){localStorage.setItem(KEY,JSON.stringify(data));}
  function updateButton(button,following){
    const text=following?'✓':'+';
    const label=following?'Deixar de seguir':'Seguir';
    const title=following?'Seguindo':'Seguir';
    if(button.textContent!==text)button.textContent=text;
    if(button.classList.contains('following')!==following)button.classList.toggle('following',following);
    if(button.getAttribute('aria-label')!==label)button.setAttribute('aria-label',label);
    if(button.title!==title)button.title=title;
    button.dataset.followReady='1';
  }
  function enhanceSlide(slide){
    if(!(slide instanceof Element))return;
    const button=slide.querySelector('[data-action="follow"]');
    const authorId=slide.dataset.authorId;
    if(!button||!authorId)return;
    updateButton(button,!!read()[authorId]);
  }
  function enhanceNode(node){
    if(!(node instanceof Element))return;
    if(node.matches('.ap-video-slide'))enhanceSlide(node);
    node.querySelectorAll?.('.ap-video-slide').forEach(enhanceSlide);
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action="follow"]');
    const slide=button?.closest('.ap-video-slide');
    const authorId=slide?.dataset.authorId;
    if(!button||!slide||!authorId)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const follows=read();
    const following=!follows[authorId];
    if(following)follows[authorId]=true;else delete follows[authorId];
    write(follows);
    updateButton(button,following);
    window.dispatchEvent(new CustomEvent('ap:follow-changed',{detail:{authorId,following}}));

    const friendsActive=slide.querySelector('[data-action="friends"]')?.classList.contains('active');
    if(friendsActive&&!following){
      slide.remove();
      if(!document.querySelector('.ap-video-slide'))location.reload();
    }
  },true);

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes)enhanceNode(node);
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
  document.querySelectorAll('.ap-video-slide').forEach(enhanceSlide);
})(window);
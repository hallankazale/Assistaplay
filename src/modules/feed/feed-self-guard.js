(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apFeedSelfGuard||!AP.feedUI)return;
  global.__apFeedSelfGuard=true;

  function currentAuthorId(){
    try{return String(AP.publicationStore?.currentAuthor?.().authorId||'');}
    catch{return '';}
  }

  function protectOwnPosts(container){
    const ownId=currentAuthorId();
    if(!ownId||!container)return;
    container.querySelectorAll(`.ap-video-slide[data-author-id="${CSS.escape(ownId)}"]`).forEach(slide=>{
      slide.dataset.ownPost='1';
      const follow=slide.querySelector('[data-action="follow"]');
      if(follow){follow.hidden=true;follow.disabled=true;follow.setAttribute('aria-hidden','true');}
    });
  }

  const original=AP.feedUI;
  AP.feedUI=Object.freeze({
    ...original,
    async render(container,items){
      const result=await original.render(container,items);
      protectOwnPosts(container);
      return result;
    }
  });

  document.addEventListener('click',event=>{
    const follow=event.target.closest('[data-action="follow"]');
    const slide=follow?.closest('.ap-video-slide');
    if(follow&&slide?.dataset.ownPost==='1'){
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const creator=event.target.closest('[data-action="creator"]');
    const ownSlide=creator?.closest('.ap-video-slide[data-own-post="1"]');
    if(creator&&ownSlide){
      event.preventDefault();
      event.stopImmediatePropagation();
      global.location.href='app.html?view=profile';
    }
  },true);
})(window);
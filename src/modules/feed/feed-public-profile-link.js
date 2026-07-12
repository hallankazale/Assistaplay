(function(global){
  'use strict';
  if(global.__apFeedPublicProfileLink)return;
  global.__apFeedPublicProfileLink=true;

  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-action="creator"]');
    const slide=target?.closest('.ap-video-slide');
    const userId=slide?.dataset.authorId;
    if(!target||!slide||!userId)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    global.location.href=`app.html?view=search&user=${encodeURIComponent(userId)}`;
  },true);
})(window);
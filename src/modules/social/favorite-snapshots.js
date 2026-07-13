(function(global){
  'use strict';
  if(global.__apFavoriteSnapshots)return;
  global.__apFavoriteSnapshots=true;
  const KEY='ap:favorite-items';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch{return{};}}
  function write(data){localStorage.setItem(KEY,JSON.stringify(data));}
  function mediaFromSlide(slide){const media=slide.querySelector('video,img.ap-feed-image');return media?.currentSrc||media?.src||'';}
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action="favorite"]');
    const slide=button?.closest('.ap-video-slide');
    if(!button||!slide)return;
    setTimeout(()=>{
      const saved=button.classList.contains('saved')||button.textContent.trim()==='★';
      const data=read();
      if(saved){
        const creator=slide.querySelector('.ap-creator-name strong')?.textContent.replace('✓','').trim()||'@criador';
        const caption=slide.querySelector('.ap-caption p')?.textContent||'';
        const media=mediaFromSlide(slide);
        const mediaType=slide.querySelector('video')?'video/mp4':'image/jpeg';
        data[slide.dataset.id]={id:slide.dataset.id,creator,caption,media,mediaType,savedAt:new Date().toISOString()};
      }else delete data[slide.dataset.id];
      write(data);
    },0);
  },true);
})(window);
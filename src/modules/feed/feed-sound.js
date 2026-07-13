(function(global){
  'use strict';
  if(global.__apFeedSound)return;
  global.__apFeedSound=true;
  const KEY='ap:feed-sound-enabled';

  function enabled(){return localStorage.getItem(KEY)==='1';}
  function save(value){localStorage.setItem(KEY,value?'1':'0');}
  function icon(video){return video?.closest('.ap-video-slide')?.querySelector('[data-action="sound"]');}
  function sync(video){
    const button=icon(video);
    if(!button)return;
    button.textContent=video.muted?'🔇':'🔊';
    button.classList.toggle('sound-on',!video.muted);
    button.setAttribute('aria-label',video.muted?'Ativar som':'Desativar som');
  }
  function apply(video,value){
    if(!(video instanceof HTMLVideoElement))return;
    video.muted=!value;
    sync(video);
  }
  function applyAll(value){document.querySelectorAll('.ap-feed video').forEach(video=>apply(video,value));}

  document.addEventListener('play',event=>{
    const video=event.target;
    if(!(video instanceof HTMLVideoElement)||!video.closest('.ap-feed'))return;
    apply(video,enabled());
  },true);

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action="sound"]');
    if(button){
      const video=button.closest('.ap-video-slide')?.querySelector('video');
      if(!video)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const next=video.muted;
      save(next);
      applyAll(next);
      if(next)video.play().catch(()=>{});
      return;
    }

    const slide=event.target.closest('.ap-video-slide');
    if(!slide||event.target.closest('[data-action]'))return;
    const video=slide.querySelector('video');
    if(!video||!video.muted)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    save(true);
    applyAll(true);
    video.play().catch(()=>{});
  },true);
})(window);
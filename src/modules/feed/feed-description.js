(function(global){
  'use strict';
  if(global.__apFeedDescription)return;
  global.__apFeedDescription=true;

  function enhance(slide){
    if(!slide||slide.dataset.descriptionReady==='1')return;
    const caption=slide.querySelector('.ap-caption');
    const paragraph=caption?.querySelector('p');
    if(!paragraph)return;
    slide.dataset.descriptionReady='1';
    const text=paragraph.textContent.trim();
    if(text.length<=95)return;
    paragraph.classList.add('ap-description-collapsed');
    const button=document.createElement('button');
    button.type='button';
    button.className='ap-description-toggle';
    button.dataset.action='description-toggle';
    button.textContent='mais';
    caption.appendChild(button);
  }

  function enhanceAll(){document.querySelectorAll('.ap-video-slide').forEach(enhance);}

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action="description-toggle"]');
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    const caption=button.closest('.ap-caption');
    const paragraph=caption?.querySelector('p');
    if(!paragraph)return;
    const expanded=paragraph.classList.toggle('ap-description-expanded');
    paragraph.classList.toggle('ap-description-collapsed',!expanded);
    button.textContent=expanded?'menos':'mais';
  },true);

  const observer=new MutationObserver(enhanceAll);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhanceAll);else enhanceAll();
})(window);
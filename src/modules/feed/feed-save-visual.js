(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
function apply(root=document){
 root.querySelectorAll('[data-save]').forEach(button=>{
  const active=!!AP.profileFavorites?.has?.(button.dataset.save);
  if(button.textContent!=='🔖')button.textContent='🔖';
  if(button.classList.contains('is-saved')!==active)button.classList.toggle('is-saved',active);
  const pressed=active?'true':'false';
  if(button.getAttribute('aria-pressed')!==pressed)button.setAttribute('aria-pressed',pressed);
 });
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-save]');
 if(!button)return;
 requestAnimationFrame(()=>apply(button.closest('.ap-video-slide')||document));
});
document.addEventListener('DOMContentLoaded',()=>apply(document));
AP.feedSaveVisual=Object.freeze({apply});
})(window);
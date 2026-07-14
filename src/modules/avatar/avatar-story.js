(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
if(global.__apUnifiedAvatarStory)return;
global.__apUnifiedAvatarStory=true;
let objectUrl='';
let refreshTimer=0;
const SELECTORS=[
  '.ap-avatar-button','[data-profile-avatar]','.ap-message-avatar',
  '.ap-notification-avatar','.ap-search-avatar','.ap-public-avatar',
  '.ap-user-avatar','.ap-video-slide .ap-avatar',
  '[data-author-id] img[data-avatar]','[data-user-id] img[data-avatar]'
].join(',');
function candidates(root=document){
  const list=[];
  if(root.nodeType===1&&root.matches?.(SELECTORS))list.push(root);
  root.querySelectorAll?.(SELECTORS).forEach(el=>list.push(el));
  return [...new Set(list)];
}
function targetFor(el){
  if(!el.matches('img'))return el;
  return el.closest('.ap-avatar-button,[data-profile-avatar],button,a')||el;
}
function apply(root=document){
  candidates(root).forEach(raw=>{
    const el=targetFor(raw);
    const story=AP.storyService?.find?.(el)||AP.storyService?.find?.(raw)||null;
    el._apStory=story;
    el.classList.toggle('ap-avatar-has-story',!!story);
    el.classList.toggle('ap-story-ring',!!story);
    el.classList.toggle('has-story',!!story);
    el.setAttribute('aria-label',story?'Ver story':'Abrir perfil');
  });
}
async function rebuild(){
  await AP.storyService?.rebuild?.();
  apply(document);
  requestAnimationFrame(()=>apply(document));
  setTimeout(()=>apply(document),120);
  setTimeout(()=>apply(document),600);
  setTimeout(()=>apply(document),1600);
}
function scheduleRebuild(){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>rebuild().catch(()=>{}),40);
}
function close(){
  const viewer=document.getElementById('apUnifiedStoryViewer');
  viewer?.querySelector('video')?.pause();
  viewer?.remove();
}
function open(story){
  if(!story)return false;
  close();
  let src=story.media||story.url||'';
  if(!src&&story.mediaBlob){
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    objectUrl=URL.createObjectURL(story.mediaBlob);
    src=objectUrl;
  }
  if(!src)return false;
  const video=String(story.mediaType||'').startsWith('video/');
  const viewer=document.createElement('div');
  viewer.id='apUnifiedStoryViewer';
  viewer.className='ap-unified-story-viewer';
  viewer.innerHTML=`<div class="ap-unified-story-progress"><i></i></div><button type="button" aria-label="Fechar">×</button>${video?`<video src="${src}" playsinline autoplay controls></video>`:`<img src="${src}" alt="Story">`}`;
  viewer.querySelector('button').onclick=close;
  document.body.appendChild(viewer);
  if(video)viewer.querySelector('video').addEventListener('ended',close,{once:true});
  else setTimeout(close,7000);
  return true;
}
document.addEventListener('click',event=>{
  const el=event.target.closest('.ap-avatar-has-story,.ap-story-ring');
  if(!el)return;
  const story=el._apStory||AP.storyService?.find?.(el);
  if(!story||!open(story))return;
  event.preventDefault();
  event.stopImmediatePropagation();
},true);
const observer=new MutationObserver(scheduleRebuild);
observer.observe(document.documentElement,{childList:true,subtree:true});
global.addEventListener('storage',scheduleRebuild);
global.addEventListener('pageshow',scheduleRebuild);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleRebuild();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleRebuild);
else scheduleRebuild();
setInterval(scheduleRebuild,60000);
AP.avatarStory=Object.freeze({rebuild,apply,open});
})(window);
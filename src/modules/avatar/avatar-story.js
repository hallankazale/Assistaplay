(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
let objectUrl='';
function candidates(root){return root.querySelectorAll?.('.ap-avatar-button,.ap-profile-avatar-button,[data-profile-avatar],.ap-message-avatar,.ap-notification-avatar,.ap-search-avatar,.ap-public-avatar,.ap-user-avatar')||[];}
function apply(root=document){candidates(root).forEach(el=>{const story=AP.storyService?.find?.(el);el.classList.toggle('ap-avatar-has-story',!!story);el.classList.toggle('has-story',!!story);el._apStory=story||null;el.setAttribute('aria-label',story?'Ver story':'Abrir perfil');});}
function close(){const viewer=document.getElementById('apUnifiedStoryViewer');viewer?.querySelector('video')?.pause();viewer?.remove();if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl='';}}
function openStory(story){if(!story)return false;close();let src=story.media||'';if(!src&&story.mediaBlob){objectUrl=URL.createObjectURL(story.mediaBlob);src=objectUrl;}if(!src)return false;const video=String(story.mediaType||'').startsWith('video/');const viewer=document.createElement('div');viewer.id='apUnifiedStoryViewer';viewer.className='ap-unified-story-viewer';viewer.innerHTML='<button type="button" aria-label="Fechar">×</button>'+(video?'<video playsinline autoplay controls></video>':'<img alt="Story">');viewer.querySelector(video?'video':'img').src=src;viewer.querySelector('button').onclick=close;document.body.appendChild(viewer);if(video)viewer.querySelector('video').addEventListener('ended',close,{once:true});else setTimeout(close,7000);return true;}
document.addEventListener('click',event=>{const el=event.target.closest('.ap-avatar-has-story');if(!el||!openStory(el._apStory||AP.storyService?.find?.(el)))return;event.preventDefault();event.stopImmediatePropagation();},true);
const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)apply(node);})));observer.observe(document.documentElement,{childList:true,subtree:true});
async function rebuild(){await AP.storyService?.rebuild?.();apply(document);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>rebuild().catch(()=>{}));else rebuild().catch(()=>{});
setInterval(()=>rebuild().catch(()=>{}),60000);
AP.avatarStory=Object.freeze({rebuild,apply,open:openStory});
})(window);
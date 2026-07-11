(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apProfileStoryFix)return;
  global.__apProfileStoryFix=true;

  const DAY=24*60*60*1000;
  let activeStory=null;
  let activeUrl='';

  async function getLatestStory(){
    if(!AP.publicationStore)return null;
    const items=await AP.publicationStore.listPublished();
    return items.find(item=>item.type==='story'&&item.mediaBlob&&(Date.now()-new Date(item.createdAt).getTime())<DAY)||null;
  }

  function closeViewer(){
    const viewer=document.getElementById('apStoryPublicationViewer');
    if(!viewer)return;
    viewer.querySelector('video')?.pause();
    viewer.remove();
  }

  function openViewer(){
    if(!activeStory||!activeUrl)return;
    closeViewer();
    const isVideo=String(activeStory.mediaType).startsWith('video/');
    const viewer=document.createElement('div');
    viewer.id='apStoryPublicationViewer';
    viewer.className='ap-story-publication-viewer';
    viewer.innerHTML=`<div class="ap-story-publication-progress"><i></i></div><button type="button" aria-label="Fechar">×</button><div class="ap-story-publication-media">${isVideo?`<video src="${activeUrl}" playsinline autoplay controls></video>`:`<img src="${activeUrl}" alt="Story">`}</div>`;
    viewer.querySelector('button').addEventListener('click',closeViewer);
    document.body.appendChild(viewer);
    if(!isVideo)setTimeout(closeViewer,7000);
    else viewer.querySelector('video').addEventListener('ended',closeViewer,{once:true});
  }

  async function apply(){
    if(!/app\.html$/i.test(location.pathname)||new URLSearchParams(location.search).get('view')!=='profile')return;
    const avatar=document.querySelector('[data-profile-avatar]');
    if(!avatar)return;
    activeStory=await getLatestStory();
    if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl='';}
    if(!activeStory){avatar.classList.remove('has-story');return;}
    activeUrl=URL.createObjectURL(activeStory.mediaBlob);
    avatar.classList.add('has-story');
    avatar.setAttribute('aria-label','Ver story');
    avatar.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();openViewer();},{capture:true});
  }

  const observer=new MutationObserver(()=>{if(document.querySelector('[data-profile-avatar]')){observer.disconnect();apply().catch(()=>{});}});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState!=='loading')apply().catch(()=>{});else document.addEventListener('DOMContentLoaded',()=>apply().catch(()=>{}));
})(window);
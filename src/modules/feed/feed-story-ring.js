(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apFeedStoryRing)return;
  global.__apFeedStoryRing=true;

  const DAY=24*60*60*1000;
  let activeStory=null;
  let activeUrl='';

  function readProfile(){
    try{return JSON.parse(localStorage.getItem('ap:profile')||'{}');}
    catch{return {};}
  }

  function currentAuthorId(){
    try{return AP.publicationStore?.currentAuthor?.().authorId||'';}
    catch{return '';}
  }

  async function latestStory(){
    if(!AP.publicationStore)return null;
    const items=await AP.publicationStore.listPublished();
    return items.find(item=>item.type==='story'&&item.mediaBlob&&(Date.now()-new Date(item.createdAt).getTime())<DAY)||null;
  }

  function profileStoryActive(){
    const profile=readProfile();
    if(!profile.story)return false;
    const created=new Date(profile.storyCreatedAt||0).getTime();
    return Number.isFinite(created)&&created>0&&(Date.now()-created)<DAY;
  }

  function closeViewer(){
    const viewer=document.getElementById('apFeedStoryViewer');
    if(!viewer)return;
    viewer.querySelector('video')?.pause();
    viewer.remove();
  }

  function openViewer(){
    const profile=readProfile();
    let source='';
    let isVideo=false;
    if(activeStory?.mediaBlob){
      if(activeUrl)URL.revokeObjectURL(activeUrl);
      activeUrl=URL.createObjectURL(activeStory.mediaBlob);
      source=activeUrl;
      isVideo=String(activeStory.mediaType).startsWith('video/');
    }else if(profileStoryActive())source=profile.story;
    if(!source)return;
    closeViewer();
    const viewer=document.createElement('div');
    viewer.id='apFeedStoryViewer';
    viewer.className='ap-feed-story-viewer';
    viewer.innerHTML=`<div class="ap-feed-story-progress"><i></i></div><button type="button" aria-label="Fechar">×</button><div>${isVideo?`<video src="${source}" playsinline autoplay controls></video>`:`<img src="${source}" alt="Story">`}</div>`;
    viewer.querySelector('button').addEventListener('click',closeViewer);
    document.body.appendChild(viewer);
    if(isVideo)viewer.querySelector('video').addEventListener('ended',closeViewer,{once:true});
    else setTimeout(closeViewer,7000);
  }

  async function apply(){
    const authorId=currentAuthorId();
    if(!authorId)return;
    activeStory=await latestStory();
    const hasStory=!!activeStory||profileStoryActive();
    document.querySelectorAll(`.ap-video-slide[data-author-id="${CSS.escape(authorId)}"] .ap-avatar-button`).forEach(button=>{
      button.classList.toggle('has-story',hasStory);
      button.setAttribute('aria-label',hasStory?'Ver story':'Abrir perfil');
      if(hasStory&&!button.dataset.storyBound){
        button.dataset.storyBound='1';
        button.addEventListener('click',event=>{
          if(!button.classList.contains('has-story'))return;
          event.preventDefault();
          event.stopImmediatePropagation();
          openViewer();
        },true);
      }
    });
  }

  const observer=new MutationObserver(()=>apply().catch(()=>{}));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>apply().catch(()=>{}));
  if(document.readyState!=='loading')apply().catch(()=>{});
  setInterval(()=>apply().catch(()=>{}),60000);

  AP.feedStoryRing=Object.freeze({apply});
})(window);
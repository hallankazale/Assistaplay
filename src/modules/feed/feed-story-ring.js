(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apFeedStoryRing)return;
  global.__apFeedStoryRing=true;

  const DAY=24*60*60*1000;
  const DEMO_STORIES={
    'bea-beauty':{url:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85',mediaType:'image/jpeg',createdAt:new Date().toISOString()},
    'casa-pratica':{url:'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=85',mediaType:'image/jpeg',createdAt:new Date().toISOString()}
  };
  let storiesByAuthor=new Map();
  let activeUrl='';

  function readProfile(){
    try{return JSON.parse(localStorage.getItem('ap:profile')||'{}');}
    catch{return {};}
  }

  function currentAuthorId(){
    try{return AP.publicationStore?.currentAuthor?.().authorId||'';}
    catch{return '';}
  }

  function isActive(createdAt){
    const time=new Date(createdAt||0).getTime();
    return Number.isFinite(time)&&time>0&&(Date.now()-time)<DAY;
  }

  async function buildStoryMap(){
    const map=new Map();
    if(AP.publicationStore){
      const items=await AP.publicationStore.listPublished();
      items.filter(item=>item.type==='story'&&item.mediaBlob&&isActive(item.createdAt)).forEach(item=>{
        const previous=map.get(item.authorId);
        if(!previous||new Date(item.createdAt)>new Date(previous.createdAt))map.set(item.authorId,{kind:'blob',item,createdAt:item.createdAt,mediaType:item.mediaType});
      });
    }
    const profile=readProfile();
    const ownId=currentAuthorId();
    if(ownId&&profile.story&&isActive(profile.storyCreatedAt)){
      const previous=map.get(ownId);
      if(!previous||new Date(profile.storyCreatedAt)>new Date(previous.createdAt))map.set(ownId,{kind:'url',url:profile.story,createdAt:profile.storyCreatedAt,mediaType:'image/jpeg'});
    }
    Object.entries(DEMO_STORIES).forEach(([authorId,story])=>{if(isActive(story.createdAt)&&!map.has(authorId))map.set(authorId,{kind:'url',...story});});
    storiesByAuthor=map;
  }

  function closeViewer(){
    const viewer=document.getElementById('apFeedStoryViewer');
    if(!viewer)return;
    viewer.querySelector('video')?.pause();
    viewer.remove();
  }

  function openViewer(authorId){
    const story=storiesByAuthor.get(authorId);
    if(!story)return;
    let source=story.url||'';
    if(story.kind==='blob'&&story.item?.mediaBlob){
      if(activeUrl)URL.revokeObjectURL(activeUrl);
      activeUrl=URL.createObjectURL(story.item.mediaBlob);
      source=activeUrl;
    }
    if(!source)return;
    closeViewer();
    const isVideo=String(story.mediaType||story.item?.mediaType||'').startsWith('video/');
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
    await buildStoryMap();
    document.querySelectorAll('.ap-video-slide').forEach(slide=>{
      const authorId=slide.dataset.authorId||'';
      const button=slide.querySelector('.ap-avatar-button');
      if(!button)return;
      const hasStory=storiesByAuthor.has(authorId);
      button.classList.toggle('has-story',hasStory);
      button.setAttribute('aria-label',hasStory?'Ver story':'Abrir perfil');
      button.dataset.storyAuthorId=authorId;
      if(!button.dataset.storyBound){
        button.dataset.storyBound='1';
        button.addEventListener('click',event=>{
          const id=button.dataset.storyAuthorId||'';
          if(!button.classList.contains('has-story')||!storiesByAuthor.has(id))return;
          event.preventDefault();
          event.stopImmediatePropagation();
          openViewer(id);
        },true);
      }
    });
  }

  const observer=new MutationObserver(()=>apply().catch(()=>{}));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>apply().catch(()=>{}));
  if(document.readyState!=='loading')apply().catch(()=>{});
  setInterval(()=>apply().catch(()=>{}),60000);

  AP.feedStoryRing=Object.freeze({apply,openViewer});
})(window);
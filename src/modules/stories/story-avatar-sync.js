(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apStoryAvatarSync)return;
  global.__apStoryAvatarSync=true;

  const DAY=24*60*60*1000;
  const stories=new Map();
  let objectUrl='';
  let applying=false;

  function readProfile(){try{return JSON.parse(localStorage.getItem('ap:profile')||'{}');}catch{return {};}}
  function currentAuthor(){try{return AP.publicationStore?.currentAuthor?.()||{};}catch{return {};}}
  function active(createdAt){const t=new Date(createdAt||0).getTime();return Number.isFinite(t)&&t>0&&Date.now()-t<DAY;}
  function normalize(value){return String(value||'').trim().toLowerCase();}

  async function rebuild(){
    stories.clear();
    if(AP.publicationStore){
      const items=await AP.publicationStore.listPublished();
      items.filter(x=>x.type==='story'&&x.mediaBlob&&active(x.createdAt)).forEach(item=>{
        const previous=stories.get(item.authorId);
        if(!previous||new Date(item.createdAt)>new Date(previous.createdAt))stories.set(item.authorId,{kind:'blob',item,createdAt:item.createdAt});
      });
    }
    const profile=readProfile();
    const author=currentAuthor();
    if(profile.story&&active(profile.storyCreatedAt)){
      const own={kind:'url',url:profile.story,mediaType:'image/jpeg',createdAt:profile.storyCreatedAt};
      [author.authorId,author.creator,profile.username,profile.name,profile.avatar].filter(Boolean).forEach(key=>stories.set(normalize(key),own));
    }
  }

  function findStory(element){
    const owner=element.closest('[data-author-id],[data-user-id],[data-profile-id],[data-creator]');
    const profile=readProfile();
    const author=currentAuthor();
    const img=element.matches('img')?element:element.querySelector('img');
    const keys=[owner?.dataset.authorId,owner?.dataset.userId,owner?.dataset.profileId,owner?.dataset.creator,element.dataset.authorId,element.dataset.userId,img?.src];
    const text=owner?.querySelector('.ap-creator-name,strong,[data-username]')?.textContent;
    keys.push(text);
    for(const key of keys){
      if(!key)continue;
      const direct=stories.get(key)||stories.get(normalize(key));
      if(direct)return direct;
    }
    const isOwn=normalize(img?.src)===normalize(profile.avatar)||normalize(text).includes(normalize(profile.username))||normalize(owner?.dataset.authorId)===normalize(author.authorId);
    if(isOwn){
      for(const key of [author.authorId,author.creator,profile.username,profile.name,profile.avatar]){const story=stories.get(key)||stories.get(normalize(key));if(story)return story;}
    }
    return null;
  }

  function closeViewer(){const viewer=document.getElementById('apUnifiedStoryViewer');viewer?.querySelector('video')?.pause();viewer?.remove();}
  function openViewer(story){
    if(!story)return;
    let src=story.url||'';
    const type=story.mediaType||story.item?.mediaType||'';
    if(story.kind==='blob'&&story.item?.mediaBlob){if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(story.item.mediaBlob);src=objectUrl;}
    if(!src)return;
    closeViewer();
    const video=String(type).startsWith('video/');
    const viewer=document.createElement('div');
    viewer.id='apUnifiedStoryViewer';viewer.className='ap-unified-story-viewer';
    viewer.innerHTML=`<div class="ap-unified-story-progress"><i></i></div><button type="button" aria-label="Fechar">×</button>${video?`<video src="${src}" playsinline autoplay controls></video>`:`<img src="${src}" alt="Story">`}`;
    viewer.querySelector('button').onclick=closeViewer;
    document.body.appendChild(viewer);
    if(video)viewer.querySelector('video').addEventListener('ended',closeViewer,{once:true});else setTimeout(closeViewer,7000);
  }

  function candidates(){return document.querySelectorAll('.ap-avatar-button,[data-profile-avatar],.ap-avatar-wrap,.ap-message-avatar,.ap-notification-avatar,.ap-search-avatar,.ap-public-avatar,.ap-user-avatar');}
  async function apply(){
    if(applying)return;applying=true;
    try{
      await rebuild();
      candidates().forEach(node=>{
        const target=node.matches('.ap-avatar-wrap')?(node.querySelector('.ap-avatar-button')||node):node;
        const story=findStory(target);
        target.classList.toggle('ap-story-ring',!!story);
        target.classList.toggle('has-story',!!story);
        target._apStory=story||null;
        if(story&&!target.dataset.apStoryBound){
          target.dataset.apStoryBound='1';
          target.addEventListener('click',event=>{
            if(!target._apStory)return;
            event.preventDefault();event.stopImmediatePropagation();openViewer(target._apStory);
          },true);
        }
      });
    }finally{applying=false;}
  }

  const observer=new MutationObserver(()=>apply().catch(()=>{}));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  global.addEventListener('storage',()=>apply().catch(()=>{}));
  document.addEventListener('DOMContentLoaded',()=>apply().catch(()=>{}));
  if(document.readyState!=='loading')apply().catch(()=>{});
  setInterval(()=>apply().catch(()=>{}),60000);
  AP.storyAvatarSync=Object.freeze({apply,openViewer});
})(window);
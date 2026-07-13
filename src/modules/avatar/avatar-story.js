(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apUnifiedAvatarStory)return;
  global.__apUnifiedAvatarStory=true;

  const DAY=24*60*60*1000;
  let stories=new Map();
  let objectUrl='';

  function readProfile(){try{return JSON.parse(localStorage.getItem('ap:profile')||'{}');}catch{return {};}}
  function currentAuthor(){try{return AP.publicationStore?.currentAuthor?.()||{};}catch{return {};}}
  function normalize(value){return String(value||'').trim().toLowerCase();}
  function active(createdAt){const t=new Date(createdAt||0).getTime();return Number.isFinite(t)&&t>0&&Date.now()-t<DAY;}

  function setStory(key,story){if(!key)return;stories.set(String(key),story);stories.set(normalize(key),story);}

  async function rebuild(){
    stories=new Map();
    if(AP.publicationStore){
      const items=await AP.publicationStore.listPublished();
      items.filter(item=>item.type==='story'&&item.status==='published'&&item.mediaBlob&&active(item.createdAt))
        .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
        .forEach(item=>{
          if(!stories.has(item.authorId))setStory(item.authorId,{kind:'blob',item,createdAt:item.createdAt,mediaType:item.mediaType});
          setStory(item.creator,{kind:'blob',item,createdAt:item.createdAt,mediaType:item.mediaType});
          setStory(item.avatar,{kind:'blob',item,createdAt:item.createdAt,mediaType:item.mediaType});
        });
    }
    const profile=readProfile();
    const author=currentAuthor();
    if(profile.story&&active(profile.storyCreatedAt)){
      const own={kind:'url',url:profile.story,mediaType:'image/jpeg',createdAt:profile.storyCreatedAt};
      [author.authorId,author.creator,author.authorName,author.avatar,profile.username,profile.name,profile.avatar].forEach(key=>setStory(key,own));
    }
    apply(document);
  }

  function keysFor(element){
    const owner=element.closest('[data-author-id],[data-user-id],[data-profile-id],[data-creator]');
    const img=element.matches('img')?element:element.querySelector('img');
    const name=owner?.querySelector('.ap-creator-name,strong,[data-username]')?.textContent||'';
    return [owner?.dataset.authorId,owner?.dataset.userId,owner?.dataset.profileId,owner?.dataset.creator,element.dataset.authorId,element.dataset.userId,img?.src,name];
  }

  function storyFor(element){
    for(const key of keysFor(element)){
      if(!key)continue;
      const story=stories.get(String(key))||stories.get(normalize(key));
      if(story)return story;
    }
    const profile=readProfile();
    const author=currentAuthor();
    const img=element.matches('img')?element:element.querySelector('img');
    const text=element.closest('[data-author-id],.ap-video-slide,article,li')?.textContent||'';
    const own=normalize(img?.src)===normalize(profile.avatar)||normalize(text).includes(normalize(profile.username))||normalize(text).includes(normalize(profile.name));
    if(own){
      for(const key of [author.authorId,author.creator,profile.username,profile.name,profile.avatar]){
        const story=stories.get(String(key||''))||stories.get(normalize(key));
        if(story)return story;
      }
    }
    return null;
  }

  function candidates(root){
    return root.querySelectorAll?.('.ap-avatar-button,[data-profile-avatar],.ap-message-avatar,.ap-notification-avatar,.ap-search-avatar,.ap-public-avatar,.ap-user-avatar')||[];
  }

  function apply(root){
    candidates(root).forEach(element=>{
      const story=storyFor(element);
      element.classList.toggle('ap-avatar-has-story',!!story);
      element.classList.toggle('has-story',!!story);
      element._apStory=story||null;
      element.setAttribute('aria-label',story?'Ver story':'Abrir perfil');
      if(story&&!element.dataset.apStoryBound){
        element.dataset.apStoryBound='1';
        element.addEventListener('click',event=>{
          if(!element._apStory)return;
          event.preventDefault();event.stopImmediatePropagation();openStory(element._apStory);
        },true);
      }
    });
  }

  function close(){const viewer=document.getElementById('apUnifiedStoryViewer');viewer?.querySelector('video')?.pause();viewer?.remove();}
  function openStory(story){
    if(!story)return false;
    close();
    let src=story.url||'';
    const type=story.mediaType||story.item?.mediaType||'';
    if(story.kind==='blob'&&story.item?.mediaBlob){if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(story.item.mediaBlob);src=objectUrl;}
    if(!src)return false;
    const isVideo=String(type).startsWith('video/');
    const viewer=document.createElement('div');viewer.id='apUnifiedStoryViewer';viewer.className='ap-unified-story-viewer';
    viewer.innerHTML=`<div class="ap-unified-story-progress"><i></i></div><button type="button" aria-label="Fechar">×</button>${isVideo?`<video src="${src}" playsinline autoplay controls></video>`:`<img src="${src}" alt="Story">`}`;
    viewer.querySelector('button').onclick=close;document.body.appendChild(viewer);
    if(isVideo)viewer.querySelector('video').addEventListener('ended',close,{once:true});else setTimeout(close,7000);
    return true;
  }

  const observer=new MutationObserver(records=>{records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)apply(node);}));});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  global.addEventListener('storage',()=>rebuild().catch(()=>{}));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>rebuild().catch(()=>{}));else rebuild().catch(()=>{});
  setInterval(()=>rebuild().catch(()=>{}),60000);
  AP.avatarStory=Object.freeze({rebuild,apply,open:openStory});
})(window);
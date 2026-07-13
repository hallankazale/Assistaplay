(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apUnifiedAvatarStory)return;
  global.__apUnifiedAvatarStory=true;
  const DAY=24*60*60*1000;
  let stories=new Map();
  const active=item=>item&&item.type==='story'&&item.status==='published'&&item.mediaBlob&&(Date.now()-new Date(item.createdAt).getTime())<DAY;
  async function rebuild(){
    stories=new Map();
    if(AP.publicationStore){
      const items=await AP.publicationStore.listPublished();
      items.filter(active).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).forEach(item=>{if(item.authorId&&!stories.has(item.authorId))stories.set(item.authorId,item);});
    }
    try{
      const profile=JSON.parse(localStorage.getItem('ap:profile')||'{}');
      const created=new Date(profile.storyCreatedAt||0).getTime();
      const current=AP.publicationStore?.currentAuthor?.();
      if(profile.story&&current?.authorId&&created>0&&(Date.now()-created)<DAY&&!stories.has(current.authorId))stories.set(current.authorId,{authorId:current.authorId,creator:profile.username||current.creator,mediaType:'image/jpeg',media:profile.story,createdAt:profile.storyCreatedAt});
    }catch{}
    apply(document);
  }
  function authorIdFor(button){return button.closest('[data-author-id]')?.dataset.authorId||button.dataset.authorId||'';}
  function apply(root){
    root.querySelectorAll('.ap-avatar-button').forEach(button=>{
      const id=authorIdFor(button);
      const has=!!(id&&stories.has(id));
      button.classList.toggle('ap-avatar-has-story',has);
      button.setAttribute('aria-label',has?'Ver story':'Abrir perfil');
    });
  }
  function close(){const viewer=document.getElementById('apUnifiedStoryViewer');viewer?.querySelector('video')?.pause();viewer?.remove();}
  function open(id){
    const story=stories.get(id);if(!story)return false;close();
    let src=story.media||'';if(!src&&story.mediaBlob)src=URL.createObjectURL(story.mediaBlob);if(!src)return false;
    const isVideo=String(story.mediaType||'').startsWith('video/');
    const viewer=document.createElement('div');viewer.id='apUnifiedStoryViewer';viewer.className='ap-unified-story-viewer';
    viewer.innerHTML=`<button type="button" aria-label="Fechar">×</button>${isVideo?`<video src="${src}" playsinline autoplay controls></video>`:`<img src="${src}" alt="Story">`}`;
    viewer.querySelector('button').onclick=close;document.body.appendChild(viewer);
    if(isVideo)viewer.querySelector('video').addEventListener('ended',close,{once:true});else setTimeout(close,7000);
    return true;
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('.ap-avatar-button.ap-avatar-has-story');if(!button)return;
    const id=authorIdFor(button);if(!id||!open(id))return;
    event.preventDefault();event.stopImmediatePropagation();
  },true);
  const observer=new MutationObserver(records=>{records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)apply(node);}));});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>rebuild().catch(()=>{}));else rebuild().catch(()=>{});
  setInterval(()=>rebuild().catch(()=>{}),60000);
  AP.avatarStory=Object.freeze({rebuild,apply,open});
})(window);
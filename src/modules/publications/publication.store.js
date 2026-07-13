(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const DB_NAME='assistapay-publications';
  const DB_VERSION=1;
  const STORE='publications';
  const STORY_DURATION=24*60*60*1000;
  function openDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,DB_VERSION);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE)){const store=db.createObjectStore(STORE,{keyPath:'id'});store.createIndex('status','status');store.createIndex('authorId','authorId');store.createIndex('createdAt','createdAt');}};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Banco de publicações bloqueado'));});}
  async function withStore(mode,callback){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);const store=tx.objectStore(STORE);let result;try{result=callback(store);}catch(error){db.close();reject(error);return;}tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error||new Error('Operação cancelada'));};});}
  function requestResult(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  function currentAuthor(){const account=AP.engine?.get?.('session')?.getCurrentAccount?.()||{};let profile={};try{profile=JSON.parse(localStorage.getItem('ap:profile')||'{}');}catch{}return {authorId:account.id||account.email||'local-user',creator:profile.username||'@usuario',authorName:profile.name||account.name||'Usuário AssistaPay',avatar:profile.avatar||'https://i.pravatar.cc/96?img=47',bio:profile.bio||''};}
  function storyExpiry(createdAt){return new Date(createdAt).getTime()+STORY_DURATION;}
  function isExpiredStory(item,now=Date.now()){if(item?.type!=='story')return false;const expiresAt=new Date(item.expiresAt||storyExpiry(item.createdAt)).getTime();return !Number.isFinite(expiresAt)||expiresAt<=now;}
  async function purgeExpiredStories(items){const expired=(items||[]).filter(isExpiredStory);if(expired.length)await withStore('readwrite',store=>expired.forEach(item=>store.delete(item.id)));return (items||[]).filter(item=>!isExpiredStory(item));}
  async function save(input){const author=currentAuthor();const createdAt=input.createdAt||new Date().toISOString();const type=input.type||'video';const item={id:input.id||`pub_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,...author,type,status:input.status||'published',createdAt,updatedAt:new Date().toISOString(),expiresAt:type==='story'?(input.expiresAt||new Date(storyExpiry(createdAt)).toISOString()):(input.expiresAt||''),caption:input.caption||'',title:input.title||'',hashtags:input.hashtags||[],objective:input.objective||'Entretenimento',privacy:input.privacy||'Público',allowComments:input.allowComments!==false,allowLikes:input.allowLikes!==false,allowShares:input.allowShares!==false,productId:input.productId||'',product:input.product||null,mediaType:input.media?.type||input.mediaType||'',mediaName:input.media?.name||input.mediaName||'',mediaBlob:input.media||input.mediaBlob||null,coverBlob:input.cover||input.coverBlob||null,likes:input.likes||0,comments:input.comments||0,shares:input.shares||0,saves:input.saves||0,views:input.views||0};await withStore('readwrite',store=>store.put(item));return item;}
  async function get(id){const item=await withStore('readonly',store=>requestResult(store.get(id)));if(isExpiredStory(item)){await remove(id);return null;}return item;}
  async function list(){const items=await withStore('readonly',store=>requestResult(store.getAll()));return (await purgeExpiredStories(items||[])).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));}
  async function listPublished(){return (await list()).filter(item=>item.status==='published');}
  async function listByAuthor(authorId){const all=await list();const own=all.filter(item=>item.authorId===authorId);return own.length?own:all;}
  async function remove(id){return withStore('readwrite',store=>store.delete(id));}
  async function update(id,patch){const item=await get(id);if(!item)return null;return save({...item,...patch,id,mediaBlob:patch.mediaBlob===undefined?item.mediaBlob:patch.mediaBlob});}
  function toViewModel(item){return {...item,media:item.mediaBlob?URL.createObjectURL(item.mediaBlob):'',cover:item.coverBlob?URL.createObjectURL(item.coverBlob):'',likes:String(item.likes||0),comments:String(item.comments||0),shares:String(item.shares||0),saves:String(item.saves||0),category:item.objective||'Conteúdo'};}
  AP.publicationStore=Object.freeze({save,get,list,listPublished,listByAuthor,remove,update,toViewModel,currentAuthor,isExpiredStory,storyDuration:STORY_DURATION});

  function loadScript(src,onload){const s=document.createElement('script');s.src=src;s.defer=true;if(onload)s.onload=onload;document.head.appendChild(s);}
  if(/app\.html$/i.test(global.location.pathname)){
    if(!global.__apCreateFixLoader){global.__apCreateFixLoader=true;loadScript('../src/modules/create/create-fixes.js');}
    if(!global.__apProfileStoryLoader){global.__apProfileStoryLoader=true;const css=document.createElement('link');css.rel='stylesheet';css.href='../src/styles/profile-story-fix.css';document.head.appendChild(css);loadScript('../src/modules/profile/profile-story-fix.js');}
  }
  if(/feed-preview\.html$/i.test(global.location.pathname)){
    if(!global.__apSocialLoader){global.__apSocialLoader=true;const css=document.createElement('link');css.rel='stylesheet';css.href='../src/styles/social-feed.css';document.head.appendChild(css);loadScript('../src/modules/social/social.store.js',()=>loadScript('../src/modules/social/social-feed.js'));}
  }
})(window);
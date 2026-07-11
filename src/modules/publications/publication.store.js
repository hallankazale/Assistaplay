(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const DB_NAME='assistapay-publications';
  const DB_VERSION=1;
  const STORE='publications';
  function openDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,DB_VERSION);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE)){const store=db.createObjectStore(STORE,{keyPath:'id'});store.createIndex('status','status');store.createIndex('authorId','authorId');store.createIndex('createdAt','createdAt');}};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Banco de publicações bloqueado'));});}
  async function withStore(mode,callback){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode);const store=tx.objectStore(STORE);let result;try{result=callback(store);}catch(error){db.close();reject(error);return;}tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error||new Error('Operação cancelada'));};});}
  function requestResult(request){return new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  function currentAuthor(){const account=AP.engine?.get?.('session')?.getCurrentAccount?.()||{};let profile={};try{profile=JSON.parse(localStorage.getItem('ap:profile')||'{}');}catch{}return {authorId:account.id||account.email||'local-user',creator:profile.username||'@usuario',authorName:profile.name||account.name||'Usuário AssistaPay',avatar:profile.avatar||'https://i.pravatar.cc/96?img=47',bio:profile.bio||''};}
  async function save(input){const author=currentAuthor();const item={id:input.id||`pub_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,...author,type:input.type||'video',status:input.status||'published',createdAt:input.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),caption:input.caption||'',title:input.title||'',hashtags:input.hashtags||[],objective:input.objective||'Entretenimento',privacy:input.privacy||'Público',allowComments:input.allowComments!==false,allowLikes:input.allowLikes!==false,allowShares:input.allowShares!==false,productId:input.productId||'',product:input.product||null,mediaType:input.media?.type||input.mediaType||'',mediaName:input.media?.name||input.mediaName||'',mediaBlob:input.media||input.mediaBlob||null,coverBlob:input.cover||input.coverBlob||null,likes:input.likes||0,comments:input.comments||0,shares:input.shares||0,saves:input.saves||0,views:input.views||0};await withStore('readwrite',store=>store.put(item));return item;}
  async function get(id){return withStore('readonly',store=>requestResult(store.get(id)));}
  async function list(){return withStore('readonly',store=>requestResult(store.getAll())).then(items=>(items||[]).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)));}
  async function listPublished(){return (await list()).filter(item=>item.status==='published');}
  async function listByAuthor(authorId){const all=await list();const own=all.filter(item=>item.authorId===authorId);return own.length?own:all;}
  async function remove(id){return withStore('readwrite',store=>store.delete(id));}
  async function update(id,patch){const item=await get(id);if(!item)return null;return save({...item,...patch,id,mediaBlob:patch.mediaBlob===undefined?item.mediaBlob:patch.mediaBlob});}
  function toViewModel(item){return {...item,media:item.mediaBlob?URL.createObjectURL(item.mediaBlob):'',cover:item.coverBlob?URL.createObjectURL(item.coverBlob):'',likes:String(item.likes||0),comments:String(item.comments||0),shares:String(item.shares||0),saves:String(item.saves||0),category:item.objective||'Conteúdo'};}
  AP.publicationStore=Object.freeze({save,get,list,listPublished,listByAuthor,remove,update,toViewModel,currentAuthor});
  if(/app\.html$/i.test(global.location.pathname)){
    if(!global.__apCreateFixLoader){global.__apCreateFixLoader=true;const s=document.createElement('script');s.src='../src/modules/create/create-fixes.js';s.defer=true;document.head.appendChild(s);}
    if(!global.__apProfileStoryLoader){global.__apProfileStoryLoader=true;const css=document.createElement('link');css.rel='stylesheet';css.href='../src/styles/profile-story-fix.css';document.head.appendChild(css);const s=document.createElement('script');s.src='../src/modules/profile/profile-story-fix.js';s.defer=true;document.head.appendChild(s);}
  }
})(window);
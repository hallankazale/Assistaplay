(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const KEY='ap:publications';
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
function write(list){localStorage.setItem(KEY,JSON.stringify(list));return list;}
function currentAuthor(){const user=AP.authModule?.current?.()||{};return {authorId:user.id||'dev-user',creator:user.email?('@'+user.email.split('@')[0]):'@usuario',authorName:user.name||'Usuário',avatar:user.avatar||''};}
const api={
  list:async()=>read(),
  listPublished:async()=>read().filter(item=>(item.status||'published')==='published'),
  get:async id=>read().find(item=>String(item.id)===String(id))||null,
  save:async publication=>{const list=read();const item={id:publication?.id||('pub_'+Date.now()),createdAt:publication?.createdAt||new Date().toISOString(),status:publication?.status||'published',...currentAuthor(),...publication};const index=list.findIndex(x=>x.id===item.id);if(index>=0)list[index]=item;else list.unshift(item);write(list);AP.events?.emit?.('publication:saved',item);return item;},
  remove:async id=>{const list=read().filter(item=>String(item.id)!==String(id));write(list);return true;},
  currentAuthor
};
AP.publicationStore=api;
AP.engine?.register?.('publicationStore',api);
})(window);

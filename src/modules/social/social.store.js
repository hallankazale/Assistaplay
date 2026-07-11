(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const KEY='ap:social';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"likes":{},"favorites":{},"comments":{}}');}catch{return {likes:{},favorites:{},comments:{}};}}
  function write(data){localStorage.setItem(KEY,JSON.stringify(data));}
  function state(id){const data=read();return {liked:!!data.likes[id],favorite:!!data.favorites[id],comments:data.comments[id]||[]};}
  function toggleLike(id){const data=read();data.likes[id]=!data.likes[id];write(data);return data.likes[id];}
  function toggleFavorite(id){const data=read();data.favorites[id]=!data.favorites[id];write(data);return data.favorites[id];}
  function addComment(id,text){const data=read();const list=data.comments[id]||(data.comments[id]=[]);const profile=(()=>{try{return JSON.parse(localStorage.getItem('ap:profile')||'{}');}catch{return{};}})();const item={id:`c_${Date.now()}`,name:profile.name||'Você',text:String(text).trim(),time:'Agora',likes:0,img:profile.avatar||'https://i.pravatar.cc/80?img=47'};list.unshift(item);write(data);return item;}
  function listComments(id){return state(id).comments;}
  AP.socialStore=Object.freeze({state,toggleLike,toggleFavorite,addComment,listComments});
})(window);
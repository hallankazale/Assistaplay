(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const HISTORY_KEY='ap:search-history';
  const FOLLOW_KEY='ap:follows';
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}}
  function write(key,value){localStorage.setItem(key,JSON.stringify(value));}
  function history(){return read(HISTORY_KEY,[]);}
  function addHistory(term){const value=String(term||'').trim();if(!value)return;write(HISTORY_KEY,[value,...history().filter(item=>item.toLowerCase()!==value.toLowerCase())].slice(0,8));}
  function clearHistory(){write(HISTORY_KEY,[]);}
  function follows(){return read(FOLLOW_KEY,{});}
  function isFollowing(id){return !!follows()[id];}
  function toggleFollow(id){const data=follows();data[id]=!data[id];write(FOLLOW_KEY,data);return data[id];}
  AP.searchStore=Object.freeze({history,addHistory,clearHistory,isFollowing,toggleFollow});
})(window);
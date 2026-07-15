(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const KEY='ap:story-archive';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return [];}};
const write=rows=>localStorage.setItem(KEY,JSON.stringify(rows.slice(0,250)));
function save(story){if(!story?.id)return;const rows=read().filter(item=>String(item.id)!==String(story.id));rows.unshift({...story,archivedAt:new Date().toISOString()});write(rows);}
function all(){return read().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));}
function clear(){localStorage.removeItem(KEY);}
function remove(id){write(read().filter(item=>String(item.id)!==String(id)));}
AP.storyArchive=Object.freeze({save,all,clear,remove});
})(window);

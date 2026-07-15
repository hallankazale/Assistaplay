(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const KEY='ap:account-history';
const LIMIT=1000;
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')||[];}catch{return [];}}
function write(items){localStorage.setItem(KEY,JSON.stringify(items.slice(0,LIMIT)));}
function record(type,details={}){const item={id:`hist_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,type:String(type||'activity'),label:String(details.label||type||'Atividade'),details:details.details||'',view:new URLSearchParams(location.search).get('view')||'feed',createdAt:new Date().toISOString()};const items=read();items.unshift(item);write(items);return item;}
function clear(){localStorage.removeItem(KEY);}
function all(){return read();}
function exportData(){return JSON.stringify(read(),null,2);}
function bind(){if(global.__apHistoryBound)return;global.__apHistoryBound=true;record('session.opened',{label:'Aplicativo aberto'});document.addEventListener('click',event=>{const target=event.target.closest('a,button');if(!target)return;const text=(target.getAttribute('aria-label')||target.textContent||'').trim().replace(/\s+/g,' ').slice(0,80);if(!text)return;record('interaction.clicked',{label:`Toque em ${text}`});},{capture:true});global.addEventListener('pageshow',()=>record('page.opened',{label:`Página aberta: ${new URLSearchParams(location.search).get('view')||'feed'}`}));}
AP.accountHistory=Object.freeze({record,all,clear,exportData,bind});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})(window);
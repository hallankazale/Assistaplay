(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const KEY='ap:feed-comments';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const write=v=>localStorage.setItem(KEY,JSON.stringify(v));
let activePost='';
function rows(id){const db=read();return Array.isArray(db[id])?db[id]:[]}
function count(id){return rows(String(id)).length}
function updateCount(id){document.querySelectorAll(`[data-comment-count="${CSS.escape(String(id))}"]`).forEach(el=>el.textContent=String(count(id)))}
function ensure(){let sheet=document.getElementById('apFeedComments');if(sheet)return sheet;sheet=document.createElement('section');sheet.id='apFeedComments';sheet.className='ap-comments-sheet';sheet.setAttribute('aria-hidden','true');sheet.innerHTML='<div class="ap-comments-backdrop" data-comments-close></div><div class="ap-comments-panel" role="dialog" aria-modal="true" aria-label="Comentários"><header><strong>Comentários</strong><button type="button" data-comments-close aria-label="Fechar">×</button></header><div class="ap-comments-list"></div><form class="ap-comments-form"><input maxlength="280" placeholder="Adicionar comentário..." aria-label="Comentário" required><button type="submit">Enviar</button></form></div>';document.body.appendChild(sheet);sheet.addEventListener('click',e=>{if(e.target.closest('[data-comments-close]'))close()});sheet.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const input=e.currentTarget.querySelector('input');const text=input.value.trim();if(!text||!activePost)return;const db=read();const list=Array.isArray(db[activePost])?db[activePost]:[];list.push({id:`c_${Date.now()}`,text,createdAt:new Date().toISOString(),author:'Você'});db[activePost]=list;write(db);input.value='';render();updateCount(activePost);AP.events?.emit?.('feed:commented',{postId:activePost,count:list.length})});return sheet}
function render(){const sheet=ensure();const list=rows(activePost);sheet.querySelector('.ap-comments-list').innerHTML=list.length?list.map(x=>`<article><span>${esc((x.author||'U').slice(0,1).toUpperCase())}</span><div><strong>${esc(x.author||'Usuário')}</strong><p>${esc(x.text)}</p></div></article>`).join(''):'<div class="ap-comments-empty">Seja o primeiro a comentar.</div>'}
function open(postId){activePost=String(postId||'');if(!activePost)return;const sheet=ensure();render();sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');sheet.querySelector('input')?.focus();document.body.classList.add('ap-comments-open')}
function close(){const sheet=document.getElementById('apFeedComments');if(!sheet)return;sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');document.body.classList.remove('ap-comments-open')}
function sync(root=document){root.querySelectorAll('[data-comment]').forEach(button=>{const id=button.dataset.comment;const label=button.nextElementSibling;if(label?.tagName==='SMALL'){label.dataset.commentCount=id;label.textContent=String(count(id))}})}
AP.feedComments=Object.freeze({open,close,count,sync});
})(window);
(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const DAY=86400000;
let stories=[];
const norm=v=>String(v||'').trim().toLowerCase().replace(/^@/,'').replace(/[✓✔]/g,'').replace(/\s+/g,' ');
const active=v=>{const t=new Date(v||0).getTime();return t>0&&Date.now()-t<DAY;};
const json=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f));}catch{return f;}};
const aliases=s=>[s.authorId,s.creator,s.authorName,s.avatar,s.username].map(norm).filter(Boolean);
function add(list,s){if(!s||!active(s.createdAt))return;const a=aliases(s);if(!a.length)return;const old=list.find(x=>x.aliases.some(v=>a.includes(v)));const item={...s,aliases:a};if(!old)list.push(item);else if(new Date(item.createdAt)>new Date(old.createdAt))Object.assign(old,item);}
async function rebuild(){const list=[];if(AP.publicationStore){const items=await AP.publicationStore.listPublished();items.filter(x=>x.type==='story'&&x.status==='published'&&x.mediaBlob).forEach(x=>add(list,x));}const p=json('ap:profile',{});let a={};try{a=AP.publicationStore?.currentAuthor?.()||{};}catch{}if(p.story&&active(p.storyCreatedAt))add(list,{id:'profile-story',authorId:a.authorId||p.id||p.userId,creator:p.username||a.creator,authorName:p.name||a.authorName,avatar:p.avatar||a.avatar,username:p.username,media:p.story,mediaType:'image/jpeg',createdAt:p.storyCreatedAt});stories=list;AP.avatarStory?.apply?.(document);return stories;}
function identities(el){const h=el.closest('[data-author-id],[data-user-id],[data-user],.ap-video-slide,.ap-profile-hero')||el.parentElement;const img=el.matches('img')?el:el.querySelector('img');const name=h?.querySelector?.('.ap-creator-name,[data-username],h2,strong')?.textContent||'';return [h?.dataset?.authorId,h?.dataset?.userId,h?.dataset?.user,img?.src,name,h?.textContent].map(norm).filter(Boolean);}
function same(alias,id){if(alias===id)return true;if(alias.startsWith('http')||id.startsWith('http'))return false;return alias.length>3&&id.includes(alias);}
function find(el){const ids=identities(el);return stories.find(s=>s.aliases.some(a=>ids.some(id=>same(a,id))))||null;}
AP.storyService=Object.freeze({rebuild,find,has:el=>!!find(el),duration:DAY});
})(window);
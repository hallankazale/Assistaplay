(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const DAY=86400000;
let stories=[];
const norm=v=>String(v||'').trim().toLowerCase().replace(/^@/,'').replace(/[✓✔]/g,'').replace(/\s+/g,' ');
const time=v=>new Date(v||0).getTime();
const isActive=story=>{const created=time(story?.createdAt);const expires=time(story?.expiresAt)||created+DAY;return created>0&&Date.now()<expires;};
const aliases=s=>[s.authorId,s.creator,s.authorName,s.avatar,s.username].map(norm).filter(Boolean);
function archive(story){if(!story?.id)return;AP.storyArchive?.save?.({...story,status:'archived',expiredAt:new Date().toISOString()});}
function add(list,story){if(!story)return;if(!isActive(story)){archive(story);return;}const identity=aliases(story);if(!identity.length)return;const item={...story,expiresAt:story.expiresAt||new Date(time(story.createdAt)+DAY).toISOString(),aliases:identity};const existing=list.find(current=>current.aliases.some(value=>identity.includes(value)));if(!existing)list.push(item);else if(time(item.createdAt)>time(existing.createdAt))Object.assign(existing,item);}
async function rebuild(){const list=[];try{const items=await AP.publicationStore?.listPublished?.()||[];items.filter(item=>item?.type==='story'&&item.status!=='deleted').forEach(item=>add(list,item));}catch(error){console.error('Falha ao carregar stories',error);}stories=list.sort((a,b)=>time(b.createdAt)-time(a.createdAt));AP.avatarStory?.apply?.(document);return all();}
function identities(element){const host=element.closest?.('[data-author-id],[data-user-id],[data-user],.ap-video-slide,.ap-profile-hero')||element.parentElement;const image=element.matches?.('img')?element:element.querySelector?.('img');const name=host?.querySelector?.('.ap-creator-name,[data-username],h2,strong')?.textContent||'';return [host?.dataset?.authorId,host?.dataset?.userId,host?.dataset?.user,image?.src,name].map(norm).filter(Boolean);}
function same(alias,id){if(alias===id)return true;if(alias.startsWith('http')||id.startsWith('http'))return false;return alias.length>3&&id.includes(alias);}
function find(element){const ids=identities(element);return stories.find(story=>story.aliases.some(alias=>ids.some(id=>same(alias,id))))||null;}
function byAuthor(identity){const target=norm(identity);return stories.filter(story=>story.aliases.some(alias=>same(alias,target)));}
function all(){return stories.filter(isActive).slice();}
AP.storyService=Object.freeze({rebuild,find,has:element=>!!find(element),byAuthor,all,isActive,duration:DAY});
})(window);
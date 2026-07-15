(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const MAX_FILE=25*1024*1024;
const readFile=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Não foi possível ler o arquivo.'));reader.onload=()=>resolve(String(reader.result||''));reader.readAsDataURL(file);});
const videoDuration=file=>new Promise((resolve,reject)=>{const video=document.createElement('video');const url=URL.createObjectURL(file);video.preload='metadata';video.onloadedmetadata=()=>{const duration=Number(video.duration||0);URL.revokeObjectURL(url);resolve(duration);};video.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Não foi possível analisar o vídeo.'));};video.src=url;});
function archiveStory(item){if(AP.storyArchive?.save)return AP.storyArchive.save(item);let rows=[];try{rows=JSON.parse(localStorage.getItem('ap:story-archive')||'[]');}catch{}rows=[{...item,archivedAt:new Date().toISOString()},...rows.filter(row=>String(row.id)!==String(item.id))].slice(0,250);localStorage.setItem('ap:story-archive',JSON.stringify(rows));}
function render(container){
  container.innerHTML=`<main class="ap-page"><header class="ap-page-header"><a href="../feed.html">‹</a><h1>Criar</h1><span></span></header><form class="ap-card" id="apCreateForm"><label>Tipo</label><select name="type" data-create-type><option value="video">Vídeo</option><option value="image">Imagem</option><option value="story">Story (24 horas)</option></select><label>Descrição</label><textarea name="description" maxlength="500" placeholder="Escreva uma legenda"></textarea><label>Mídia</label><input name="mediaFile" type="file" accept="image/*,video/*"><small data-story-help>Você também pode informar uma URL abaixo.</small><label>URL do vídeo ou imagem</label><input name="media" inputmode="url" placeholder="https://..."><section class="ap-create-story-info" data-story-info hidden><strong>Story</strong><span>Fotos ficam visíveis por 7 segundos. Vídeos podem ter até 60 segundos. O story some após 24 horas e permanece no seu arquivo privado.</span></section><button type="submit">Publicar</button></form><p id="apCreateMessage"></p></main>`;
  const form=container.querySelector('#apCreateForm'),type=form.querySelector('[data-create-type]'),info=form.querySelector('[data-story-info]'),message=container.querySelector('#apCreateMessage'),submit=form.querySelector('button[type="submit"]');
  const sync=()=>{info.hidden=type.value!=='story';};type.addEventListener('change',sync);sync();
  form.addEventListener('submit',async event=>{
    event.preventDefault();message.textContent='';submit.disabled=true;
    try{
      const data=new FormData(form),file=data.get('mediaFile'),kind=String(data.get('type')||'video');let media=String(data.get('media')||'').trim(),mediaType=kind;
      if(file&&file.size){if(file.size>MAX_FILE)throw new Error('O arquivo deve ter no máximo 25 MB.');if(kind==='story'&&file.type.startsWith('video/')){const duration=await videoDuration(file);if(duration>60.1)throw new Error('O vídeo do story deve ter no máximo 60 segundos.');}media=await readFile(file);mediaType=file.type||kind;}
      if(!media)throw new Error('Escolha uma foto, vídeo ou informe uma URL.');
      const createdAt=new Date().toISOString(),author=AP.publicationStore?.currentAuthor?.()||{};
      const item={id:'pub_'+Date.now(),type:kind,description:String(data.get('description')||'').trim(),media,mediaBlob:media,mediaType,status:'published',createdAt,expiresAt:kind==='story'?new Date(Date.now()+86400000).toISOString():null,...author};
      await AP.publicationStore?.save?.(item);
      if(kind==='story')archiveStory(item);
      AP.accountHistory?.record?.(kind==='story'?'story.published':'publication.published',{label:kind==='story'?'Story publicado':'Publicação criada',details:String(item.description||'Sem legenda')});
      message.textContent=kind==='story'?'Story publicado por 24 horas.':'Publicação salva.';form.reset();sync();AP.avatarStory?.rebuild?.();
    }catch(error){message.textContent=error.message||'Não foi possível publicar.';}finally{submit.disabled=false;}
  });
}
AP.createUI=Object.freeze({render});
})(window);

(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  if(global.__apCreateFixes)return;
  global.__apCreateFixes=true;

  function optimizeImage(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=()=>reject(reader.error);
      reader.onload=()=>{
        const image=new Image();
        image.onerror=()=>reject(new Error('Imagem inválida.'));
        image.onload=()=>{
          const max=1600;
          const scale=Math.min(1,max/Math.max(image.width,image.height));
          const canvas=document.createElement('canvas');
          canvas.width=Math.round(image.width*scale);
          canvas.height=Math.round(image.height*scale);
          canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
          canvas.toBlob(blob=>blob?resolve(new File([blob],file.name.replace(/\.[^.]+$/,'.jpg'),{type:'image/jpeg'})):reject(new Error('Falha ao preparar imagem.')),'image/jpeg',.82);
        };
        image.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function prepare(file){
    if(!(file instanceof File)||!file.size)throw new Error('Escolha um arquivo.');
    if(file.type.startsWith('image/')){
      if(file.size>10*1024*1024)throw new Error('A imagem deve ter no máximo 10 MB.');
      return optimizeImage(file);
    }
    if(file.type.startsWith('video/')){
      if(file.size>50*1024*1024)throw new Error('O vídeo deve ter no máximo 50 MB nesta versão.');
      return file;
    }
    throw new Error('Formato de arquivo não permitido.');
  }

  function syncStory(file){
    if(!file.type.startsWith('image/'))return;
    const reader=new FileReader();
    reader.onload=()=>{
      let profile={};
      try{profile=JSON.parse(localStorage.getItem('ap:profile')||'{}');}catch{}
      profile.story=reader.result;
      profile.storyCreatedAt=new Date().toISOString();
      localStorage.setItem('ap:profile',JSON.stringify(profile));
    };
    reader.readAsDataURL(file);
  }

  function tags(value){return String(value||'').split(/\s+/).filter(v=>v.startsWith('#')).slice(0,12);}

  document.addEventListener('change',event=>{
    const input=event.target.closest('.ap-create-form input[type="file"]');
    if(!input)return;
    const file=input.files?.[0];
    if(!file)return;
    const tooLarge=file.type.startsWith('video/')?file.size>50*1024*1024:file.size>10*1024*1024;
    if(tooLarge){event.stopImmediatePropagation();alert(file.type.startsWith('video/')?'Escolha um vídeo de até 50 MB.':'Escolha uma imagem de até 10 MB.');input.value='';}
  },true);

  document.addEventListener('submit',async event=>{
    const form=event.target.closest('.ap-create-form');
    if(!form||!AP.publicationStore)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(!form.reportValidity())return;
    const button=form.querySelector('.ap-gradient-btn');
    const originalText=button?.textContent||'Publicar';
    if(button){button.disabled=true;button.textContent='Preparando arquivo...';}
    try{
      const data=new FormData(form);
      const media=await prepare(data.get('media'));
      if(button)button.textContent='Salvando publicação...';
      const type=form.dataset.createForm;
      const status=type==='product'?'pending-review':'published';
      await AP.publicationStore.save({
        type,status,media,
        title:data.get('title')||data.get('name')||'',
        caption:data.get('caption')||'',
        hashtags:tags(data.get('hashtags')),
        objective:data.get('objective')||'Entretenimento',
        privacy:data.get('privacy')||'Público',
        allowComments:data.get('allowComments')!=='off',
        allowLikes:data.get('allowLikes')!=='off',
        allowShares:data.get('allowShares')!=='off',
        productId:data.get('productId')||'',
        product:type==='product'?{price:data.get('price'),commission:data.get('commission'),stock:data.get('stock'),category:data.get('category')}:null
      });
      if(type==='story')syncStory(media);
      localStorage.removeItem('ap:selected-affiliate-product');
      alert(type==='story'?'Story publicado com sucesso.':'Publicação salva com sucesso.');
      global.location.href=type==='story'?'app.html?view=profile':'feed.html';
    }catch(error){
      if(button){button.disabled=false;button.textContent=originalText;}
      alert(error.message||'Não foi possível salvar a publicação.');
    }
  },true);
})(window);
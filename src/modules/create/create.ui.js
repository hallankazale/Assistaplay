(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
function render(container){
  container.innerHTML='<main class="ap-page"><header class="ap-page-header"><a href="../feed.html">‹</a><h1>Criar</h1><span></span></header><form class="ap-card" id="apCreateForm"><label>Descrição</label><textarea name="description" maxlength="500" required></textarea><label>URL do vídeo ou imagem</label><input name="media" required><label>Tipo</label><select name="type"><option value="video">Vídeo</option><option value="image">Imagem</option><option value="story">Story</option></select><button type="submit">Publicar</button></form><p id="apCreateMessage"></p></main>';
  const form=container.querySelector('#apCreateForm');
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const data=new FormData(form);
    const item={id:'pub_'+Date.now(),type:String(data.get('type')||'video'),description:String(data.get('description')||''),media:String(data.get('media')||''),mediaBlob:String(data.get('media')||''),status:'published',createdAt:new Date().toISOString(),...AP.publicationStore?.currentAuthor?.()};
    await AP.publicationStore?.save?.(item);
    container.querySelector('#apCreateMessage').textContent='Publicação salva.';
    form.reset();
  });
}
AP.createUI=Object.freeze({render});
})(window);
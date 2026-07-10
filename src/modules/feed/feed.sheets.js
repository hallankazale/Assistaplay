(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};

  const comments=[
    {name:'Marina Alves',text:'Eu precisava dessa motivação hoje! 🔥',time:'2 min',likes:128,img:'https://i.pravatar.cc/80?img=32'},
    {name:'Carlos Lima',text:'Qual é o nome da música?',time:'8 min',likes:42,img:'https://i.pravatar.cc/80?img=14'},
    {name:'Ana Paula',text:'Já coloquei a garrafa no carrinho 😍',time:'15 min',likes:77,img:'https://i.pravatar.cc/80?img=47'}
  ];

  function ensureUI(){
    if(document.getElementById('apSheetBackdrop'))return;
    document.body.insertAdjacentHTML('beforeend',`
      <div id="apSheetBackdrop" class="ap-sheet-backdrop"></div>
      <section id="apCommentsSheet" class="ap-sheet" aria-hidden="true">
        <div class="ap-sheet-handle"></div>
        <header class="ap-sheet-header"><h2>Comentários</h2><button class="ap-sheet-close" data-sheet-close>×</button></header>
        <div class="ap-comments-list">${comments.map((c,i)=>`<article class="ap-comment"><img src="${c.img}" alt=""><div><strong>${c.name}</strong><p>${c.text}</p><small>${c.time} · Responder</small></div><button class="ap-comment-like" data-comment-like="${i}">♡<br><small>${c.likes}</small></button></article>`).join('')}</div>
        <form class="ap-comment-form"><input aria-label="Adicionar comentário" placeholder="Adicionar comentário..."><button>Enviar</button></form>
      </section>
      <section id="apProductSheet" class="ap-sheet" aria-hidden="true">
        <div class="ap-sheet-handle"></div>
        <header class="ap-sheet-header"><h2>Produto</h2><button class="ap-sheet-close" data-sheet-close>×</button></header>
        <div class="ap-product-sheet-body">
          <div class="ap-product-hero"><img id="apProductImage" alt="Produto"><div><h3 id="apProductTitle"></h3><div class="ap-product-rating" id="apProductMeta"></div><div class="ap-product-sheet-price" id="apProductPrice"></div><div class="ap-product-sheet-old" id="apProductOld"></div></div></div>
          <div class="ap-product-features"><span>✓ Compra segura</span><span>↺ 7 dias para devolver</span><span>★ Produto bem avaliado</span></div>
          <div class="ap-product-sheet-actions"><button class="ap-secondary">Adicionar</button><button class="ap-buy">Comprar agora</button></div>
        </div>
      </section>
      <section id="apCreatorSheet" class="ap-sheet" aria-hidden="true">
        <div class="ap-sheet-handle"></div>
        <header class="ap-sheet-header"><h2>Perfil do criador</h2><button class="ap-sheet-close" data-sheet-close>×</button></header>
        <div class="ap-creator-body">
          <img id="apCreatorAvatar" class="ap-creator-avatar" alt="Criador">
          <h3 id="apCreatorName"></h3>
          <p id="apCreatorBio">Criador verificado no AssistaPay</p>
          <div class="ap-creator-stats"><span><b>248K</b><small>Seguidores</small></span><span><b>4,8M</b><small>Curtidas</small></span><span><b>126</b><small>Vídeos</small></span></div>
          <button id="apCreatorFollow" class="ap-buy ap-creator-follow">Seguir</button>
        </div>
      </section>`);

    document.getElementById('apSheetBackdrop').addEventListener('click',closeAll);
    document.querySelectorAll('[data-sheet-close]').forEach(btn=>btn.addEventListener('click',closeAll));
    document.querySelector('.ap-comment-form').addEventListener('submit',e=>{e.preventDefault();const input=e.currentTarget.querySelector('input');if(!input.value.trim())return;input.value='';AP.events?.emit('feed:comment-created');});
    document.addEventListener('click',e=>{const like=e.target.closest('[data-comment-like]');if(like)like.innerHTML=like.innerHTML.startsWith('♥')?'♡<br><small>0</small>':'♥<br><small>1</small>';});
    document.getElementById('apCreatorFollow').addEventListener('click',e=>{e.currentTarget.textContent=e.currentTarget.textContent==='Seguindo'?'Seguir':'Seguindo';});
  }

  function open(sheet){ensureUI();closeAll();document.getElementById('apSheetBackdrop').classList.add('open');sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');document.querySelectorAll('.ap-video-slide video').forEach(v=>v.pause());}
  function closeAll(){document.getElementById('apSheetBackdrop')?.classList.remove('open');document.querySelectorAll('.ap-sheet').forEach(s=>{s.classList.remove('open');s.setAttribute('aria-hidden','true');});const visible=[...document.querySelectorAll('.ap-video-slide')].find(s=>{const r=s.getBoundingClientRect();return r.top>=-20&&r.top<innerHeight/2;});visible?.querySelector('video')?.play().catch(()=>{});}
  function openComments(){ensureUI();open(document.getElementById('apCommentsSheet'));}
  function openProduct(product){ensureUI();document.getElementById('apProductImage').src=product.image||'';document.getElementById('apProductTitle').textContent=product.title||'Produto';document.getElementById('apProductMeta').textContent=`★ ${product.rating||'4,9'} · ${product.sold||''}`;document.getElementById('apProductPrice').textContent=product.price||'';document.getElementById('apProductOld').textContent=product.oldPrice?`De ${product.oldPrice}`:'';open(document.getElementById('apProductSheet'));}
  function openCreator(creator){ensureUI();document.getElementById('apCreatorAvatar').src=creator.avatar||'';document.getElementById('apCreatorName').textContent=creator.name||'@criador';document.getElementById('apCreatorBio').textContent=creator.bio||'Criador verificado no AssistaPay';open(document.getElementById('apCreatorSheet'));}

  AP.feedSheets=Object.freeze({openComments,openProduct,openCreator,closeAll});
})(window);
(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};

  const demoItems=[
    {id:'demo_1',creator:'@jessica.carol',caption:'Playlist de treino que mudou minha rotina! 💪🔥 #foco #disciplina',category:'Lifestyle',media:'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',likes:'12,5K',comments:'328',shares:'1,2K',saves:'892',product:{title:'Garrafa Térmica Premium Inox 1L',price:'R$ 89,90',oldPrice:'R$ 129,90',discount:'-31%',rating:'4,9',sold:'12,4K vendidos',image:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=200&q=80'}},
    {id:'demo_2',creator:'@carros.e.motores',caption:'Nada como liberdade sobre quatro rodas. 🔥🏁 #carros #lifestyle',category:'Automóveis',media:'https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4',likes:'25,7K',comments:'512',shares:'2,1K',saves:'1,3K',product:{title:'Mini Aspirador Portátil de Alta Potência',price:'R$ 159,90',oldPrice:'R$ 229,90',discount:'-30%',rating:'4,8',sold:'8,7K vendidos',image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&q=80'}},
    {id:'demo_3',creator:'@casa.pratica',caption:'Uma ideia simples para deixar a casa mais organizada. ✨ #casa #organização',category:'Casa',media:'https://storage.googleapis.com/coverr-main/mp4/Night-Traffic.mp4',likes:'8,4K',comments:'204',shares:'630',saves:'411',product:{title:'Organizador Multiuso Premium',price:'R$ 49,90',oldPrice:'R$ 69,90',discount:'-29%',rating:'4,7',sold:'5,2K vendidos',image:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=200&q=80'}}
  ];

  function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function slideTemplate(item,index){const p=item.product||{};return `<article class="ap-video-slide" data-id="${esc(item.id)}" data-category="${esc(item.category)}">
    <video src="${esc(item.media)}" playsinline muted loop preload="metadata" ${index===0?'autoplay':''}></video>
    <div class="ap-feed-top"><div class="ap-brand">Assista<em>Pay</em></div><div class="ap-feed-tabs"><button class="active">Para você</button><button>Seguindo</button></div><div class="ap-top-actions"><button class="ap-live">LIVE</button><button class="ap-icon-btn ap-search" aria-label="Pesquisar">⌕</button></div></div>
    <div class="ap-reward-toast">+5 pontos</div>
    <aside class="ap-actions">
      <div class="ap-avatar-wrap"><img class="ap-avatar" src="https://i.pravatar.cc/96?img=${index+12}" alt="Perfil"><button data-action="follow" class="ap-follow">+</button></div>
      <div class="ap-action"><button data-action="like" aria-label="Curtir">♡</button><small>${esc(item.likes)}</small></div>
      <div class="ap-action"><button data-action="comment" aria-label="Comentar">◯</button><small>${esc(item.comments)}</small></div>
      <div class="ap-action"><button data-action="share" aria-label="Compartilhar">↗</button><small>${esc(item.shares)}</small></div>
      <div class="ap-action"><button data-action="save" aria-label="Salvar">▱</button><small>${esc(item.saves)}</small></div>
    </aside>
    <div class="ap-caption"><strong>${esc(item.creator)} <span class="ap-verified">✓</span></strong><p>${esc(item.caption)}</p><div class="ap-music">♫ som original - ${esc(item.creator.replace('@',''))}</div></div>
    <button class="ap-product-strip" data-action="product" type="button"><img src="${esc(p.image)}" alt="${esc(p.title)}"><span class="ap-product-copy"><strong>🛒 ${esc(p.title)}</strong><span class="ap-product-meta">★ ${esc(p.rating)} · ${esc(p.sold)}</span><span class="ap-price-row"><b>${esc(p.price)}</b><del>${esc(p.oldPrice)}</del><i>${esc(p.discount)}</i></span></span><span class="ap-product-arrow">›</span></button>
  </article>`;}

  function render(container,items=demoItems){container.innerHTML=items.map(slideTemplate).join('');bind(container);observe(container);}
  function bind(container){container.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(!button)return;const slide=button.closest('.ap-video-slide');const action=button.dataset.action;if(action==='like'){button.textContent=button.textContent==='♥'?'♡':'♥';button.classList.toggle('liked');}if(action==='follow'){button.textContent=button.textContent==='✓'?'+':'✓';}if(action==='share'&&navigator.share){navigator.share({title:'AssistaPay',text:'Veja este vídeo no AssistaPay'}).catch(()=>{});}AP.events?.emit(`feed:${action}`,{contentId:slide?.dataset.id,category:slide?.dataset.category});});}
  function observe(container){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{const video=entry.target.querySelector('video');if(entry.isIntersecting&&entry.intersectionRatio>.72){container.querySelectorAll('video').forEach(item=>{if(item!==video)item.pause();});video?.play().catch(()=>{});AP.events?.emit('feed:view',{contentId:entry.target.dataset.id,category:entry.target.dataset.category});}else video?.pause();});},{threshold:[.72]});container.querySelectorAll('.ap-video-slide').forEach(slide=>observer.observe(slide));}
  AP.feedUI=Object.freeze({render,demoItems});
})(window);
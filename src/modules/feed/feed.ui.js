(function(global){
  'use strict';

  const AP=global.AssistaPay=global.AssistaPay||{};

  const demoItems=[
    {
      id:'demo_1',creator:'@jessica.carol',caption:'Playlist de treino que mudou minha rotina. ✨',category:'Lifestyle',
      media:'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',likes:'12,5K',comments:'328',shares:'1,2K',
      product:{title:'Garrafa Térmica Premium',price:'R$ 89,90',rating:'4,9',sold:'12,4K vendidos',image:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=200&q=80'}
    },
    {
      id:'demo_2',creator:'@carros.e.motores',caption:'Nada como liberdade sobre quatro rodas. 🔥',category:'Automóveis',
      media:'https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4',likes:'25,7K',comments:'512',shares:'2,1K',
      product:{title:'Mini Aspirador Portátil',price:'R$ 159,90',rating:'4,8',sold:'8,7K vendidos',image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=200&q=80'}
    },
    {
      id:'demo_3',creator:'@casa.pratica',caption:'Uma ideia simples para deixar a casa mais organizada.',category:'Casa',
      media:'https://storage.googleapis.com/coverr-main/mp4/Night-Traffic.mp4',likes:'8,4K',comments:'204',shares:'630',
      product:{title:'Organizador Multiuso',price:'R$ 49,90',rating:'4,7',sold:'5,2K vendidos',image:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=200&q=80'}
    }
  ];

  function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}

  function slideTemplate(item,index){
    const product=item.product||{};
    return `<article class="ap-video-slide" data-id="${escapeHtml(item.id)}" data-category="${escapeHtml(item.category)}">
      <video src="${escapeHtml(item.media)}" playsinline muted loop preload="metadata" ${index===0?'autoplay':''}></video>
      <div class="ap-feed-top">
        <div class="ap-brand">Assista<em>Pay</em></div>
        <div class="ap-feed-tabs"><button class="active">Para você</button><button>Seguindo</button></div>
        <button class="ap-icon-btn ap-search" aria-label="Pesquisar">⌕</button>
      </div>
      <div class="ap-reward-toast">+5 pontos pela visualização válida</div>
      <aside class="ap-actions">
        <img class="ap-avatar" src="https://i.pravatar.cc/96?img=${index+12}" alt="Perfil">
        <div class="ap-action"><button data-action="like" aria-label="Curtir">♡</button><small>${escapeHtml(item.likes)}</small></div>
        <div class="ap-action"><button data-action="comment" aria-label="Comentar">💬</button><small>${escapeHtml(item.comments)}</small></div>
        <div class="ap-action"><button data-action="share" aria-label="Compartilhar">↗</button><small>${escapeHtml(item.shares)}</small></div>
        <div class="ap-action"><button data-action="save" aria-label="Salvar">▱</button></div>
      </aside>
      <div class="ap-caption"><strong>${escapeHtml(item.creator)} ✓</strong><p>${escapeHtml(item.caption)}</p><div class="ap-music">♫ som original · AssistaPay</div></div>
      <button class="ap-product-strip" data-action="product" type="button">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}">
        <span><strong>🛒 ${escapeHtml(product.title)}</strong><span class="ap-product-meta">★ ${escapeHtml(product.rating)} · ${escapeHtml(product.sold)}</span><span class="ap-price">${escapeHtml(product.price)}</span></span>
        <span class="ap-product-arrow">›</span>
      </button>
    </article>`;
  }

  function render(container,items=demoItems){container.innerHTML=items.map(slideTemplate).join('');bind(container);observe(container);}

  function bind(container){
    container.addEventListener('click',(event)=>{
      const button=event.target.closest('[data-action]');
      if(!button)return;
      const slide=button.closest('.ap-video-slide');
      const action=button.dataset.action;
      if(action==='like'){button.textContent=button.textContent==='♥'?'♡':'♥';button.style.color=button.textContent==='♥'?'#ff3f68':'';}
      if(action==='share'&&navigator.share){navigator.share({title:'AssistaPay',text:'Veja este vídeo no AssistaPay'}).catch(()=>{});}
      if(action==='product')AP.events?.emit('feed:product-opened',{contentId:slide?.dataset.id});
      AP.events?.emit(`feed:${action}`,{contentId:slide?.dataset.id,category:slide?.dataset.category});
    });
  }

  function observe(container){
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        const video=entry.target.querySelector('video');
        if(entry.isIntersecting&&entry.intersectionRatio>.72){
          container.querySelectorAll('video').forEach((item)=>{if(item!==video)item.pause();});
          video?.play().catch(()=>{});
          const toast=entry.target.querySelector('.ap-reward-toast');
          clearTimeout(entry.target._rewardTimer);
          entry.target._rewardTimer=setTimeout(()=>{toast?.classList.add('show');setTimeout(()=>toast?.classList.remove('show'),1800);},2500);
          AP.events?.emit('feed:view',{contentId:entry.target.dataset.id,category:entry.target.dataset.category});
        }else video?.pause();
      });
    },{threshold:[.72]});
    container.querySelectorAll('.ap-video-slide').forEach((slide)=>observer.observe(slide));
  }

  AP.feedUI=Object.freeze({render,demoItems});
})(window);

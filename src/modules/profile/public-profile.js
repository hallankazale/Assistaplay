(function(global){
  'use strict';
  if(global.__apPublicProfile)return;
  global.__apPublicProfile=true;
  const AP=global.AssistaPay=global.AssistaPay||{};
  const sampleVideos=[
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80'
  ];
  const sampleProducts=[
    {name:'Produto em destaque',price:'R$ 89,90',image:'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80'},
    {name:'Mais vendido',price:'R$ 129,90',image:'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=80'},
    {name:'Oferta especial',price:'R$ 199,90',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
  ];
  let currentUser=null;

  function format(value){if(value>=1000000)return `${(value/1000000).toFixed(1).replace('.',',')} mi`;if(value>=1000)return `${(value/1000).toFixed(value>=100000?0:1).replace('.',',')} mil`;return String(value);}
  function host(){return document.getElementById('apSearchProfile');}
  function renderGrid(type){const target=document.getElementById('apPublicProfileContent');if(!target||!currentUser)return;if(type==='products'){target.innerHTML=`<div class="ap-public-products">${sampleProducts.map((p,i)=>`<button data-public-product="${i}"><img src="${p.image}" alt="${p.name}"><strong>${p.name}</strong><b>${p.price}</b></button>`).join('')}</div>`;return;}target.innerHTML=`<div class="ap-public-videos">${sampleVideos.map((src,i)=>`<button data-public-video="${i}"><img src="${src}" alt="Publicação ${i+1}"><span>▶</span></button>`).join('')}</div>`;}
  function open(id){
    const user=AP.searchService?.getById(id);if(!user)return;
    currentUser=user;
    const following=AP.searchStore?.isFollowing(id);
    const root=host();if(!root)return;
    root.innerHTML=`<main class="ap-public-profile"><header><button data-public-close>‹</button><h2>${user.username}</h2><button data-public-share>↗</button></header><section class="ap-public-hero"><div class="ap-public-avatar"><img src="${user.avatar}" alt="${user.name}">${user.verified?'<span>✓</span>':''}</div><h1>${user.name}</h1><small>${user.username}</small><p>${user.bio}</p><div class="ap-public-stats"><button><b>${format(user.followers+(following?1:0))}</b><span>Seguidores</span></button><button><b>248</b><span>Seguindo</span></button><button><b>1,2 mi</b><span>Curtidas</span></button></div><div class="ap-public-actions"><button class="primary ${following?'following':''}" data-public-follow="${user.id}">${following?'Seguindo':'Seguir'}</button><button data-public-message="${user.id}">Mensagem</button><button data-public-share>Compartilhar</button></div></section><nav class="ap-public-tabs"><button class="active" data-public-tab="videos">Vídeos</button>${user.type==='Loja'||user.type==='Afiliada'?'<button data-public-tab="products">Produtos</button>':''}</nav><section id="apPublicProfileContent"></section></main>`;
    root.classList.add('open');root.setAttribute('aria-hidden','false');renderGrid('videos');
  }
  function close(){const root=host();root?.classList.remove('open');root?.setAttribute('aria-hidden','true');currentUser=null;}
  function updateFollow(){if(!currentUser)return;const following=AP.searchStore.toggleFollow(currentUser.id);document.querySelectorAll(`[data-public-follow="${CSS.escape(currentUser.id)}"]`).forEach(btn=>{btn.textContent=following?'Seguindo':'Seguir';btn.classList.toggle('following',following);});document.querySelectorAll(`[data-follow-user="${CSS.escape(currentUser.id)}"]`).forEach(btn=>{btn.textContent=following?'Seguindo':'Seguir';btn.classList.toggle('following',following);});}
  async function share(){if(!currentUser)return;const data={title:`${currentUser.name} no AssistaPay`,text:`Confira ${currentUser.username} no AssistaPay`,url:location.href};if(navigator.share){try{await navigator.share(data);return;}catch{}}try{await navigator.clipboard.writeText(data.url);alert('Link do perfil copiado.');}catch{alert('Não foi possível copiar o link.');}}

  document.addEventListener('click',event=>{
    const openButton=event.target.closest('[data-open-user]');if(openButton){event.preventDefault();event.stopImmediatePropagation();open(openButton.dataset.openUser);return;}
    if(event.target.closest('[data-public-close]')){event.preventDefault();close();return;}
    if(event.target.closest('[data-public-share]')){event.preventDefault();share();return;}
    if(event.target.closest('[data-public-follow]')){event.preventDefault();updateFollow();return;}
    const tab=event.target.closest('[data-public-tab]');if(tab){document.querySelectorAll('[data-public-tab]').forEach(btn=>btn.classList.toggle('active',btn===tab));renderGrid(tab.dataset.publicTab);return;}
    const message=event.target.closest('[data-public-message]');if(message){localStorage.setItem('ap:pending-chat-user',message.dataset.publicMessage);location.href='app.html?view=messages';return;}
    if(event.target.closest('[data-public-video]'))location.href='feed.html';
  },true);

  AP.publicProfile=Object.freeze({open,close});
})(window);
(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};

  const products=[
    {name:'Smartwatch X1',price:'R$ 199,90',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80'},
    {name:'Kit Skincare',price:'R$ 129,90',image:'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80'},
    {name:'Fone Bluetooth Pro',price:'R$ 129,90',image:'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=500&q=80'},
    {name:'Air Fryer 5L',price:'R$ 299,90',image:'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=500&q=80'}
  ];

  function nav(active){return `<nav class="ap-page-nav"><a href="feed.html" class="${active==='home'?'active':''}"><span>⌂</span>Início</a><a href="app.html?view=shop" class="${active==='shop'?'active':''}"><span>▱</span>Shop</a><a href="app.html?view=create" class="create ${active==='create'?'active':''}"><span>+</span></a><a href="app.html?view=wallet" class="${active==='wallet'?'active':''}"><span>▤</span>Carteira</a><a href="app.html?view=profile" class="${active==='profile'?'active':''}"><span>♙</span>Perfil</a></nav>`;}
  function header(title){return `<header class="ap-page-header"><a href="feed.html">‹</a><h1>${title}</h1><span></span></header>`;}

  function shop(){return `<main class="ap-page">${header('Shop')}<input class="ap-search-box" placeholder="Buscar produtos..."><div class="ap-chip-row"><button class="ap-chip active">Todos</button><button class="ap-chip">Eletrônicos</button><button class="ap-chip">Beleza</button><button class="ap-chip">Casa</button></div><div class="ap-product-grid">${products.map(p=>`<article class="ap-card"><img src="${p.image}" alt="${p.name}"><div class="ap-card-body"><strong>${p.name}</strong><b>${p.price}</b></div></article>`).join('')}</div></main>${nav('shop')}`;}
  function wallet(){return `<main class="ap-page">${header('Carteira')}<section class="ap-wallet-card"><small>Saldo disponível</small><h2>R$ 1.256,80</h2></section><div class="ap-actions-row"><button>＋<br>Depositar</button><button>⇩<br>Sacar</button><button>▤<br>Extrato</button><button>•••<br>Mais</button></div><section class="ap-wallet-card"><small>Ganhos deste mês</small><h2>R$ 1.256,80</h2></section></main>${nav('wallet')}`;}
  function profile(){const account=AP.engine?.get?.('session')?.getCurrentAccount?.();return `<main class="ap-page">${header('Perfil')}<section class="ap-profile-card"><img src="https://i.pravatar.cc/160?img=47" alt="Perfil"><h2>${account?.name||'Ana Silva'}</h2><small>${account?.email||'@anasilva'}</small><div class="ap-profile-stats"><div><b>1.245</b><small>Pontos</small></div><div><b>R$ 1.256</b><small>Saldo</small></div><div><b>28</b><small>Conquistas</small></div></div><button class="ap-gradient-btn" id="apLogout">Sair da conta</button></section></main>${nav('profile')}`;}
  function create(){return `<main class="ap-page">${header('Criar')}<section class="ap-create-box"><div><div class="icon">＋</div><h2>Publique seu conteúdo</h2><p>Envie um vídeo ou imagem para anunciar.</p><button>Selecionar arquivo</button></div></section></main>${nav('create')}`;}

  function render(container){const view=new URLSearchParams(global.location.search).get('view')||'shop';container.innerHTML=view==='wallet'?wallet():view==='profile'?profile():view==='create'?create():shop();document.getElementById('apLogout')?.addEventListener('click',()=>{AP.engine?.get?.('auth-module')?.signOut?.();global.location.href='index.html';});}
  AP.pagesUI=Object.freeze({render});
})(window);
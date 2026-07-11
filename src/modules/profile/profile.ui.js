(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const KEY='ap:profile';

  function read(){
    const account=AP.engine?.get?.('session')?.getCurrentAccount?.()||{};
    try{
      const saved=JSON.parse(localStorage.getItem(KEY)||'null');
      if(saved)return {...defaults(account),...saved};
    }catch{}
    return defaults(account);
  }
  function defaults(account){
    const base=(account.name||'Usuário AssistaPay').trim();
    return {name:base,username:'@'+base.toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,''),bio:'Criando, descobrindo e ganhando com o AssistaPay.',avatar:'https://i.pravatar.cc/240?img=47',followers:1240,following:328,likes:18600};
  }
  function write(profile){localStorage.setItem(KEY,JSON.stringify(profile));}
  function nav(){return `<nav class="ap-page-nav"><a href="feed.html"><span>⌂</span>Início</a><a href="app.html?view=shop"><span>▱</span>Shop</a><a href="app.html?view=create" class="create"><span>+</span></a><a href="app.html?view=wallet"><span>▤</span>Carteira</a><a href="app.html?view=profile" class="active"><span>♙</span>Perfil</a></nav>`;}

  function render(container){
    const p=read();
    container.innerHTML=`<main class="ap-page ap-profile-page">
      <header class="ap-profile-top"><a href="feed.html">‹</a><h1>Perfil</h1><button data-profile-settings>⚙</button></header>
      <section class="ap-profile-hero">
        <img src="${p.avatar}" alt="Foto de perfil" id="apProfileAvatar">
        <h2 id="apProfileName">${p.name}</h2>
        <span id="apProfileUsername">${p.username}</span>
        <p id="apProfileBio">${p.bio}</p>
        <div class="ap-profile-counts"><button><b>${p.following}</b><small>Seguindo</small></button><button><b>${p.followers}</b><small>Seguidores</small></button><button><b>${p.likes}</b><small>Curtidas</small></button></div>
        <div class="ap-profile-buttons"><button data-edit-profile>Editar perfil</button><button data-share-profile>Compartilhar</button></div>
      </section>
      <nav class="ap-profile-tabs" id="apProfileTabs"><button class="active" data-profile-tab="videos">▦ Vídeos</button><button data-profile-tab="products">▱ Produtos</button><button data-profile-tab="favorites">♡ Favoritos</button></nav>
      <section class="ap-profile-content" id="apProfileContent"></section>
    </main>${nav()}
    <div class="ap-profile-backdrop" id="apProfileBackdrop"></div>
    <section class="ap-profile-sheet" id="apProfileSheet"><div class="ap-profile-handle"></div><header><h2 id="apProfileSheetTitle"></h2><button data-profile-close>×</button></header><div id="apProfileSheetBody"></div></section>`;
    bind(container);showTab(container,'videos');
  }

  function showTab(container,tab){
    container.querySelectorAll('[data-profile-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.profileTab===tab));
    const content=container.querySelector('#apProfileContent');
    if(tab==='videos')content.innerHTML='<div class="ap-profile-grid"><article><div>▶</div><small>12,4 mil</small></article><article><div>▶</div><small>8,7 mil</small></article><article><div>▶</div><small>5,2 mil</small></article></div>';
    if(tab==='products')content.innerHTML='<div class="ap-profile-empty"><div>▱</div><h3>Nenhum produto publicado</h3><p>Seus produtos aparecerão aqui.</p><a href="app.html?view=create">Publicar produto</a></div>';
    if(tab==='favorites')content.innerHTML='<div class="ap-profile-empty"><div>♡</div><h3>Nenhum favorito ainda</h3><p>Salve vídeos e produtos para encontrar depois.</p></div>';
  }
  function open(container,title,body){container.querySelector('#apProfileSheetTitle').textContent=title;container.querySelector('#apProfileSheetBody').innerHTML=body;container.querySelector('#apProfileBackdrop').classList.add('open');container.querySelector('#apProfileSheet').classList.add('open');}
  function close(container){container.querySelector('#apProfileBackdrop').classList.remove('open');container.querySelector('#apProfileSheet').classList.remove('open');}
  function editForm(){const p=read();return `<form class="ap-profile-form" id="apProfileForm"><label>Foto de perfil</label><input name="avatar" value="${p.avatar}"><label>Nome</label><input name="name" value="${p.name}" required><label>Nome de usuário</label><input name="username" value="${p.username}" required><label>Bio</label><textarea name="bio" maxlength="120">${p.bio}</textarea><button class="ap-gradient-btn">Salvar alterações</button></form>`;}
  function settings(){return `<div class="ap-profile-settings-list"><button>Conta e segurança</button><button>Privacidade</button><button>Notificações</button><button>Compras e pedidos</button><button>Central de ajuda</button><button class="danger" data-profile-logout>Sair da conta</button></div>`;}

  function bind(container){
    container.querySelector('#apProfileBackdrop').addEventListener('click',()=>close(container));
    container.addEventListener('click',event=>{
      const tab=event.target.closest('[data-profile-tab]');if(tab)showTab(container,tab.dataset.profileTab);
      if(event.target.closest('[data-edit-profile]'))open(container,'Editar perfil',editForm());
      if(event.target.closest('[data-profile-settings]'))open(container,'Configurações',settings());
      if(event.target.closest('[data-profile-close]'))close(container);
      if(event.target.closest('[data-profile-logout]')){AP.engine?.get?.('auth-module')?.signOut?.();global.location.href='index.html';}
      if(event.target.closest('[data-share-profile]')){const p=read();if(navigator.share)navigator.share({title:p.name,text:`Veja meu perfil ${p.username} no AssistaPay`,url:global.location.href}).catch(()=>{});else navigator.clipboard?.writeText(global.location.href);}
    });
    container.addEventListener('submit',event=>{
      const form=event.target.closest('#apProfileForm');if(!form)return;event.preventDefault();
      const data=new FormData(form);const current=read();
      const profile={...current,name:String(data.get('name')).trim(),username:String(data.get('username')).trim(),bio:String(data.get('bio')).trim(),avatar:String(data.get('avatar')).trim()||current.avatar};
      write(profile);close(container);render(container);
    });
  }
  AP.profileUI=Object.freeze({render});
})(window);
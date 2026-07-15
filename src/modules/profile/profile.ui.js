(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
function profile(){
  const saved=AP.storage?.get?.('profile',{})||AP.storage?.read?.('profile',{})||{};
  const user=AP.session?.user?.()||{};
  return {
    name:saved.name||user.name||'Usuário AssistaPay',
    username:saved.username||user.username||'@usuario',
    bio:saved.bio||'Criador no AssistaPay',
    followers:Number(saved.followers||user.followers||0),
    following:Number(saved.following||user.following||0),
    likes:Number(saved.likes||user.likes||0)
  };
}
function initials(name){return String(name||'AP').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'AP';}
function render(container){
  const p=profile();
  container.innerHTML=`<main class="ap-profile-page">
    <header class="ap-profile-header"><a href="../feed.html" aria-label="Voltar">‹</a><h1>Perfil</h1><button type="button" aria-label="Mais opções">⋯</button></header>
    <section class="ap-profile-hero">
      <div class="ap-profile-avatar-lg">${initials(p.name)}</div>
      <h2 class="ap-profile-name">${p.name}</h2>
      <p class="ap-profile-username">${p.username}</p>
      <p class="ap-profile-bio">${p.bio}</p>
    </section>
    <section class="ap-profile-stats">
      <div class="ap-profile-stat"><strong>${p.following}</strong><span>Seguindo</span></div>
      <div class="ap-profile-stat"><strong>${p.followers}</strong><span>Seguidores</span></div>
      <div class="ap-profile-stat"><strong>${p.likes}</strong><span>Curtidas</span></div>
    </section>
    <section class="ap-profile-actions">
      <a class="primary" href="app.html?view=profile-edit">Editar perfil</a>
      <a class="secondary" href="app.html?view=showcase">Minha vitrine</a>
    </section>
    <section class="ap-profile-menu">
      <a href="app.html?view=showcase"><span class="icon">🛍</span><span><strong>Minha Vitrine</strong><small>Produtos e indicações</small></span><em>›</em></a>
      <a href="app.html?view=seller-center"><span class="icon">▦</span><span><strong>Centro do Vendedor</strong><small>Vendas, comissões e produtos</small></span><em>›</em></a>
      <a href="app.html?view=wallet"><span class="icon">◈</span><span><strong>Carteira</strong><small>Saldo e movimentações</small></span><em>›</em></a>
    </section>
    <nav class="ap-profile-tabs" aria-label="Conteúdo do perfil"><button class="active" type="button">Vídeos</button><button type="button">Salvos</button><button type="button">Curtidos</button></nav>
    <section class="ap-profile-grid" aria-label="Publicações"><div>▶</div><div>▶</div><div>▶</div></section>
  </main>`;
}
AP.profileUI=Object.freeze({render,profile});
})(window);
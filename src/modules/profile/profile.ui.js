(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
function profile(){
  const saved=AP.storage?.get?.('profile',{})||{};
  const user=AP.session?.user?.()||{};
  return {name:saved.name||user.name||'Usuário AssistaPay',username:saved.username||user.username||'@usuario',bio:saved.bio||'Criador no AssistaPay'};
}
function render(container){
  const p=profile();
  container.innerHTML='<main class="ap-page"><header class="ap-page-header"><a href="../feed.html">‹</a><h1>Perfil</h1><span></span></header><section class="ap-card" style="text-align:center"><div class="ap-profile-avatar">👤</div><h2>'+p.name+'</h2><p>'+p.username+'</p><p>'+p.bio+'</p></section><section class="ap-card"><a href="app.html?view=showcase">Minha Vitrine</a><br><a href="app.html?view=seller-center">Centro do Vendedor</a><br><a href="app.html?view=wallet">Carteira</a></section></main>';
}
AP.profileUI=Object.freeze({render,profile});
})(window);
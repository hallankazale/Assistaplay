(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};

  function currentView(){return new URLSearchParams(global.location.search).get('view')||'';}
  function template(){
    const view=currentView();
    return `<a href="feed.html" class="${!view?'active':''}"><span>⌂</span>Início</a><a href="app.html?view=search" class="${view==='search'?'active':''}"><span>⌕</span>Pesquisar</a><a href="app.html?view=create" class="create ${view==='create'?'active':''}"><span>+</span></a><a href="app.html?view=messages" class="${view==='messages'?'active':''}"><span>✉</span>Mensagens</a><a href="app.html?view=profile" class="${view==='profile'?'active':''}"><span>♙</span>Perfil</a>`;
  }
  function sync(root=document){
    root.querySelectorAll('.ap-page-nav').forEach(nav=>{
      if(nav.dataset.standardNav==='1')return;
      nav.innerHTML=template();
      nav.dataset.standardNav='1';
      nav.style.gridTemplateColumns='repeat(5,1fr)';
    });
  }
  function start(){
    const root=document.getElementById('appPage')||document.body;
    sync(root);
    const observer=new MutationObserver(records=>{
      for(const record of records){
        for(const node of record.addedNodes){
          if(node.nodeType===1)sync(node);
        }
      }
    });
    observer.observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  AP.bottomNav=Object.freeze({sync});
})(window);
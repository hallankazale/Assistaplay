(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};

  function mount(){
    if(document.getElementById('apAppMenu'))return;
    document.body.insertAdjacentHTML('beforeend',`
      <div class="ap-menu-backdrop" id="apMenuBackdrop"></div>
      <aside class="ap-side-menu" id="apAppMenu" aria-hidden="true">
        <header><div class="ap-menu-logo">Assista<span>Pay</span></div><button data-menu-close aria-label="Fechar">×</button></header>
        <div class="ap-menu-user"><div class="ap-menu-avatar">👤</div><div><strong id="apMenuUserName">Conta AssistaPay</strong><small id="apMenuUserRole">Usuário</small></div></div>
        <nav>
          <button data-menu-action="home">⌂ <span>Início</span></button>
          <button data-menu-action="notifications">🔔 <span>Notificações</span><b id="apMenuNotificationBadge"></b></button>
          <button data-menu-action="restart">↶ <span>Ver apresentação novamente</span></button>
          <button data-menu-action="logout" class="danger">⇥ <span>Sair da conta</span></button>
        </nav>
      </aside>`);

    document.getElementById('apMenuBackdrop').addEventListener('click',close);
    document.querySelector('[data-menu-close]').addEventListener('click',close);
    document.getElementById('apAppMenu').addEventListener('click',event=>{
      const button=event.target.closest('[data-menu-action]');
      if(!button)return;
      const action=button.dataset.menuAction;
      if(action==='home'){close();document.querySelector('.ap-feed')?.scrollTo({top:0,behavior:'smooth'});}
      if(action==='notifications'){global.location.href='app.html?view=notifications';}
      if(action==='restart'){sessionStorage.removeItem('ap:onboarded');global.location.href='index.html?preview=1';}
      if(action==='logout'){
        AP.engine?.get?.('auth-module')?.signOut?.();
        sessionStorage.removeItem('ap:onboarded');
        global.location.href='index.html';
      }
    });
  }

  function open(){
    mount();
    const account=AP.engine?.get?.('session')?.getCurrentAccount?.();
    document.getElementById('apMenuUserName').textContent=account?.name||'Conta AssistaPay';
    document.getElementById('apMenuUserRole').textContent=account?.roles?.includes('advertiser')?'Usuário e anunciante':'Usuário';
    const badge=document.getElementById('apMenuNotificationBadge');
    const unread=AP.notificationsStore?.unreadCount?.()||0;
    if(badge){badge.textContent=unread?String(unread):'';badge.style.display=unread?'inline-grid':'none';}
    document.getElementById('apMenuBackdrop').classList.add('open');
    const menu=document.getElementById('apAppMenu');menu.classList.add('open');menu.setAttribute('aria-hidden','false');
  }

  function close(){
    document.getElementById('apMenuBackdrop')?.classList.remove('open');
    const menu=document.getElementById('apAppMenu');menu?.classList.remove('open');menu?.setAttribute('aria-hidden','true');
  }

  AP.appMenu=Object.freeze({mount,open,close});
})(window);
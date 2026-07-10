(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};

  function render(container){
    container.innerHTML=`<div class="ap-onboarding-card">
      <section class="ap-screen-step ap-intro active" data-step="1">
        <div class="ap-logo">Assista<span>Pay</span></div>
        <p class="ap-tagline">Assista. Descubra. Ganhe.</p>
        <p class="ap-copy">O app de vídeos que te recompensa e te conecta às melhores ofertas.</p>
        <div class="ap-step-dots"><i class="active"></i><i></i><i></i></div>
        <button class="ap-gradient-btn" data-next="2">Começar</button>
      </section>

      <section class="ap-screen-step ap-choice" data-step="2">
        <button class="ap-back" data-back="1">‹</button>
        <h1>Quem é você?</h1>
        <p>Escolha como deseja usar o AssistaPay</p>
        <button class="ap-role-card" data-role="user"><span class="ap-role-icon">👤</span><strong>Sou usuário comum</strong><small>Assista vídeos, descubra produtos e ganhe recompensas.</small></button>
        <button class="ap-role-card" data-role="advertiser"><span class="ap-role-icon">🏪</span><strong>Sou anunciante</strong><small>Divulgue seus produtos, alcance milhares de pessoas e venda mais.</small></button>
        <div class="ap-login-link">Já tem conta? <button data-login>Entrar</button></div>
      </section>

      <section class="ap-screen-step ap-signup" data-step="3">
        <button class="ap-back" data-back="2">‹</button>
        <h1>Quase lá!</h1>
        <p>Crie sua conta para continuar</p>
        <form class="ap-form" id="apSignupForm">
          <input name="name" placeholder="Nome completo" required minlength="2">
          <input name="email" type="email" placeholder="E-mail" required>
          <div class="ap-input-wrap"><input name="password" type="password" placeholder="Senha" required minlength="4"><button type="button" class="ap-eye" data-eye>◉</button></div>
          <button class="ap-gradient-btn" type="submit">Criar conta</button>
        </form>
        <div class="ap-divider">ou continue com</div>
        <div class="ap-socials"><button class="ap-social">G</button><button class="ap-social">●</button><button class="ap-social">f</button></div>
        <div class="ap-login-link">Já tem conta? <button data-login>Entrar</button></div>
      </section>
    </div>`;
    bind(container);
  }

  function show(container,step){container.querySelectorAll('.ap-screen-step').forEach(el=>el.classList.toggle('active',el.dataset.step===String(step)));}
  function bind(container){
    let selectedRole='user';
    container.addEventListener('click',e=>{
      const next=e.target.closest('[data-next]'); if(next) show(container,next.dataset.next);
      const back=e.target.closest('[data-back]'); if(back) show(container,back.dataset.back);
      const role=e.target.closest('[data-role]'); if(role){selectedRole=role.dataset.role;container.querySelectorAll('[data-role]').forEach(el=>el.classList.remove('selected'));role.classList.add('selected');setTimeout(()=>show(container,3),180);}
      const eye=e.target.closest('[data-eye]'); if(eye){const input=eye.previousElementSibling;input.type=input.type==='password'?'text':'password';}
    });
    container.querySelector('#apSignupForm').addEventListener('submit',e=>{
      e.preventDefault();
      const form=new FormData(e.currentTarget);
      const auth=AP.engine?.get?.('auth-module');
      const result=auth?.signUp({name:form.get('name'),email:form.get('email'),password:form.get('password'),roles:selectedRole==='advertiser'?['user','advertiser']:['user']});
      if(result?.ok){sessionStorage.setItem('ap:onboarded','1');global.location.href='feed.html';return;}
      alert(result?.error==='email-exists'?'Este e-mail já está cadastrado.':'Confira os dados e tente novamente.');
    });
  }

  AP.onboardingUI=Object.freeze({render});
})(window);
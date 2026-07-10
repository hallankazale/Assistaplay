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
        <button class="ap-text-btn" data-skip-login>Já tenho uma conta</button>
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
          <input name="name" autocomplete="name" placeholder="Nome completo" required minlength="2">
          <input name="email" autocomplete="email" type="email" placeholder="E-mail" required>
          <div class="ap-input-wrap"><input name="password" autocomplete="new-password" type="password" placeholder="Senha" required minlength="4"><button type="button" class="ap-eye" data-eye>◉</button></div>
          <div class="ap-form-status" data-signup-status aria-live="polite"></div>
          <button class="ap-gradient-btn" type="submit">Criar conta</button>
        </form>
        <div class="ap-divider">ou continue com</div>
        <div class="ap-socials"><button class="ap-social" data-social="Google">G</button><button class="ap-social" data-social="Apple">●</button><button class="ap-social" data-social="Facebook">f</button></div>
        <div class="ap-login-link">Já tem conta? <button data-login>Entrar</button></div>
      </section>

      <section class="ap-screen-step ap-signup" data-step="4">
        <button class="ap-back" data-back="2">‹</button>
        <h1>Bem-vindo de volta!</h1>
        <p>Entre para continuar no AssistaPay</p>
        <form class="ap-form" id="apLoginForm">
          <input name="email" autocomplete="email" type="email" placeholder="E-mail" required>
          <div class="ap-input-wrap"><input name="password" autocomplete="current-password" type="password" placeholder="Senha" required><button type="button" class="ap-eye" data-eye>◉</button></div>
          <button type="button" class="ap-forgot" data-forgot>Esqueci minha senha</button>
          <div class="ap-form-status" data-login-status aria-live="polite"></div>
          <button class="ap-gradient-btn" type="submit">Entrar</button>
        </form>
        <div class="ap-divider">ou continue com</div>
        <div class="ap-socials"><button class="ap-social" data-social="Google">G</button><button class="ap-social" data-social="Apple">●</button><button class="ap-social" data-social="Facebook">f</button></div>
        <div class="ap-login-link">Ainda não tem conta? <button data-register>Cadastre-se</button></div>
      </section>
      <div class="ap-toast" id="apOnboardingToast" aria-live="polite"></div>
    </div>`;
    bind(container);
  }

  function show(container,step){container.querySelectorAll('.ap-screen-step').forEach(el=>el.classList.toggle('active',el.dataset.step===String(step)));container.querySelectorAll('.ap-form-status').forEach(el=>{el.textContent='';el.className='ap-form-status';});}
  function status(element,message,type='error'){element.textContent=message;element.className=`ap-form-status ${type}`;}
  function toast(container,message){const element=container.querySelector('#apOnboardingToast');element.textContent=message;element.classList.add('show');clearTimeout(element._timer);element._timer=setTimeout(()=>element.classList.remove('show'),2400);}
  function goToFeed(){sessionStorage.setItem('ap:onboarded','1');global.location.href='feed.html';}

  function bind(container){
    let selectedRole='user';
    const auth=AP.engine?.get?.('auth-module');
    container.addEventListener('click',e=>{
      const next=e.target.closest('[data-next]');if(next)show(container,next.dataset.next);
      const back=e.target.closest('[data-back]');if(back)show(container,back.dataset.back);
      if(e.target.closest('[data-login],[data-skip-login]'))show(container,4);
      if(e.target.closest('[data-register]'))show(container,2);
      const role=e.target.closest('[data-role]');if(role){selectedRole=role.dataset.role;container.querySelectorAll('[data-role]').forEach(el=>el.classList.remove('selected'));role.classList.add('selected');setTimeout(()=>show(container,3),180);}
      const eye=e.target.closest('[data-eye]');if(eye){const input=eye.previousElementSibling;input.type=input.type==='password'?'text':'password';eye.textContent=input.type==='password'?'◉':'⊘';}
      const social=e.target.closest('[data-social]');if(social)toast(container,`${social.dataset.social}: login social será ativado com as chaves oficiais.`);
      if(e.target.closest('[data-forgot]')){const email=container.querySelector('#apLoginForm input[name="email"]').value.trim();toast(container,email?`Recuperação preparada para ${email}.`:'Digite seu e-mail para recuperar a senha.');}
    });
    container.querySelector('#apSignupForm').addEventListener('submit',e=>{e.preventDefault();const form=new FormData(e.currentTarget);const result=auth?.signUp({name:form.get('name'),email:form.get('email'),password:form.get('password'),roles:selectedRole==='advertiser'?['user','advertiser']:['user']});const message=container.querySelector('[data-signup-status]');if(result?.ok){status(message,'Conta criada com sucesso!','success');setTimeout(goToFeed,450);return;}if(result?.error==='email-exists'){status(message,'Este e-mail já está cadastrado. Entre com sua conta.');return;}status(message,'Confira nome, e-mail e senha.');});
    container.querySelector('#apLoginForm').addEventListener('submit',e=>{e.preventDefault();const form=new FormData(e.currentTarget);const result=auth?.signIn(form.get('email'),form.get('password'));const message=container.querySelector('[data-login-status]');if(result?.ok){status(message,'Login realizado com sucesso!','success');setTimeout(goToFeed,350);return;}status(message,'E-mail ou senha incorretos.');});
  }

  AP.onboardingUI=Object.freeze({render});
})(window);
(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const KEY='ap:wallet';
  const money=value=>Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  function read(){
    try{
      const saved=JSON.parse(localStorage.getItem(KEY)||'null');
      if(saved&&Number.isFinite(saved.balance)&&Array.isArray(saved.transactions))return saved;
    }catch{}
    const initial={balance:1256.80,transactions:[
      {id:'t1',type:'credit',label:'Recompensa por vídeos',value:35,date:'Hoje, 14:30'},
      {id:'t2',type:'credit',label:'Comissão de afiliado',value:82.50,date:'Ontem, 18:10'},
      {id:'t3',type:'debit',label:'Compra no Shop',value:129.90,date:'08 jul, 11:42'}
    ]};
    write(initial);return initial;
  }
  function write(data){localStorage.setItem(KEY,JSON.stringify(data));}
  function nav(){return `<nav class="ap-page-nav"><a href="feed.html"><span>⌂</span>Início</a><a href="app.html?view=shop"><span>▱</span>Shop</a><a href="app.html?view=create" class="create"><span>+</span></a><a href="app.html?view=wallet" class="active"><span>▤</span>Carteira</a><a href="app.html?view=profile"><span>♙</span>Perfil</a></nav>`;}
  function transactions(items){return items.map(item=>`<article class="ap-wallet-transaction"><span class="${item.type}">${item.type==='credit'?'↓':'↑'}</span><div><strong>${item.label}</strong><small>${item.date}</small></div><b class="${item.type}">${item.type==='credit'?'+':'−'} ${money(item.value)}</b></article>`).join('');}

  function render(container){
    const data=read();
    container.innerHTML=`<main class="ap-page ap-wallet-page">
      <header class="ap-page-header"><a href="feed.html">‹</a><h1>Carteira</h1><button class="ap-eye-balance" data-hide-balance>◉</button></header>
      <section class="ap-wallet-main-card"><small>Saldo disponível</small><h2 data-wallet-balance>${money(data.balance)}</h2><p>Conta AssistaPay protegida</p></section>
      <div class="ap-wallet-actions">
        <button data-wallet-action="deposit"><span>＋</span>Depositar</button>
        <button data-wallet-action="withdraw"><span>⇩</span>Sacar</button>
        <button data-wallet-action="statement"><span>▤</span>Extrato</button>
        <button data-wallet-action="more"><span>•••</span>Mais</button>
      </div>
      <section class="ap-wallet-section"><header><h2>Movimentações</h2><button data-wallet-action="statement">Ver todas</button></header><div id="apWalletTransactions">${transactions(data.transactions.slice(0,4))}</div></section>
    </main>${nav()}
    <div class="ap-wallet-modal-backdrop" id="apWalletBackdrop"></div>
    <section class="ap-wallet-modal" id="apWalletModal" aria-hidden="true"><div class="ap-wallet-handle"></div><header><h2 id="apWalletModalTitle"></h2><button data-wallet-close>×</button></header><div id="apWalletModalBody"></div></section>`;
    bind(container);
  }

  function open(container,title,body){container.querySelector('#apWalletModalTitle').textContent=title;container.querySelector('#apWalletModalBody').innerHTML=body;container.querySelector('#apWalletBackdrop').classList.add('open');container.querySelector('#apWalletModal').classList.add('open');}
  function close(container){container.querySelector('#apWalletBackdrop').classList.remove('open');container.querySelector('#apWalletModal').classList.remove('open');}
  function form(type){const deposit=type==='deposit';return `<form class="ap-wallet-form" data-wallet-form="${type}"><label>Valor</label><input name="value" type="number" min="1" step="0.01" placeholder="R$ 0,00" required>${deposit?'<label>Forma de depósito</label><select name="method"><option>Pix</option><option>Cartão</option><option>Boleto</option></select>':'<label>Chave Pix</label><input name="pix" placeholder="CPF, e-mail, telefone ou chave" required>'}<button class="ap-gradient-btn">${deposit?'Confirmar depósito':'Confirmar saque'}</button><small>Simulação de carteira. Nenhuma movimentação bancária real será feita.</small></form>`;}

  function bind(container){
    container.querySelector('#apWalletBackdrop').addEventListener('click',()=>close(container));
    container.addEventListener('click',event=>{
      if(event.target.closest('[data-wallet-close]'))close(container);
      if(event.target.closest('[data-hide-balance]')){const el=container.querySelector('[data-wallet-balance]');const hidden=el.dataset.hidden==='1';el.dataset.hidden=hidden?'0':'1';el.textContent=hidden?money(read().balance):'R$ ••••';}
      const action=event.target.closest('[data-wallet-action]')?.dataset.walletAction;
      if(action==='deposit')open(container,'Depositar',form('deposit'));
      if(action==='withdraw')open(container,'Sacar',form('withdraw'));
      if(action==='statement')open(container,'Extrato',`<div class="ap-wallet-full-list">${transactions(read().transactions)}</div>`);
      if(action==='more')open(container,'Mais opções','<div class="ap-wallet-more"><button>Dados bancários</button><button>Limites da conta</button><button>Segurança</button><button>Ajuda da carteira</button></div>');
    });
    container.addEventListener('submit',event=>{
      const formEl=event.target.closest('[data-wallet-form]');if(!formEl)return;event.preventDefault();
      const input=new FormData(formEl);const value=Number(input.get('value'));if(!Number.isFinite(value)||value<=0)return;
      const data=read();const type=formEl.dataset.walletForm;
      if(type==='withdraw'&&value>data.balance){formEl.insertAdjacentHTML('beforeend','<p class="ap-wallet-error">Saldo insuficiente.</p>');return;}
      data.balance+=type==='deposit'?value:-value;
      data.transactions.unshift({id:`t${Date.now()}`,type:type==='deposit'?'credit':'debit',label:type==='deposit'?'Depósito via '+input.get('method'):'Saque via Pix',value,date:'Agora'});
      write(data);close(container);render(container);
    });
  }
  AP.walletUI=Object.freeze({render});
})(window);
(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const AFFILIATIONS_KEY='ap:affiliations';
  const SELECTED_KEY='ap:selected-affiliate-product';
  const META_KEY='ap:selected-affiliate-product-meta';
  const LABEL_LIMIT=24;

  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
  const esc=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const products=()=>AP.pagesUI?.products||[];
  const approved=()=>read(AFFILIATIONS_KEY,[]).filter(item=>item.status==='approved').map(link=>({link,product:products().find(product=>product.id===link.productId)})).filter(item=>item.product);

  function ensureUI(){
    if(document.getElementById('apAffiliateShowcase'))return;
    document.body.insertAdjacentHTML('beforeend',`<div class="ap-showcase-backdrop" id="apShowcaseBackdrop"></div><section class="ap-showcase" id="apAffiliateShowcase" aria-hidden="true"><div class="ap-showcase-handle"></div><header><div><h2>Minha Vitrine</h2><small>Produtos aprovados para divulgação</small></div><button type="button" data-showcase-close>×</button></header><div class="ap-showcase-list" id="apShowcaseList"></div></section>`);
    document.getElementById('apShowcaseBackdrop').addEventListener('click',close);
    document.querySelector('[data-showcase-close]').addEventListener('click',close);
  }

  function renderList(){
    const list=document.getElementById('apShowcaseList');
    const items=approved();
    list.innerHTML=items.length?items.map(({product,link})=>`<button type="button" class="ap-showcase-product" data-showcase-product="${esc(product.id)}"><img src="${esc(product.image)}" alt="${esc(product.name)}"><div><strong>${esc(product.name)}</strong><span>${esc(product.price)} · ${esc(product.seller)}</span><small>Ganhe ${esc(link.commission??product.commission)}% por venda</small></div><b>Escolher</b></button>`).join(''):`<div class="ap-showcase-empty"><div>🛍️</div><h3>Sua vitrine está vazia</h3><p>Afiliе-se a produtos no Shop e aguarde a aprovação.</p><a href="app.html?view=shop">Encontrar produtos</a></div>`;
  }

  function open(){
    ensureUI();
    renderList();
    document.getElementById('apShowcaseBackdrop').classList.add('open');
    const panel=document.getElementById('apAffiliateShowcase');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
  }

  function close(){
    document.getElementById('apShowcaseBackdrop')?.classList.remove('open');
    const panel=document.getElementById('apAffiliateShowcase');
    panel?.classList.remove('open');
    panel?.setAttribute('aria-hidden','true');
  }

  function linkedBlock(product,form){
    form.querySelector('.ap-linked-product')?.remove();
    const label=String(product.name||'').slice(0,LABEL_LIMIT);
    const privacy=form.querySelector('select[name="privacy"]')?.previousElementSibling;
    const html=`<div class="ap-linked-product"><div class="ap-linked-product-head"><span>🛒 Produto vinculado</span><button type="button" data-remove-linked-product>Remover</button></div><article class="ap-linked-product-card"><img src="${esc(product.image)}" alt=""><div><strong>${esc(product.name)}</strong><small>${esc(product.price)} · ${esc(product.seller)}</small></div></article><label>Nome que aparecerá no vídeo</label><input name="productLabel" value="${esc(label)}" maxlength="${LABEL_LIMIT}" required><small><b data-product-label-count>${label.length}</b>/${LABEL_LIMIT} caracteres</small><input type="hidden" name="productId" value="${esc(product.id)}"></div>`;
    if(privacy)privacy.insertAdjacentHTML('beforebegin',html);else form.querySelector('.ap-create-actions')?.insertAdjacentHTML('beforebegin',html);
  }

  function selectProduct(id){
    const product=products().find(item=>item.id===id);
    const affiliation=approved().find(item=>item.product.id===id)?.link;
    if(!product||!affiliation)return;
    localStorage.setItem(SELECTED_KEY,id);
    localStorage.setItem(META_KEY,JSON.stringify({productId:id,sellerId:product.sellerId||product.seller,commission:affiliation.commission??product.commission,affiliatedAt:affiliation.joinedAt||new Date().toISOString()}));
    const form=document.querySelector('.ap-create-sheet.open [data-create-form="video"],.ap-create-sheet.open [data-create-form="image"]');
    if(form)linkedBlock(product,form);
    close();
  }

  function addChooser(form){
    if(!form||form.querySelector('[data-open-showcase]'))return;
    const objective=form.querySelector('select[name="objective"]');
    const anchor=objective?.parentElement===form?objective:null;
    const button='<button type="button" class="ap-add-product" data-open-showcase><span>🛒</span><div><strong>Adicionar produto</strong><small>Escolha na sua vitrine</small></div><b>›</b></button>';
    if(anchor)anchor.insertAdjacentHTML('afterend',button);else form.querySelector('.ap-create-actions')?.insertAdjacentHTML('beforebegin',button);
  }

  function mount(container){
    ensureUI();
    const observer=new MutationObserver(()=>container.querySelectorAll('[data-create-form="video"],[data-create-form="image"]').forEach(addChooser));
    observer.observe(container,{childList:true,subtree:true});
    container.querySelectorAll('[data-create-form="video"],[data-create-form="image"]').forEach(addChooser);
    document.addEventListener('click',event=>{
      if(event.target.closest('[data-open-showcase]')){event.preventDefault();open();}
      const product=event.target.closest('[data-showcase-product]');
      if(product)selectProduct(product.dataset.showcaseProduct);
      const affiliateOption=event.target.closest('[data-create-type="affiliate"]');
      if(affiliateOption){event.preventDefault();event.stopImmediatePropagation();open();}
      if(event.target.closest('[data-remove-linked-product]'))localStorage.removeItem(META_KEY);
    },true);
  }

  AP.affiliateShowcase=Object.freeze({mount,open,approved});
})(window);
const categories = ['Tecnologia','Moda','Beleza','Casa','Ferramentas','Cursos','Pets','Promoções','Alimentação','Outros'];
const POINTS_TO_BRL = 1000;
const MIN_WITHDRAW_BRL = 20;
const LS_KEY = 'assistapay_db_v3_shop';
let currentUserId = localStorage.getItem('assistapay_current_user') || null;
let selectedEntryProfile = localStorage.getItem('assistapay_entry_profile') || 'user';

const sampleVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

function money(v){ return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function today(){ return new Date().toISOString().slice(0,10); }
function loadDB(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw) return JSON.parse(raw);
  const db = {
    users: [
      {id:'admin1', name:'Admin Teste', email:'admin@teste.com', password:'1234', roles:['admin'], points:0, interests:{}},
      {id:'user1', name:'Usuário Teste', email:'user@teste.com', password:'1234', roles:['user'], points:0, interests:{}},
      {id:'adv1', name:'Anunciante Teste', email:'anunciante@teste.com', password:'1234', roles:['user','advertiser'], points:0, interests:{}}
    ],
    products: [
      {id:'prod1', advertiserId:'adv1', name:'Produto teste: oferta especial', desc:'Produto exemplo da loja interna AssistaPay Shop.', category:'Tecnologia', price:79.90, commissionPercent:12, stock:100, checkoutLink:'https://www.mercadolivre.com.br', status:'active', sales:0, affiliates:[]}
    ],
    campaigns: [
      {id:'camp1', advertiserId:'adv1', productId:'prod1', title:'Produto teste: oferta especial', desc:'Campanha exemplo com link de produto.', category:'Tecnologia', videoUrl:sampleVideo, creativeType:'video', productLink:'', ctaText:'Ver oferta', budget:100, rewardReserve:50, platformProfit:25, safetyReserve:15, costs:10, pointsPerView:5, question:'Qual tipo de conteúdo apareceu?', answer:'flor', status:'active', metrics:{views:0,likes:0,shares:0,clicks:0,completions:0}}
    ],
    views: [], likes: [], shares: [], clicks: [], withdrawals: [], orders: [], affiliateLinks: []
  };
  saveDB(db); return db;
}
function saveDB(db){ localStorage.setItem(LS_KEY, JSON.stringify(db)); }
let db = loadDB();
function user(){ return db.users.find(u=>u.id===currentUserId); }
function rolesOf(u){
  if(!u) return [];
  if(Array.isArray(u.roles)) return u.roles;
  return u.role ? [u.role] : ['user'];
}
function hasRole(role){ return rolesOf(user()).includes(role); }
function firstAllowedScreen(){
  if(selectedEntryProfile === 'advertiser' && hasRole('advertiser')) return 'advertiserScreen';
  if(selectedEntryProfile === 'user' && hasRole('user')) return 'userScreen';
  if(hasRole('admin')) return 'adminScreen';
  if(hasRole('advertiser')) return 'advertiserScreen';
  if(hasRole('user')) return 'userScreen';
  return 'authScreen';
}
function updateNavPermissions(){
  const logged = !!user();
  $('#bottomNav').classList.toggle('hidden', !logged);
  $('#logoutBtn').classList.toggle('hidden', !logged);
  if(!logged) return;
  $('#navFeed').classList.toggle('hidden', !hasRole('user') && !hasRole('admin'));
  $('#navShop').classList.toggle('hidden', !hasRole('user') && !hasRole('advertiser') && !hasRole('admin'));
  $('#navAdvertiser').classList.toggle('hidden', !hasRole('advertiser') && !hasRole('admin'));
  $('#navAdmin').classList.toggle('hidden', !hasRole('admin'));
}
function canAccessScreen(id){
  if(id==='userScreen') return hasRole('user') || hasRole('admin');
  if(id==='marketScreen') return hasRole('user') || hasRole('advertiser') || hasRole('admin');
  if(id==='advertiserScreen') return hasRole('advertiser') || hasRole('admin');
  if(id==='adminScreen') return hasRole('admin');
  return true;
}

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function showScreen(id){
  if(id !== 'authScreen' && !canAccessScreen(id)) id = firstAllowedScreen();
  $$('.screen').forEach(x=>x.classList.remove('active'));
  $('#'+id).classList.add('active');
  document.body.classList.toggle('feed-mode', id==='userScreen');
  $$('#bottomNav button').forEach(b=>b.classList.toggle('active', b.dataset.go===id));
  setTimeout(()=>autoPlayVisible(),80);
}
function toast(msg){ alert(msg); }
function escapeHtml(str=''){ return String(str).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]||m)); }
function detectCreativeType(src=''){
  const clean = String(src).split('?')[0].toLowerCase();
  if(clean.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/.test(clean)) return 'image';
  return 'video';
}
function fileToDataURL(file){
  return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file); });
}
function currentRoleScreen(){ return firstAllowedScreen(); }
function autoPlayVisible(){ if(!document.body.classList.contains('feed-mode')) return; const cards=$$('.reel-card'); let best=null, bestRatio=0; cards.forEach(card=>{ const r=card.getBoundingClientRect(); const visible=Math.max(0, Math.min(r.bottom, innerHeight)-Math.max(r.top,0)); const ratio=visible/(r.height||1); if(ratio>bestRatio){bestRatio=ratio; best=card;} }); cards.forEach(card=>{ const v=card.querySelector('video'); if(!v) return; if(card===best){ v.play().catch(()=>{}); } else { v.pause(); } }); }
window.addEventListener('resize', autoPlayVisible);


function initSelects(){
  const filter = $('#categoryFilter'); const camp = $('#campCategory'); const market = $('#marketCategory');
  categories.forEach(c=>{ filter.innerHTML += `<option value="${c}">${c}</option>`; camp.innerHTML += `<option value="${c}">${c}</option>`; if(market) market.innerHTML += `<option value="${c}">${c}</option>`; });
}

function authUI(){
  const u = user();
  if(!u){ updateNavPermissions(); showScreen('authScreen'); return; }
  updateNavPermissions();
  showScreen(firstAllowedScreen());
  renderAll();
}

$$('.tab').forEach(btn=>btn.onclick=()=>{
  $$('.tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const mode = btn.dataset.auth;
  $('#loginForm').classList.toggle('hidden', mode!=='login');
  $('#registerForm').classList.toggle('hidden', mode!=='register');
});

function setEntryProfile(profile){
  selectedEntryProfile = profile;
  localStorage.setItem('assistapay_entry_profile', profile);
  $$('.entry-card').forEach(card=>card.classList.toggle('active', card.dataset.entry===profile));
  const asAdvertiser = profile === 'advertiser';
  if($('#regAsUser')) $('#regAsUser').checked = true;
  if($('#regAsAdvertiser')) $('#regAsAdvertiser').checked = asAdvertiser;
  const title = $('#loginEmail');
  if(title){
    title.placeholder = asAdvertiser ? 'email do anunciante' : 'seuemail@email.com';
  }
}
$$('.entry-card').forEach(card=>card.onclick=()=>setEntryProfile(card.dataset.entry));
setEntryProfile(selectedEntryProfile);

$('#loginForm').onsubmit = e => {
  e.preventDefault();
  const email = $('#loginEmail').value.trim().toLowerCase(); const pass = $('#loginPassword').value;
  const found = db.users.find(u=>u.email===email && u.password===pass);
  if(!found) return toast('E-mail ou senha inválidos. Teste: user@teste.com / 1234');
  const foundRoles = Array.isArray(found.roles) ? found.roles : (found.role ? [found.role] : ['user']);
  if(selectedEntryProfile === 'advertiser' && !foundRoles.includes('advertiser') && !foundRoles.includes('admin')){
    return toast('Essa conta não tem perfil de anunciante. Entre como usuário comum ou crie uma conta de anunciante.');
  }
  currentUserId = found.id; localStorage.setItem('assistapay_current_user', currentUserId); authUI();
};
$('#registerForm').onsubmit = e => {
  e.preventDefault();
  const email = $('#regEmail').value.trim().toLowerCase();
  if(db.users.some(u=>u.email===email)) return toast('Este e-mail já existe.');
  const roles = [];
  if($('#regAsUser').checked || selectedEntryProfile === 'advertiser') roles.push('user');
  if($('#regAsAdvertiser').checked || selectedEntryProfile === 'advertiser') roles.push('advertiser');
  if(!roles.length) roles.push('user');
  const newUser = {id:uid(), name:$('#regName').value.trim(), email, password:$('#regPassword').value, roles, points:0, interests:{}};
  db.users.push(newUser); saveDB(db); currentUserId = newUser.id; localStorage.setItem('assistapay_current_user', currentUserId); authUI();
};
$('#logoutBtn').onclick = ()=>{ localStorage.removeItem('assistapay_current_user'); currentUserId=null; updateNavPermissions(); authUI(); };
$('#bottomNav').onclick = e => {
  if(!e.target.dataset.go) return;
  if(!canAccessScreen(e.target.dataset.go)) return toast('Você não tem acesso a essa área.');
  showScreen(e.target.dataset.go); renderAll();
};
$('#openSearchBtn')?.addEventListener('click', ()=> $('#userPanel').classList.toggle('hidden'));


function level(points){ if(points>=10000) return 'Diamante'; if(points>=5000) return 'Ouro'; if(points>=2000) return 'Prata'; return 'Bronze'; }
function validViewExists(userId,campaignId){ return db.views.some(v=>v.userId===userId && v.campaignId===campaignId && v.date===today() && v.valid); }
function hasLiked(userId,campaignId){ return db.likes.some(v=>v.userId===userId && v.campaignId===campaignId); }

function renderUser(){
  const u = user(); if(!u) return;
  $('#userPoints').textContent = u.points || 0; $('#userBalance').textContent = money((u.points||0)/POINTS_TO_BRL); $('#userLevel').textContent = level(u.points||0);
  renderFeed();
}
function campaignScore(c){
  const u = user(); const interests = u?.interests || {}; let score = interests[c.category] || 0;
  score += (c.metrics?.completions||0)*0.2 + (c.metrics?.clicks||0)*0.5;
  return score;
}
function renderFeed(){
  const q = $('#searchInput').value.toLowerCase(); const cat = $('#categoryFilter').value;
  let campaigns = db.campaigns.filter(c=>c.status==='active' && c.rewardReserve > 0);
  campaigns = campaigns.filter(c => { const p=getProduct(c.productId); return (cat==='all'||c.category===cat) && (`${c.title} ${c.desc} ${c.category} ${p?.name||''}`.toLowerCase().includes(q)); });
  campaigns.sort((a,b)=>campaignScore(b)-campaignScore(a));
  $('#videoFeed').innerHTML = campaigns.map(c=>videoCard(c)).join('') || '<div class="empty-reels">Nenhum vídeo encontrado.<br>Toque na lupa para mudar a busca.</div>';
  setTimeout(()=>autoPlayVisible(),120);
  campaigns.forEach(c=>attachVideoEvents(c));
}
function videoCard(c){
  const already = validViewExists(currentUserId,c.id);
  const title = escapeHtml(c.title);
  const desc = escapeHtml(c.desc||'');
  const cat = escapeHtml(c.category);
  return `<article class="reel-card" data-cid="${c.id}">
    <div class="video-shell">
      ${((c.creativeType||detectCreativeType(c.videoUrl))==='image') ? `<img class="creative-media" src="${escapeHtml(c.videoUrl)}" alt="${title}">` : `<video playsinline preload="metadata" src="${escapeHtml(c.videoUrl)}"></video>`}
      <div class="video-gradient"></div>
      <div class="progress-pill">${already?'✅ Já pontuado':`🎯 Vale ${c.pointsPerView} pontos`}</div>

      <div class="reel-info">
        <span class="badge">${cat}</span>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>

      <button class="product-float productBtn" title="${escapeHtml(c.ctaText || 'Ver produto')}">
        <span class="cart-icon">🛒</span><span>${escapeHtml(c.ctaText || (c.productId ? 'Ver produto' : 'Ver oferta'))}</span>
      </button>

      <div class="side-actions">
        <div class="action-wrap"><button class="likeBtn">❤️</button><small>${c.metrics.likes}</small></div>
        <div class="action-wrap"><button class="shareBtn">↗️</button><small>${c.metrics.shares}</small></div>
        <div class="action-wrap"><button class="saveBtn">🔖</button><small>Salvar</small></div>
        <div class="action-wrap"><button class="showValidateBtn">💰</button><small>Ganhar</small></div>
      </div>

      <div class="validate-box hidden">
        <p>Para validar: ${escapeHtml(c.question||'Qual produto apareceu no vídeo?')}</p>
        <div class="row"><input class="answerInput" placeholder="Digite a resposta"><button class="validateBtn secondary">Validar</button></div>
        <small class="viewMsg">Assista pelo menos 80% do vídeo. Vale ${c.pointsPerView} pontos.</small>
      </div>
    </div>
  </article>`;
}
function attachVideoEvents(c){
  const card = document.querySelector(`[data-cid="${c.id}"]`); if(!card) return;
  const video = card.querySelector('video');
  const img = card.querySelector('img.creative-media');
  let watched80 = !!img;
  if(video){
    video.onloadedmetadata = ()=>{ if(video.videoHeight > video.videoWidth) video.classList.remove('portrait-fit'); else video.classList.add('portrait-fit'); };
    video.ontimeupdate = ()=>{ if(video.duration && video.currentTime/video.duration >= .8) watched80 = true; };
    video.onclick = ()=> video.paused ? video.play().catch(()=>{}) : video.pause();
  }
  if(img){ img.onclick = ()=> card.querySelector('.validate-box').classList.toggle('hidden'); }
  card.querySelector('.showValidateBtn').onclick = ()=> card.querySelector('.validate-box').classList.toggle('hidden');
  card.querySelector('.saveBtn').onclick = ()=> toast('Vídeo salvo nos favoritos da versão teste.');
  card.querySelector('.validateBtn').onclick = ()=>{
    const u = user(); const answer = card.querySelector('.answerInput').value.trim().toLowerCase();
    if(validViewExists(u.id,c.id)) return card.querySelector('.viewMsg').textContent = 'Você já ganhou pontos por este vídeo hoje.';
    if(!watched80) return card.querySelector('.viewMsg').textContent = 'Assista pelo menos 80% do vídeo antes de validar.';
    if(c.answer && !answer.includes(c.answer.toLowerCase())) return card.querySelector('.viewMsg').textContent = 'Resposta incorreta. Veja o vídeo com atenção.';
    const costBRL = c.pointsPerView / POINTS_TO_BRL;
    if(c.rewardReserve < costBRL) return card.querySelector('.viewMsg').textContent = 'Campanha sem saldo para recompensas.';
    u.points = (u.points||0) + Number(c.pointsPerView);
    u.interests[c.category] = (u.interests[c.category]||0) + 10;
    c.rewardReserve -= costBRL; c.metrics.views++; c.metrics.completions++;
    db.views.push({id:uid(), userId:u.id, campaignId:c.id, date:today(), valid:true, points:c.pointsPerView});
    saveDB(db); renderAll();
  };
  card.querySelector('.likeBtn').onclick = ()=>{ const u=user(); if(hasLiked(u.id,c.id)) return; u.interests[c.category]=(u.interests[c.category]||0)+8; c.metrics.likes++; db.likes.push({id:uid(),userId:u.id,campaignId:c.id}); saveDB(db); renderAll(); };
  card.querySelector('.shareBtn').onclick = async ()=>{ const u=user(); u.interests[c.category]=(u.interests[c.category]||0)+15; c.metrics.shares++; db.shares.push({id:uid(),userId:u.id,campaignId:c.id}); saveDB(db); if(navigator.share) await navigator.share({title:c.title,url:c.productLink || location.href}); renderAll(); };
  card.querySelector('.productBtn').onclick = ()=>{ const u=user(); u.interests[c.category]=(u.interests[c.category]||0)+20; c.metrics.clicks++; db.clicks.push({id:uid(),userId:u.id,campaignId:c.id, productId:c.productId||null}); saveDB(db); if(c.productId) openProduct(c.productId, c.id); else if(c.productLink) window.open(c.productLink, '_blank'); renderAll(); };
}
const feedEl = document.getElementById('videoFeed');
feedEl?.addEventListener('scroll', ()=> requestAnimationFrame(autoPlayVisible));

$('#searchInput').oninput = renderFeed; $('#categoryFilter').onchange = renderFeed;

$('#withdrawBtn').onclick = ()=>{
  const u = user(); const balance = (u.points||0)/POINTS_TO_BRL; const pix = $('#pixKey').value.trim();
  if(balance < MIN_WITHDRAW_BRL) return $('#withdrawMsg').textContent = 'Saldo insuficiente para saque.';
  if(!pix) return $('#withdrawMsg').textContent = 'Informe sua chave Pix.';
  db.withdrawals.push({id:uid(), userId:u.id, userName:u.name, pix, amount:balance, points:u.points, status:'pending', createdAt:new Date().toLocaleString('pt-BR')});
  u.points = 0; saveDB(db); $('#withdrawMsg').textContent = 'Solicitação enviada para análise manual.'; renderAll();
};

$('#campCreativeFile')?.addEventListener('change', async e=>{
  const file = e.target.files?.[0];
  const box = $('#creativePreview');
  if(!file){ box.classList.add('hidden'); box.innerHTML=''; return; }
  const url = URL.createObjectURL(file);
  const type = file.type.startsWith('image/') ? 'image' : 'video';
  box.classList.remove('hidden');
  box.innerHTML = type==='image'
    ? `<img src="${url}" alt="Prévia do criativo">`
    : `<video src="${url}" controls playsinline></video>`;
});


function getProduct(id){ return db.products?.find(p=>p.id===id); }
function refreshProductSelect(){
  const sel = $('#campProductId'); if(!sel) return;
  const u = user();
  const current = sel.value || 'external';
  const mine = (db.products||[]).filter(p=>hasRole('admin') || p.advertiserId===u?.id);
  sel.innerHTML = '<option value="external">Usar link externo / sem produto interno</option>' + mine.map(p=>`<option value="${p.id}">${escapeHtml(p.name)} — ${money(p.price)}</option>`).join('');
  sel.value = mine.some(p=>p.id===current) ? current : 'external';
}
function productCard(p, owner=false){
  return `<div class="product-card">
    <div class="product-thumb">🛍️</div>
    <div class="product-body">
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.desc||'')}</p>
      <b>${money(p.price)}</b>
      <small>Comissão afiliado: ${Number(p.commissionPercent||0)}% · Estoque: ${p.stock}</small>
      <div class="actions">
        <button class="secondary" onclick="openProduct('${p.id}')">Ver produto</button>
        ${owner?`<button onclick="toggleProductStatus('${p.id}')">${p.status==='active'?'Pausar':'Ativar'}</button>`:''}
      </div>
    </div>
  </div>`;
}
function renderProducts(){
  if(!db.products) db.products=[];
  refreshProductSelect();
  const u = user();
  const mineBox = $('#advertiserProducts');
  if(mineBox && u && (hasRole('advertiser') || hasRole('admin'))){
    const mine = db.products.filter(p=>hasRole('admin') || p.advertiserId===u.id);
    mineBox.innerHTML = mine.map(p=>productCard(p,true)).join('') || '<div class="mini-card">Nenhum produto cadastrado ainda.</div>';
  }
  const market = $('#marketProducts');
  if(market){
    const q = ($('#marketSearch')?.value || '').toLowerCase();
    const cat = $('#marketCategory')?.value || 'all';
    let products = db.products.filter(p=>p.status==='active');
    products = products.filter(p=>(cat==='all'||p.category===cat) && (`${p.name} ${p.desc} ${p.category}`.toLowerCase().includes(q)));
    market.innerHTML = products.map(p=>productCard(p,false)).join('') || '<div class="card">Nenhum produto encontrado na loja.</div>';
  }
}
window.toggleProductStatus = id => { const p=getProduct(id); if(!p) return; p.status = p.status==='active'?'paused':'active'; saveDB(db); renderAll(); };
function affiliateCode(userId, productId){ return `ap_${userId}_${productId}`.replace(/[^a-zA-Z0-9_]/g,''); }
window.openProduct = (productId, campaignId=null)=>{
  const p=getProduct(productId); if(!p) return toast('Produto não encontrado.');
  const u=user();
  const code = u ? affiliateCode(u.id, p.id) : '';
  const affiliateUrl = `${location.origin}${location.pathname}?produto=${p.id}&af=${code}`;
  $('#productModalContent').innerHTML = `<div class="modal-product">
    <div class="product-hero">🛒</div>
    <span class="badge">AssistaPay Shop</span>
    <h2>${escapeHtml(p.name)}</h2>
    <h3>${money(p.price)}</h3>
    <p>${escapeHtml(p.desc||'')}</p>
    <div class="shop-details">
      <div><small>Comissão afiliado</small><b>${Number(p.commissionPercent||0)}%</b></div>
      <div><small>Estoque</small><b>${p.stock}</b></div>
      <div><small>Vendas</small><b>${p.sales||0}</b></div>
    </div>
    <button class="primary" onclick="buyProduct('${p.id}','${campaignId||''}')">Comprar dentro do app</button>
    ${p.checkoutLink?`<button class="ghost full-btn" onclick="window.open('${escapeHtml(p.checkoutLink)}','_blank')">Abrir checkout externo</button>`:''}
    <div class="affiliate-box">
      <h4>Afiliar-se a este produto</h4>
      <p>Você pode divulgar este produto usando seu link interno. Quando a venda for registrada, a comissão aparece na carteira.</p>
      <input readonly value="${affiliateUrl}">
      <button class="secondary" onclick="copyAffiliateLink('${affiliateUrl}')">Copiar link de afiliado</button>
    </div>
  </div>`;
  $('#productModal').classList.remove('hidden');
};
window.buyProduct = (productId, campaignId='')=>{
  const p=getProduct(productId); const u=user(); if(!p||!u) return;
  if(Number(p.stock)<=0) return toast('Produto sem estoque.');
  p.stock = Number(p.stock)-1; p.sales = (p.sales||0)+1;
  const commission = Number(p.price||0) * (Number(p.commissionPercent||0)/100);
  db.orders.push({id:uid(), productId, buyerId:u.id, campaignId:campaignId||null, amount:Number(p.price||0), commission, createdAt:new Date().toLocaleString('pt-BR')});
  $('#productModal').classList.add('hidden'); saveDB(db); renderAll(); toast('Compra simulada realizada dentro do app. Na versão real entra pagamento, pedido e entrega.');
};
window.copyAffiliateLink = async link=>{ try{ await navigator.clipboard.writeText(link); toast('Link de afiliado copiado.'); }catch(e){ prompt('Copie seu link:', link); } };
$('#closeProductModal')?.addEventListener('click',()=>$('#productModal').classList.add('hidden'));
$('#productModal')?.addEventListener('click',e=>{ if(e.target.id==='productModal') $('#productModal').classList.add('hidden'); });
$('#marketSearch')?.addEventListener('input', renderProducts);
$('#marketCategory')?.addEventListener('change', renderProducts);
$('#productForm')?.addEventListener('submit', e=>{
  e.preventDefault(); const u=user(); if(!hasRole('advertiser') && !hasRole('admin')) return toast('Apenas anunciantes podem cadastrar produtos.');
  const prod = {id:uid(), advertiserId:u.id, name:$('#prodName').value.trim(), desc:$('#prodDesc').value.trim(), category:$('#campCategory').value || 'Outros', price:Number($('#prodPrice').value), commissionPercent:Number($('#prodCommission').value), stock:Number($('#prodStock').value), checkoutLink:$('#prodCheckout').value.trim(), status:'active', sales:0, affiliates:[]};
  db.products.push(prod); saveDB(db); e.target.reset(); renderAll(); toast('Produto cadastrado na loja interna. Agora você pode ligar uma campanha a ele.');
});

$('#campaignForm').onsubmit = async e=>{
  e.preventDefault();
  const u = user(); if(!hasRole('advertiser') && !hasRole('admin')) return toast('Apenas anunciantes podem cadastrar campanhas.'); const budget = Number($('#campBudget').value);
  const file = $('#campCreativeFile')?.files?.[0];
  let creativeUrl = $('#campVideo').value.trim();
  let creativeType = detectCreativeType(creativeUrl);
  if(file){
    if(file.size > 12 * 1024 * 1024) return toast('Arquivo muito grande. Nesta versão teste use até 12 MB.');
    creativeUrl = await fileToDataURL(file);
    creativeType = file.type.startsWith('image/') ? 'image' : 'video';
  }
  if(!creativeUrl) return toast('Envie um vídeo/imagem ou informe uma URL do criativo.');
  const productId = $('#campProductId').value !== 'external' ? $('#campProductId').value : null;
  const externalLink = $('#campLink').value.trim();
  if(!productId && !externalLink) return toast('Escolha um produto interno ou informe um link externo.');
  const p = getProduct(productId);
  const c = {id:uid(), advertiserId:u.id, productId, title:$('#campTitle').value, desc:$('#campDesc').value, category:$('#campCategory').value, videoUrl:creativeUrl, creativeType, productLink:externalLink, ctaText:($('#campCtaText').value.trim() || (p ? p.name : 'Ver produto')), budget, rewardReserve:budget*.5, platformProfit:budget*.25, safetyReserve:budget*.15, costs:budget*.10, pointsPerView:Number($('#campPoints').value), question:$('#campQuestion').value, answer:$('#campAnswer').value, status:'pending', metrics:{views:0,likes:0,shares:0,clicks:0,completions:0}};
  db.campaigns.push(c); saveDB(db); e.target.reset(); $('#creativePreview').classList.add('hidden'); $('#creativePreview').innerHTML=''; renderAll(); toast('Campanha cadastrada. Agora precisa aprovação do admin.');
};
function renderAdvertiser(){
  const u = user(); if(!u || (!hasRole('advertiser') && !hasRole('admin'))) return;
  const mine = hasRole('admin') ? db.campaigns : db.campaigns.filter(c=>c.advertiserId===u.id);
  $('#advertiserCampaigns').innerHTML = mine.map(c=>miniCampaign(c,false)).join('') || '<div class="card">Nenhuma campanha ainda.</div>';
}
function miniCampaign(c,admin){
  return `<div class="mini-card"><h3>${c.title}</h3><p>Status: <b>${c.status}</b> | Produto: ${escapeHtml(getProduct(c.productId)?.name || 'Link externo')} | Categoria: ${c.category} | Criativo: ${(c.creativeType||detectCreativeType(c.videoUrl))==='image'?'Imagem':'Vídeo'}</p><p>Orçamento: ${money(c.budget)} | Reserva usuários: ${money(c.rewardReserve)}</p><p>Views: ${c.metrics.views} | Curtidas: ${c.metrics.likes} | Compart.: ${c.metrics.shares} | Cliques: ${c.metrics.clicks}</p>${admin?`<div class="actions"><button class="ok" onclick="setCampStatus('${c.id}','active')">Aprovar/Ativar</button><button onclick="setCampStatus('${c.id}','paused')">Pausar</button><button class="danger" onclick="setCampStatus('${c.id}','rejected')">Recusar</button></div>`:''}</div>`;
}
window.setCampStatus = (id,status)=>{ const c=db.campaigns.find(x=>x.id===id); c.status=status; saveDB(db); renderAll(); };
function renderAdmin(){
  if(!hasRole('admin')) return;
  $('#adminCampaignCount').textContent = db.campaigns.length;
  $('#adminRewardReserve').textContent = money(db.campaigns.reduce((s,c)=>s+c.rewardReserve,0));
  $('#adminProfit').textContent = money(db.campaigns.reduce((s,c)=>s+c.platformProfit,0));
  $('#adminCampaigns').innerHTML = db.campaigns.map(c=>miniCampaign(c,true)).join('');
  $('#adminWithdrawals').innerHTML = db.withdrawals.map(w=>`<div class="mini-card"><h3>${w.userName}</h3><p>Valor: ${money(w.amount)} | Pix: ${w.pix}</p><p>Status: <b>${w.status}</b> | ${w.createdAt}</p><div class="actions"><button class="ok" onclick="setWithdraw('${w.id}','approved')">Aprovar</button><button class="danger" onclick="setWithdraw('${w.id}','rejected')">Recusar</button></div></div>`).join('') || '<div class="card">Nenhum saque solicitado.</div>';
}
window.setWithdraw = (id,status)=>{ const w=db.withdrawals.find(x=>x.id===id); w.status=status; saveDB(db); renderAll(); };
function renderAll(){ renderUser(); renderProducts(); renderAdvertiser(); renderAdmin(); }
initSelects(); authUI();

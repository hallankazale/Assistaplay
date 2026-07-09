const categories = ['Tecnologia','Moda','Beleza','Casa','Ferramentas','Cursos','Pets','Promoções','Alimentação','Outros'];
const POINTS_TO_BRL = 1000;
const MIN_WITHDRAW_BRL = 20;
const LS_KEY = 'assistapay_db_v1';
let currentUserId = localStorage.getItem('assistapay_current_user') || null;

const sampleVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

function money(v){ return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function today(){ return new Date().toISOString().slice(0,10); }
function loadDB(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw) return JSON.parse(raw);
  const db = {
    users: [
      {id:'admin1', name:'Admin Teste', email:'admin@teste.com', password:'1234', role:'admin', points:0, interests:{}},
      {id:'user1', name:'Usuário Teste', email:'user@teste.com', password:'1234', role:'user', points:0, interests:{}},
      {id:'adv1', name:'Anunciante Teste', email:'anunciante@teste.com', password:'1234', role:'advertiser', points:0, interests:{}}
    ],
    campaigns: [
      {id:'camp1', advertiserId:'adv1', title:'Produto teste: oferta especial', desc:'Campanha exemplo com link de produto.', category:'Tecnologia', videoUrl:sampleVideo, productLink:'https://www.mercadolivre.com.br', budget:100, rewardReserve:50, platformProfit:25, safetyReserve:15, costs:10, pointsPerView:5, question:'Qual tipo de conteúdo apareceu?', answer:'flor', status:'active', metrics:{views:0,likes:0,shares:0,clicks:0,completions:0}}
    ],
    views: [], likes: [], shares: [], clicks: [], withdrawals: []
  };
  saveDB(db); return db;
}
function saveDB(db){ localStorage.setItem(LS_KEY, JSON.stringify(db)); }
let db = loadDB();
function user(){ return db.users.find(u=>u.id===currentUserId); }

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
function showScreen(id){ $$('.screen').forEach(x=>x.classList.remove('active')); $('#'+id).classList.add('active'); }
function toast(msg){ alert(msg); }

function initSelects(){
  const filter = $('#categoryFilter'); const camp = $('#campCategory');
  categories.forEach(c=>{ filter.innerHTML += `<option value="${c}">${c}</option>`; camp.innerHTML += `<option value="${c}">${c}</option>`; });
}

function authUI(){
  const u = user();
  if(!u){ showScreen('authScreen'); $('#bottomNav').classList.add('hidden'); $('#logoutBtn').classList.add('hidden'); return; }
  $('#bottomNav').classList.remove('hidden'); $('#logoutBtn').classList.remove('hidden');
  if(u.role==='advertiser') showScreen('advertiserScreen');
  else if(u.role==='admin') showScreen('adminScreen');
  else showScreen('userScreen');
  renderAll();
}

$$('.tab').forEach(btn=>btn.onclick=()=>{
  $$('.tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const mode = btn.dataset.auth;
  $('#loginForm').classList.toggle('hidden', mode!=='login');
  $('#registerForm').classList.toggle('hidden', mode!=='register');
});

$('#loginForm').onsubmit = e => {
  e.preventDefault();
  const email = $('#loginEmail').value.trim().toLowerCase(); const pass = $('#loginPassword').value;
  const found = db.users.find(u=>u.email===email && u.password===pass);
  if(!found) return toast('E-mail ou senha inválidos. Teste: user@teste.com / 1234');
  currentUserId = found.id; localStorage.setItem('assistapay_current_user', currentUserId); authUI();
};
$('#registerForm').onsubmit = e => {
  e.preventDefault();
  const email = $('#regEmail').value.trim().toLowerCase();
  if(db.users.some(u=>u.email===email)) return toast('Este e-mail já existe.');
  const newUser = {id:uid(), name:$('#regName').value.trim(), email, password:$('#regPassword').value, role:$('#regRole').value, points:0, interests:{}};
  db.users.push(newUser); saveDB(db); currentUserId = newUser.id; localStorage.setItem('assistapay_current_user', currentUserId); authUI();
};
$('#logoutBtn').onclick = ()=>{ localStorage.removeItem('assistapay_current_user'); currentUserId=null; authUI(); };
$('#bottomNav').onclick = e => { if(e.target.dataset.go) { showScreen(e.target.dataset.go); renderAll(); } };

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
  campaigns = campaigns.filter(c => (cat==='all'||c.category===cat) && (`${c.title} ${c.desc} ${c.category}`.toLowerCase().includes(q)));
  campaigns.sort((a,b)=>campaignScore(b)-campaignScore(a));
  $('#videoFeed').innerHTML = campaigns.map(c=>videoCard(c)).join('') || '<div class="card">Nenhum vídeo encontrado.</div>';
  campaigns.forEach(c=>attachVideoEvents(c));
}
function videoCard(c){
  const already = validViewExists(currentUserId,c.id);
  return `<article class="card video-card" data-cid="${c.id}">
    <div class="video-head"><div><h3>${c.title}</h3><p>${c.desc||''}</p></div><span class="badge">${c.category}</span></div>
    <video controls preload="metadata" src="${c.videoUrl}"></video>
    <div class="metrics">
      <button class="likeBtn">❤️ Curtir (${c.metrics.likes})</button>
      <button class="shareBtn">🔄 Compartilhar (${c.metrics.shares})</button>
      <button class="saveBtn">🔖 Salvar</button>
      <button class="statusBtn">${already?'✅ Pontuado':'🎯 Ganhar pontos'}</button>
    </div>
    <a class="link-btn productBtn" href="${c.productLink}" target="_blank" rel="noopener">🛒 Ver produto</a>
    <div class="question">
      <p>Para validar: ${c.question||'Qual produto apareceu no vídeo?'}</p>
      <div class="row"><input class="answerInput" placeholder="Digite a resposta"><button class="validateBtn secondary">Validar visualização</button></div>
      <small class="viewMsg">Assista pelo menos 80% do vídeo. Vale ${c.pointsPerView} pontos.</small>
    </div>
  </article>`;
}
function attachVideoEvents(c){
  const card = document.querySelector(`[data-cid="${c.id}"]`); if(!card) return;
  const video = card.querySelector('video');
  let watched80 = false;
  video.ontimeupdate = ()=>{ if(video.duration && video.currentTime/video.duration >= .8) watched80 = true; };
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
  card.querySelector('.shareBtn').onclick = async ()=>{ const u=user(); u.interests[c.category]=(u.interests[c.category]||0)+15; c.metrics.shares++; db.shares.push({id:uid(),userId:u.id,campaignId:c.id}); saveDB(db); if(navigator.share) await navigator.share({title:c.title,url:c.productLink}); renderAll(); };
  card.querySelector('.productBtn').onclick = ()=>{ const u=user(); u.interests[c.category]=(u.interests[c.category]||0)+20; c.metrics.clicks++; db.clicks.push({id:uid(),userId:u.id,campaignId:c.id}); saveDB(db); };
}
$('#searchInput').oninput = renderFeed; $('#categoryFilter').onchange = renderFeed;

$('#withdrawBtn').onclick = ()=>{
  const u = user(); const balance = (u.points||0)/POINTS_TO_BRL; const pix = $('#pixKey').value.trim();
  if(balance < MIN_WITHDRAW_BRL) return $('#withdrawMsg').textContent = 'Saldo insuficiente para saque.';
  if(!pix) return $('#withdrawMsg').textContent = 'Informe sua chave Pix.';
  db.withdrawals.push({id:uid(), userId:u.id, userName:u.name, pix, amount:balance, points:u.points, status:'pending', createdAt:new Date().toLocaleString('pt-BR')});
  u.points = 0; saveDB(db); $('#withdrawMsg').textContent = 'Solicitação enviada para análise manual.'; renderAll();
};

$('#campaignForm').onsubmit = e=>{
  e.preventDefault(); const u = user(); const budget = Number($('#campBudget').value);
  const c = {id:uid(), advertiserId:u.id, title:$('#campTitle').value, desc:$('#campDesc').value, category:$('#campCategory').value, videoUrl:$('#campVideo').value, productLink:$('#campLink').value, budget, rewardReserve:budget*.5, platformProfit:budget*.25, safetyReserve:budget*.15, costs:budget*.10, pointsPerView:Number($('#campPoints').value), question:$('#campQuestion').value, answer:$('#campAnswer').value, status:'pending', metrics:{views:0,likes:0,shares:0,clicks:0,completions:0}};
  db.campaigns.push(c); saveDB(db); e.target.reset(); renderAll(); toast('Campanha cadastrada. Agora precisa aprovação do admin.');
};
function renderAdvertiser(){
  const u = user(); if(!u) return;
  const mine = db.campaigns.filter(c=>c.advertiserId===u.id);
  $('#advertiserCampaigns').innerHTML = mine.map(c=>miniCampaign(c,false)).join('') || '<div class="card">Nenhuma campanha ainda.</div>';
}
function miniCampaign(c,admin){
  return `<div class="mini-card"><h3>${c.title}</h3><p>Status: <b>${c.status}</b> | Categoria: ${c.category}</p><p>Orçamento: ${money(c.budget)} | Reserva usuários: ${money(c.rewardReserve)}</p><p>Views: ${c.metrics.views} | Curtidas: ${c.metrics.likes} | Compart.: ${c.metrics.shares} | Cliques: ${c.metrics.clicks}</p>${admin?`<div class="actions"><button class="ok" onclick="setCampStatus('${c.id}','active')">Aprovar/Ativar</button><button onclick="setCampStatus('${c.id}','paused')">Pausar</button><button class="danger" onclick="setCampStatus('${c.id}','rejected')">Recusar</button></div>`:''}</div>`;
}
window.setCampStatus = (id,status)=>{ const c=db.campaigns.find(x=>x.id===id); c.status=status; saveDB(db); renderAll(); };
function renderAdmin(){
  $('#adminCampaignCount').textContent = db.campaigns.length;
  $('#adminRewardReserve').textContent = money(db.campaigns.reduce((s,c)=>s+c.rewardReserve,0));
  $('#adminProfit').textContent = money(db.campaigns.reduce((s,c)=>s+c.platformProfit,0));
  $('#adminCampaigns').innerHTML = db.campaigns.map(c=>miniCampaign(c,true)).join('');
  $('#adminWithdrawals').innerHTML = db.withdrawals.map(w=>`<div class="mini-card"><h3>${w.userName}</h3><p>Valor: ${money(w.amount)} | Pix: ${w.pix}</p><p>Status: <b>${w.status}</b> | ${w.createdAt}</p><div class="actions"><button class="ok" onclick="setWithdraw('${w.id}','approved')">Aprovar</button><button class="danger" onclick="setWithdraw('${w.id}','rejected')">Recusar</button></div></div>`).join('') || '<div class="card">Nenhum saque solicitado.</div>';
}
window.setWithdraw = (id,status)=>{ const w=db.withdrawals.find(x=>x.id===id); w.status=status; saveDB(db); renderAll(); };
function renderAll(){ renderUser(); renderAdvertiser(); renderAdmin(); }
initSelects(); authUI();

(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
function current(){return new URLSearchParams(location.search).get('view')||'home';}
function markup(){const view=current();const item=(href,label,icon,key,extra='')=>`<a href="${href}" class="${view===key?'active':''} ${extra}" data-bottom-view="${key}"><span>${icon}</span><small>${label}</small></a>`;return `<nav class="ap-page-nav ap-bottom-nav" aria-label="Menu principal">${item('../feed.html','Início','⌂','home')}${item('app.html?view=search','Pesquisar','⌕','search')}${item('app.html?view=create','','+','create','create')}${item('app.html?view=messages','Mensagens','✉','messages')}${item('app.html?view=profile','Perfil','♙','profile')}</nav>`;}
function sync(container=document.body){if(!container)return null;let nav=container.querySelector('.ap-bottom-nav,.ap-page-nav');if(!nav){container.insertAdjacentHTML('beforeend',markup());nav=container.querySelector('.ap-bottom-nav,.ap-page-nav');}nav.querySelectorAll('[data-bottom-view]').forEach(a=>a.classList.toggle('active',a.dataset.bottomView===current()));return nav;}
AP.bottomNav=Object.freeze({sync,markup});
})(window);
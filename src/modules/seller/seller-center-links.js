(function(global){
'use strict';
if(global.__apSellerCenterLinks)return;
global.__apSellerCenterLinks=true;
function route(tab){global.location.href=`app.html?view=seller-center&tab=${tab}`;}
function textOf(el){return String(el?.textContent||'').trim().toLowerCase();}
document.addEventListener('click',event=>{
 const target=event.target.closest('a,button,article,section,div');
 if(!target)return;
 const text=textOf(target);
 let tab='';
 if(text.includes('minhas vendas'))tab='orders';
 else if(text.includes('minhas comissões')||text.includes('minhas comissoes'))tab='commissions';
 else if(text==='produtos'||text.includes('produtos próprios')||text.includes('produtos proprios'))tab='products';
 if(!tab)return;
 event.preventDefault();event.stopImmediatePropagation();route(tab);
},true);
})(window);
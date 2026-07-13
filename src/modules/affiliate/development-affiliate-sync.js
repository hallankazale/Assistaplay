(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const KEY='ap:affiliations';

  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'[]');}
    catch{return [];}
  }

  function write(items){localStorage.setItem(KEY,JSON.stringify(items));}

  function approve(productId){
    const product=(AP.pagesUI?.products||[]).find(item=>item.id===productId);
    if(!product)return;
    const items=read().filter(item=>item.productId!==productId);
    items.push({
      productId,
      status:'approved',
      commission:product.commission,
      seller:product.seller,
      joinedAt:new Date().toISOString(),
      approvedAt:new Date().toISOString(),
      approvalMode:'development'
    });
    write(items);
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-join-affiliate]');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    approve(button.dataset.joinAffiliate);
    button.textContent='Adicionado à Minha Vitrine ✓';
    button.disabled=true;
    setTimeout(()=>{global.location.href='app.html?view=create&showcase=1';},450);
  },true);

  AP.developmentAffiliateSync=Object.freeze({approve});
})(window);

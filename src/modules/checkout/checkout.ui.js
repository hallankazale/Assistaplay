(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const read=(key,fallback=[])=>AP.storage?.get?.(key,fallback)??fallback;
const write=(key,value)=>AP.storage?.set?.(key,value);
const uid=()=>`ord_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
const money=value=>Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function getProduct(id){
 const stored=read('seller-products',[]).find(item=>String(item.id)===String(id));
 if(stored)return stored;
 const market=AP.pagesUI?.getProducts?.()||[];
 return market.find(item=>String(item.id)===String(id))||null;
}
function createOrder(product,form){
 const orders=read('orders',[]);
 const quantity=Math.max(1,Number(form.quantity||1));
 const order={id:uid(),productId:product.id,productName:product.name||'Produto',quantity,unitPrice:Number(product.price||0),total:Number(product.price||0)*quantity,status:'paid',customer:{name:form.name||'',email:form.email||'',cep:form.cep||'',address:form.address||''},affiliateId:form.affiliateId||null,createdAt:new Date().toISOString(),stockApplied:false};
 if(Number(product.stock||0)<quantity)throw new Error('Estoque insuficiente.');
 const current=read('seller-products',[]);
 if(current.some(item=>String(item.id)===String(product.id))){
  const products=current.map(item=>String(item.id)===String(product.id)?{...item,stock:Math.max(0,Number(item.stock||0)-quantity)}:item);
  order.stockApplied=true;
  write('seller-products',products);
 }
 orders.unshift(order);
 write('orders',orders);
 const commissionPercent=Number(product.commission??product.commissionPercent??0);
 if(order.affiliateId&&commissionPercent>0){
  const commissions=read('commissions',[]);
  commissions.unshift({id:`com_${order.id}`,orderId:order.id,productId:product.id,affiliateId:order.affiliateId,amount:order.total*(commissionPercent/100),status:'pending',createdAt:order.createdAt});
  write('commissions',commissions);
 }
 AP.events?.emit?.('order:created',order);
 return order;
}
function render(container){
 const params=new URLSearchParams(location.search);
 const product=getProduct(params.get('product'));
 if(!product){container.innerHTML='<main class="ap-page"><header class="ap-page-header"><a href="app.html?view=shop">←</a><h1>Checkout</h1></header><p>Produto não encontrado.</p></main>';return null;}
 container.innerHTML=`<main class="ap-page"><header class="ap-page-header"><a href="app.html?view=product&product=${encodeURIComponent(product.id||'')}">←</a><h1>Finalizar compra</h1></header><section class="ap-card"><h2>${product.name||'Produto'}</h2><p>${money(product.price)}</p><p>Estoque: ${Number(product.stock||0)}</p></section><form id="apCheckoutForm" class="ap-card"><label>Nome<input name="name" required></label><label>E-mail<input name="email" type="email" required></label><label>CEP<input name="cep" inputmode="numeric" required></label><label>Endereço<input name="address" required></label><label>Quantidade<input name="quantity" type="number" min="1" max="${Number(product.stock||1)}" value="1" required></label><input name="affiliateId" type="hidden" value="${params.get('affiliate')||''}"><button type="submit">Confirmar pedido</button><p id="apCheckoutMessage"></p></form></main>`;
 const form=container.querySelector('#apCheckoutForm');
 form.onsubmit=event=>{event.preventDefault();const data=Object.fromEntries(new FormData(form).entries());const message=container.querySelector('#apCheckoutMessage');try{const order=createOrder(product,data);message.textContent=`Pedido ${order.id} criado com sucesso.`;form.querySelector('button').disabled=true;}catch(error){message.textContent=error.message||'Não foi possível concluir o pedido.';}};
 return product;
}
function enhance(container){return container;}
AP.checkoutUI=Object.freeze({render,enhance,createOrder,getProduct});
})(window);
(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const read=(key,fallback=[])=>AP.storage?.get?.(key,fallback)??fallback;
const write=(key,value)=>AP.storage?.set?.(key,value);
function affiliate(productId,affiliateId){const list=read('affiliations',[]);const exists=list.some(x=>String(x.productId)===String(productId)&&String(x.affiliateId||x.userId)===String(affiliateId));if(!exists){list.push({id:`aff_${Date.now()}`,productId:String(productId),affiliateId:String(affiliateId||AP.session?.current?.()?.id||'dev-user'),createdAt:new Date().toISOString(),status:'active'});write('affiliations',list);}return list;}
function sync(){const pending=read('affiliate-pending',null);if(pending?.productId){affiliate(pending.productId,pending.affiliateId);write('affiliate-pending',null);}return read('affiliations',[]);}
global.addEventListener('storage',e=>{if(e.key==='ap:affiliate-pending')sync();});
AP.developmentAffiliateSync=Object.freeze({affiliate,sync});
})(window);
(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const DAY=86400000;
function cleanup(){
  try{
    const items=AP.storage?.get?.('publications',[])||[];
    const now=Date.now();
    const next=items.filter(item=>item?.type!=='story'||now-new Date(item.createdAt||0).getTime()<DAY);
    if(next.length!==items.length)AP.storage?.set?.('publications',next);
    return next.length;
  }catch{return 0;}
}
function init(){cleanup();setInterval(cleanup,60000);}
AP.storyLifecycle=Object.freeze({init,cleanup,duration:DAY});
AP.engine?.register?.('storyLifecycle',AP.storyLifecycle);
})(window);
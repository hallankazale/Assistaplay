(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
if(AP.engine)return;
const modules=new Map();
let started=false;
function register(name,module){
  if(!name)throw new Error('Nome do módulo é obrigatório.');
  modules.set(String(name),module);
  return module;
}
function get(name){
  const key=String(name||'');
  return modules.get(key)||AP[key]||null;
}
function start(){
  if(started)return true;
  started=true;
  for(const [name,module] of modules){
    try{module?.init?.({app:AP,engine:api,name});}
    catch(error){console.error('[AssistaPay] Falha ao iniciar módulo:',name,error);}
  }
  try{AP.events?.emit?.('app:started',{at:new Date().toISOString()});}catch{}
  return true;
}
function stop(){
  for(const [name,module] of modules){
    try{module?.destroy?.({app:AP,engine:api,name});}
    catch(error){console.error('[AssistaPay] Falha ao encerrar módulo:',name,error);}
  }
  started=false;
}
function list(){return Array.from(modules.keys());}
const api=Object.freeze({register,get,start,stop,list,isStarted:()=>started});
AP.engine=api;
// Compatibilidade: módulos já expostos diretamente no namespace podem ser consultados pelo engine.
['session','auth','router','storage','database','events','features','permissions'].forEach(name=>{
  if(AP[name])modules.set(name,AP[name]);
});
})(window);

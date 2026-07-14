(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const KEY='ap:session';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch{return null;}}
function write(value){if(value)localStorage.setItem(KEY,JSON.stringify(value));else localStorage.removeItem(KEY);}
const api={
  current:()=>read(),
  isAuthenticated:()=>!!read()?.userId,
  start(user){const session={userId:user?.id||user?.userId||'dev-user',name:user?.name||'Usuário',email:user?.email||'',roles:user?.roles||['user'],startedAt:new Date().toISOString()};write(session);AP.events?.emit?.('session:started',session);return session;},
  end(){const previous=read();write(null);AP.events?.emit?.('session:ended',previous);},
  require(){return this.isAuthenticated();}
};
AP.session=api;
AP.engine?.register?.('session',api);
})(window);

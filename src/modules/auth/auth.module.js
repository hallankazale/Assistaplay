(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const USERS_KEY='ap:users';
function users(){try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]');}catch{return [];}}
function save(list){localStorage.setItem(USERS_KEY,JSON.stringify(list));}
function ensureDemo(){const list=users();if(!list.length){list.push({id:'dev-user',name:'Usuário de teste',email:'user@teste.com',password:'1234',roles:['user','seller','affiliate']});save(list);}return list;}
const api={
  list:()=>ensureDemo(),
  current:()=>{const s=AP.session?.current?.();return ensureDemo().find(u=>u.id===s?.userId)||null;},
  login(email,password){const user=ensureDemo().find(u=>u.email===String(email||'').trim().toLowerCase()&&u.password===String(password||''));if(!user)throw new Error('E-mail ou senha inválidos.');AP.session?.start?.(user);return user;},
  register(data={}){const list=ensureDemo();const email=String(data.email||'').trim().toLowerCase();if(!email)throw new Error('E-mail obrigatório.');if(list.some(u=>u.email===email))throw new Error('E-mail já cadastrado.');const user={id:'user_'+Date.now(),name:String(data.name||'Usuário'),email,password:String(data.password||''),roles:Array.isArray(data.roles)?data.roles:['user']};list.push(user);save(list);AP.session?.start?.(user);return user;},
  logout(){AP.session?.end?.();}
};
AP.authModule=api;
AP.engine?.register?.('authModule',api);
})(window);

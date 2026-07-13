(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const KEY='ap:messages';
  const seed={
    'bea-beauty':[
      {id:'m1',from:'them',text:'Oi! Obrigada por acompanhar meu conteúdo 💜',time:'18:42',createdAt:Date.now()-7200000}
    ],
    'tech-store':[
      {id:'m2',from:'them',text:'Olá! Posso ajudar com algum produto?',time:'Ontem',createdAt:Date.now()-86400000}
    ]
  };
  function read(){try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data)return data;localStorage.setItem(KEY,JSON.stringify(seed));return JSON.parse(JSON.stringify(seed));}catch{return JSON.parse(JSON.stringify(seed));}}
  function write(data){localStorage.setItem(KEY,JSON.stringify(data));}
  function listThreads(){const data=read();return Object.entries(data).map(([userId,messages])=>({userId,messages,last:messages[messages.length-1]||null})).sort((a,b)=>(b.last?.createdAt||0)-(a.last?.createdAt||0));}
  function getThread(userId){const data=read();return data[userId]||[];}
  function send(userId,text){const value=String(text||'').trim();if(!value)return null;const data=read();const list=data[userId]||(data[userId]=[]);const now=new Date();const message={id:`msg_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,from:'me',text:value,time:now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),createdAt:Date.now()};list.push(message);write(data);return message;}
  function ensureThread(userId){const data=read();if(!data[userId]){data[userId]=[];write(data);}return data[userId];}
  AP.messagesStore=Object.freeze({listThreads,getThread,send,ensureThread});
})(window);
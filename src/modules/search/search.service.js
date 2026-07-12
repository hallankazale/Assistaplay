(function(global){
  'use strict';
  const AP=global.AssistaPay=global.AssistaPay||{};
  const users=[
    {id:'bea-beauty',name:'Beatriz Martins',username:'@bea.beauty',type:'Afiliada',category:'Beleza e skincare',followers:248000,verified:true,avatar:'https://i.pravatar.cc/160?img=47',bio:'Beleza, skincare e autocuidado todos os dias.'},
    {id:'carros-motores',name:'Carlos Mendes',username:'@carros.e.motores',type:'Criador',category:'Automóveis',followers:184000,verified:true,avatar:'https://i.pravatar.cc/160?img=13',bio:'Carros, motores e liberdade sobre rodas.'},
    {id:'casa-pratica',name:'Ana Ribeiro',username:'@casa.pratica',type:'Afiliada',category:'Casa e organização',followers:96300,verified:false,avatar:'https://i.pravatar.cc/160?img=14',bio:'Ideias simples para uma casa mais prática.'},
    {id:'tech-store',name:'Tech Store Brasil',username:'@techstore',type:'Loja',category:'Eletrônicos',followers:322000,verified:true,avatar:'https://i.pravatar.cc/160?img=12',bio:'Tecnologia, acessórios e ofertas selecionadas.'},
    {id:'bella-care',name:'Bella Care',username:'@bellacare',type:'Loja',category:'Beleza',followers:141000,verified:true,avatar:'https://i.pravatar.cc/160?img=25',bio:'Cuidados pessoais e beleza para todos os dias.'},
    {id:'marina-fit',name:'Marina Alves',username:'@marina.fit',type:'Criadora',category:'Fitness e bem-estar',followers:78500,verified:false,avatar:'https://i.pravatar.cc/160?img=32',bio:'Treino, rotina e motivação sem complicação.'}
  ];
  function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function search(term){const query=normalize(term);if(!query)return users;return users.filter(user=>normalize([user.name,user.username,user.type,user.category,user.bio].join(' ')).includes(query));}
  function getById(id){return users.find(user=>user.id===id)||null;}
  AP.searchService=Object.freeze({users,search,getById});
})(window);
(function(){
  'use strict';
  document.addEventListener('click',event=>{
    const tabs=[...document.querySelectorAll('.ap-feed-tabs button')];
    if(event.target===tabs[1]){
      event.preventDefault();
      window.location.href='app.html?view=search';
    }
  });
})();
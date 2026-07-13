(function(global){
  'use strict';
  const PROFILE_KEY='ap:profile';
  const DAY=24*60*60*1000;
  let previousStory='';

  function read(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');}catch{return {};}}
  function write(profile){localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}
  function cleanup(){const profile=read();previousStory=profile.story||'';if(!profile.story)return false;const createdAt=new Date(profile.storyCreatedAt||0).getTime();if(!Number.isFinite(createdAt)||Date.now()-createdAt>=DAY){delete profile.story;delete profile.storyCreatedAt;write(profile);previousStory='';return true;}return false;}
  function stampNewStory(){const profile=read();const current=profile.story||'';if(current&&current!==previousStory){profile.storyCreatedAt=new Date().toISOString();write(profile);}previousStory=current;}

  cleanup();
  document.addEventListener('submit',event=>{if(!event.target.closest('#apProfileForm'))return;setTimeout(stampNewStory,0);},true);
  global.addEventListener('storage',event=>{if(event.key===PROFILE_KEY)cleanup();});
  setInterval(cleanup,60*1000);

  const AP=global.AssistaPay=global.AssistaPay||{};
  AP.storyLifecycle=Object.freeze({cleanup,duration:DAY});
})(window);
(function(global){
'use strict';
const AP=global.AssistaPay=global.AssistaPay||{};
const HOLD_DELAY=240;
const MAX_STORY_MS=60000;
const MAX_VIDEO_MS=180000;
function enhance(container){
 const capture=container.querySelector('[data-capture]');
 if(!capture||capture.dataset.holdReady==='true')return;
 capture.dataset.holdReady='true';
 capture.setAttribute('aria-label','Toque para foto. Segure para gravar vídeo.');
 const stage=container.querySelector('.ap-camera-stage');
 const timer=document.createElement('div');
 timer.className='ap-camera-record-time';
 timer.hidden=true;
 timer.textContent='00:00 / 01:00';
 stage?.appendChild(timer);
 const hint=document.createElement('p');
 hint.className='ap-camera-hint';
 hint.textContent='Toque para foto · Segure para vídeo';
 stage?.appendChild(hint);
 let holdTimer=0;
 let recording=false;
 let startedAt=0;
 let frame=0;
 const mode=()=>container.querySelector('[data-mode].active')?.dataset.mode||'story';
 const limit=()=>mode()==='story'?MAX_STORY_MS:MAX_VIDEO_MS;
 const format=ms=>{const s=Math.floor(Math.max(0,ms)/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
 const update=()=>{
   if(!recording)return;
   const elapsed=Date.now()-startedAt;
   capture.style.setProperty('--progress',`${Math.min(360,elapsed/limit()*360)}deg`);
   timer.hidden=false;
   timer.textContent=`${format(elapsed)} / ${format(limit())}`;
   if(elapsed>=limit()){
     capture.dispatchEvent(new Event('click',{bubbles:true}));
     stopVisual();
     return;
   }
   frame=requestAnimationFrame(update);
 };
 function startVisual(){recording=true;startedAt=Date.now();capture.classList.add('hold-recording');navigator.vibrate?.(35);frame=requestAnimationFrame(update);}
 function stopVisual(){recording=false;cancelAnimationFrame(frame);capture.classList.remove('hold-recording');capture.classList.remove('pressed');capture.style.setProperty('--progress','0deg');timer.hidden=true;navigator.vibrate?.(25);}
 capture.addEventListener('pointerdown',event=>{
   event.preventDefault();
   capture.setPointerCapture?.(event.pointerId);
   capture.classList.add('pressed');
   holdTimer=setTimeout(()=>{
     holdTimer=0;
     startVisual();
     capture.dispatchEvent(new Event('click',{bubbles:true}));
   },HOLD_DELAY);
 },true);
 capture.addEventListener('pointerup',event=>{
   event.preventDefault();
   if(holdTimer){clearTimeout(holdTimer);holdTimer=0;capture.classList.remove('pressed');capture.dispatchEvent(new Event('click',{bubbles:true}));return;}
   if(recording){capture.dispatchEvent(new Event('click',{bubbles:true}));stopVisual();}
 },true);
 capture.addEventListener('pointercancel',()=>{
   if(holdTimer){clearTimeout(holdTimer);holdTimer=0;}
   if(recording){capture.dispatchEvent(new Event('click',{bubbles:true}));stopVisual();}
 });
 capture.addEventListener('contextmenu',event=>event.preventDefault());
}
const original=AP.createUI?.render;
if(typeof original==='function'){
 AP.createUI=Object.freeze({...AP.createUI,render(container){const result=original(container);setTimeout(()=>enhance(container),0);return result;}});
}
})(window);
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
 capture.setAttribute('aria-label','Toque para capturar. Segure para gravar vídeo.');
 capture.style.touchAction='none';
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
 let holdTimer=0,recording=false,startedAt=0,frame=0,ignoreClickUntil=0;
 const mode=()=>container.querySelector('[data-mode].active')?.dataset.mode||'story';
 const limit=()=>mode()==='story'?MAX_STORY_MS:MAX_VIDEO_MS;
 const format=ms=>{const s=Math.floor(Math.max(0,ms)/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
 const invokeCapture=()=>{if(typeof capture.onclick==='function')capture.onclick.call(capture);else capture.click();};
 const stopVisual=()=>{recording=false;cancelAnimationFrame(frame);capture.classList.remove('hold-recording','pressed');capture.style.setProperty('--progress','0deg');timer.hidden=true;navigator.vibrate?.(25);};
 const stopRecording=()=>{if(!recording)return;ignoreClickUntil=Date.now()+500;invokeCapture();stopVisual();};
 const update=()=>{
   if(!recording)return;
   const elapsed=Date.now()-startedAt;
   capture.style.setProperty('--progress',`${Math.min(360,elapsed/limit()*360)}deg`);
   timer.hidden=false;
   timer.textContent=`${format(elapsed)} / ${format(limit())}`;
   if(elapsed>=limit()){stopRecording();return;}
   frame=requestAnimationFrame(update);
 };
 const startRecording=()=>{
   if(recording)return;
   ignoreClickUntil=Date.now()+500;
   invokeCapture();
   recording=true;
   startedAt=Date.now();
   capture.classList.add('hold-recording');
   navigator.vibrate?.(35);
   frame=requestAnimationFrame(update);
 };
 capture.addEventListener('click',event=>{
   if(Date.now()<ignoreClickUntil){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 const pressStart=event=>{
   if(event.cancelable)event.preventDefault();
   capture.setPointerCapture?.(event.pointerId);
   capture.classList.add('pressed');
   clearTimeout(holdTimer);
   holdTimer=setTimeout(()=>{holdTimer=0;startRecording();},HOLD_DELAY);
 };
 const pressEnd=event=>{
   if(event?.cancelable)event.preventDefault();
   if(holdTimer){clearTimeout(holdTimer);holdTimer=0;capture.classList.remove('pressed');ignoreClickUntil=Date.now()+350;invokeCapture();return;}
   stopRecording();
 };
 capture.addEventListener('pointerdown',pressStart,{capture:true,passive:false});
 capture.addEventListener('pointerup',pressEnd,{capture:true,passive:false});
 capture.addEventListener('pointercancel',pressEnd,{capture:true,passive:false});
 capture.addEventListener('lostpointercapture',()=>{if(recording)stopRecording();});
 capture.addEventListener('contextmenu',event=>event.preventDefault());
}
const original=AP.createUI?.render;
if(typeof original==='function'){
 AP.createUI=Object.freeze({...AP.createUI,render(container){const result=original(container);requestAnimationFrame(()=>enhance(container));return result;}});
}
})(window);

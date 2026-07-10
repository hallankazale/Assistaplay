const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const html=fs.readFileSync(path.join(__dirname,'..','integration','feed-preview.html'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'..','src','modules','feed','feed.ui.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'..','src','styles','feed.css'),'utf8');

['id="feed"','ap-bottom-nav','feed.ui.js','recommendation.module.js'].forEach((token)=>assert.ok(html.includes(token),`Ausente no preview: ${token}`));
['scroll-snap-type:y mandatory','height:100dvh','ap-product-strip','ap-actions'].forEach((token)=>assert.ok(css.includes(token),`Ausente no CSS: ${token}`));
['IntersectionObserver','data-action="like"','feed:product-opened','feed:view','navigator.share'].forEach((token)=>assert.ok(js.includes(token),`Ausente no controlador: ${token}`));
assert.ok(js.includes("playsinline muted loop"),'Vídeos precisam ser adequados para autoplay móvel.');
console.log('Feed preview tests: OK');

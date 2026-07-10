const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const html=fs.readFileSync(path.join(__dirname,'..','integration','index.html'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'..','src','modules','onboarding','onboarding.ui.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'..','src','styles','onboarding.css'),'utf8');

['onboarding.ui.js','auth.module.js','session.module.js'].forEach(token=>assert.ok(html.includes(token),`Entrada sem ${token}`));
['data-step="1"','data-step="2"','data-step="3"','data-step="4"','apSignupForm','apLoginForm'].forEach(token=>assert.ok(js.includes(token),`Fluxo sem ${token}`));
['signUp','signIn','data-login','data-register','data-back','data-eye','feed.html'].forEach(token=>assert.ok(js.includes(token),`Ação ausente: ${token}`));
['ap-form-status','ap-forgot','ap-toast','ap-text-btn'].forEach(token=>assert.ok(css.includes(token),`Estilo ausente: ${token}`));
console.log('Onboarding flow tests: OK');

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class LocalStorageMock {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const localStorage = new LocalStorageMock();
const window = { localStorage, console };
window.window = window;
const context = vm.createContext({ console, localStorage, window, Date, Math });

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
}

[
  'src/core/config.js','src/core/storage.js','src/core/permissions.js','src/core/auth.js',
  'src/core/migrations.js','src/core/database.js','src/core/events.js','src/core/features.js',
  'src/core/router.js','src/core/engine.js','src/core/logger.js',
  'src/modules/antifraud/antifraud.module.js','src/modules/wallet/wallet.module.js'
].forEach(load);

const AP = window.AssistaPay;
AP.database.write({
  users: [
    { id:'u1', name:'Usuário', roles:['user'], points:30000, interests:{} },
    { id:'u2', name:'Baixo saldo', roles:['user'], points:5000, interests:{} },
    { id:'u3', name:'Conta de risco', roles:['user'], points:30000, interests:{} },
    { id:'admin1', name:'Admin', roles:['admin'], points:0, interests:{} }
  ]
});
AP.engine.start();

const antifraud = AP.engine.get('antifraud');
const wallet = AP.engine.get('wallet');

assert.equal(antifraud.evaluate({}).status, 'clear');
assert.equal(antifraud.evaluate({ impossibleTiming:true, duplicateIdentity:true }).status, 'blocked');
assert.equal(antifraud.reviewUser('u1', { vpnDetected:true }).status, 'clear');
assert.equal(antifraud.canReceiveReward('u1').allowed, true);

assert.equal(wallet.getWallet('u1').availableBRL, 30);
assert.equal(wallet.validateWithdrawal({ userId:'u2', pixKey:'abc' }).error, 'below-minimum');
assert.equal(wallet.validateWithdrawal({ userId:'u1', pixKey:'' }).error, 'pix-required');
assert.equal(wallet.validateWithdrawal({ userId:'u1', pixKey:'abc', amountBRL:50 }).error, 'insufficient-balance');

const request = wallet.requestWithdrawal({ userId:'u1', pixKey:'11999999999', amountBRL:20 });
assert.equal(request.ok, true);
assert.equal(request.wallet.availableBRL, 10);
assert.equal(request.wallet.pendingBRL, 20);

const rejected = wallet.updateWithdrawalStatus(request.withdrawal.id, 'rejected', 'admin1');
assert.equal(rejected.ok, true);
assert.equal(wallet.getWallet('u1').availableBRL, 30);
assert.equal(wallet.getWallet('u1').pendingBRL, 0);

const second = wallet.requestWithdrawal({ userId:'u1', pixKey:'email@pix.com', amountBRL:20 });
assert.equal(second.ok, true);
assert.equal(wallet.updateWithdrawalStatus(second.withdrawal.id, 'approved', 'admin1').ok, true);
assert.equal(wallet.updateWithdrawalStatus(second.withdrawal.id, 'paid', 'admin1').ok, true);
assert.equal(wallet.getWallet('u1').availableBRL, 10);
assert.equal(wallet.requestWithdrawal({ userId:'u1', pixKey:'abc', amountBRL:20 }).error, 'insufficient-balance');

antifraud.reviewUser('u3', { impossibleTiming:true, duplicateIdentity:true });
assert.equal(antifraud.canReceiveReward('u3').allowed, false);
assert.equal(wallet.requestWithdrawal({ userId:'u3', pixKey:'abc', amountBRL:20 }).error, 'risk-blocked');

assert.ok(AP.database.read().auditLogs.some((log)=>log.action==='wallet:withdrawal-requested'));
assert.ok(AP.database.read().auditLogs.some((log)=>log.action==='antifraud:user-reviewed'));

console.log('Wallet and antifraud tests: OK');

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
  'src/modules/session/session.module.js','src/modules/profile/profile.module.js'
].forEach(load);

const AP = window.AssistaPay;
AP.database.write({
  users: [{ id:'u1', name:'Nome Antigo', email:'u@teste.com', password:'1234', roles:['user'], points:2500, interests:{Tecnologia:8, Casa:2} }],
  orders: [{ id:'o1', buyerId:'u1' }, { id:'o2', buyerId:'outro' }],
  withdrawals: [{ id:'w1', userId:'u1' }]
});
AP.auth.saveSession('u1');
AP.engine.start();

const profile = AP.engine.get('profile');
assert.ok(profile);
const initial = profile.getProfile();
assert.equal(initial.name, 'Nome Antigo');
assert.equal(initial.points, 2500);
assert.equal(initial.topInterest, 'Tecnologia');
assert.equal(initial.orderCount, 1);
assert.equal(initial.withdrawalCount, 1);

assert.equal(profile.updateProfile({ name:'A' }).ok, false);
const updated = profile.updateProfile({ name:'Nome Novo' });
assert.equal(updated.ok, true);
assert.equal(updated.profile.name, 'Nome Novo');
assert.equal(AP.database.findUserById('u1').name, 'Nome Novo');
assert.ok(AP.database.read().auditLogs.some((log)=>log.action==='profile:updated'));

AP.auth.clearSession();
assert.equal(profile.getProfile(), null);
assert.equal(profile.updateProfile({ name:'Sem Sessão' }).error, 'not-authenticated');

console.log('Profile module tests: OK');

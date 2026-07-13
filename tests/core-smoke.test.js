const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class LocalStorageMock {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

const localStorage = new LocalStorageMock();
const window = { localStorage, console };
window.window = window;
const context = vm.createContext({ console, localStorage, window, Date, Math });

function load(relativePath) {
  const file = path.join(__dirname, '..', relativePath);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: relativePath });
}

[
  'src/core/config.js',
  'src/core/storage.js',
  'src/core/permissions.js',
  'src/core/auth.js',
  'src/core/migrations.js',
  'src/core/database.js',
  'src/core/events.js',
  'src/core/features.js',
  'src/core/router.js',
  'src/core/engine.js'
].forEach(load);

const AP = window.AssistaPay;
assert.ok(AP);
assert.equal(AP.config.storage.databaseKey, 'assistapay_db_v3_shop');
assert.equal(AP.config.rewards.pointsToBRL, 1000);
assert.equal(AP.config.rewards.minimumWithdrawalBRL, 20);

AP.storage.set('teste', { ok: true });
assert.equal(AP.storage.get('teste').ok, true);
AP.storage.setText('texto', 'abc');
assert.equal(AP.storage.getText('texto'), 'abc');
AP.storage.remove('texto');
assert.equal(AP.storage.getText('texto', null), null);

const user = { id: 'u1', roles: ['user'] };
const advertiser = { id: 'a1', roles: ['user', 'advertiser'] };
const admin = { id: 'adm1', roles: ['admin'] };
assert.equal(AP.permissions.canAccessScreen(user, 'advertiserScreen'), false);
assert.equal(AP.permissions.canAccessScreen(advertiser, 'advertiserScreen'), true);
assert.equal(AP.permissions.canAccessScreen(admin, 'adminScreen'), true);

const database = { users: [{ id: 'u1', email: 'user@teste.com', password: '1234', roles: ['user'] }] };
assert.equal(AP.auth.normalizeEmail(' USER@TESTE.COM '), 'user@teste.com');
assert.equal(AP.auth.emailExists(database, 'USER@TESTE.COM'), true);
assert.equal(AP.auth.findAccountByCredentials(database, ' user@teste.com ', '1234').id, 'u1');
assert.equal(AP.auth.findAccountByCredentials(database, 'user@teste.com', 'errada'), null);

const account = AP.auth.buildAccount({ id: 'novo', name: ' Novo Usuário ', email: ' NOVO@TESTE.COM ', password: '1234', roles: ['user', 'advertiser', 'user'] });
assert.equal(account.name, 'Novo Usuário');
assert.equal(account.email, 'novo@teste.com');
assert.equal(Array.from(account.roles).join(','), 'user,advertiser');
AP.auth.saveSession('u1');
assert.equal(AP.auth.readSession(), 'u1');
AP.auth.clearSession();
assert.equal(AP.auth.readSession(), null);

const migrated = AP.migrations.migrate({
  users: [{ id: 'antigo', role: 'advertiser', points: '15' }],
  campaigns: [{ id: 'c1', title: 'Campanha antiga' }],
  products: [{ id: 'p1', name: 'Produto preservado' }]
});
assert.equal(migrated.schemaVersion, 3);
assert.equal(migrated.users[0].points, 15);
assert.equal(Array.from(migrated.users[0].roles).join(','), 'advertiser');
assert.equal(migrated.products[0].name, 'Produto preservado');
assert.equal(migrated.campaigns[0].ctaText, 'Ver produto');

AP.database.write(migrated);
assert.equal(AP.database.read().products[0].id, 'p1');
AP.database.audit('test:executed', { ok: true }, 'u1');
assert.equal(AP.database.read().auditLogs.length, 1);

let received = 0;
const unsubscribe = AP.events.on('test:event', (payload) => { received += payload.value; });
assert.equal(AP.events.emit('test:event', { value: 2 }).delivered, 1);
assert.equal(received, 2);
unsubscribe();
assert.equal(AP.events.emit('test:event', { value: 2 }).delivered, 0);

assert.equal(AP.features.isEnabled('marketplace'), true);
AP.features.set('marketplace', false);
assert.equal(AP.features.isEnabled('marketplace'), false);
assert.equal(AP.router.resolve('shop', user).reason, 'feature-disabled');
AP.features.reset('marketplace');
assert.equal(AP.router.resolve('shop', user).allowed, true);
assert.equal(AP.router.resolve('advertiser', user).reason, 'permission-denied');
assert.equal(AP.router.navigate('advertiser', advertiser).allowed, true);

let moduleStarted = false;
AP.engine.register('test-module', { start() { moduleStarted = true; }, api: { name: 'test' } });
AP.engine.start();
assert.equal(moduleStarted, true);
assert.equal(AP.engine.get('test-module').name, 'test');
assert.equal(AP.engine.status().started, true);
AP.engine.stop();
assert.equal(AP.engine.status().started, false);

console.log('Core smoke tests: OK');

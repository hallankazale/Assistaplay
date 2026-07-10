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

const context = vm.createContext({ console, localStorage, window });

function load(relativePath) {
  const file = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(file, 'utf8');
  vm.runInContext(source, context, { filename: relativePath });
}

load('src/core/config.js');
load('src/core/storage.js');
load('src/core/permissions.js');
load('src/core/auth.js');

const AP = window.AssistaPay;
assert.ok(AP, 'Namespace AssistaPay deve existir');
assert.equal(AP.config.storage.databaseKey, 'assistapay_db_v3_shop');
assert.equal(AP.config.rewards.pointsToBRL, 1000);
assert.equal(AP.config.rewards.minimumWithdrawalBRL, 20);

AP.storage.set('teste', { ok: true });
assert.deepEqual(AP.storage.get('teste'), { ok: true });
AP.storage.setText('texto', 'abc');
assert.equal(AP.storage.getText('texto'), 'abc');
AP.storage.remove('texto');
assert.equal(AP.storage.getText('texto', null), null);

const user = { id: 'u1', roles: ['user'] };
const advertiser = { id: 'a1', roles: ['user', 'advertiser'] };
const admin = { id: 'adm1', roles: ['admin'] };

assert.equal(AP.permissions.canAccessScreen(user, 'userScreen'), true);
assert.equal(AP.permissions.canAccessScreen(user, 'advertiserScreen'), false);
assert.equal(AP.permissions.canAccessScreen(advertiser, 'advertiserScreen'), true);
assert.equal(AP.permissions.canAccessScreen(advertiser, 'userScreen'), true);
assert.equal(AP.permissions.canAccessScreen(admin, 'adminScreen'), true);
assert.equal(AP.permissions.firstAllowedScreen(user), 'userScreen');
assert.equal(AP.permissions.firstAllowedScreen(admin), 'adminScreen');

const database = {
  users: [
    { id: 'u1', email: 'user@teste.com', password: '1234', roles: ['user'] }
  ]
};

assert.equal(AP.auth.normalizeEmail(' USER@TESTE.COM '), 'user@teste.com');
assert.equal(AP.auth.emailExists(database, 'USER@TESTE.COM'), true);
assert.equal(AP.auth.findAccountByCredentials(database, ' user@teste.com ', '1234').id, 'u1');
assert.equal(AP.auth.findAccountByCredentials(database, 'user@teste.com', 'errada'), null);

const account = AP.auth.buildAccount({
  id: 'novo',
  name: ' Novo Usuário ',
  email: ' NOVO@TESTE.COM ',
  password: '1234',
  roles: ['user', 'advertiser', 'user']
});

assert.equal(account.name, 'Novo Usuário');
assert.equal(account.email, 'novo@teste.com');
assert.deepEqual(account.roles, ['user', 'advertiser']);

AP.auth.saveSession('u1');
assert.equal(AP.auth.readSession(), 'u1');
AP.auth.clearSession();
assert.equal(AP.auth.readSession(), null);

console.log('Core smoke tests: OK');

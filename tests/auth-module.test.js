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
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  vm.runInContext(source, context, { filename: file });
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
  'src/core/engine.js',
  'src/core/logger.js',
  'src/modules/session/session.module.js',
  'src/modules/auth/auth.module.js'
].forEach(load);

const AP = window.AssistaPay;
AP.database.write({
  users: [
    { id: 'u1', name: 'Usuário', email: 'user@teste.com', password: '1234', roles: ['user'], points: 0, interests: {} },
    { id: 'a1', name: 'Anunciante', email: 'adv@teste.com', password: '1234', roles: ['user', 'advertiser'], points: 0, interests: {} }
  ]
});

AP.engine.start();
const auth = AP.engine.get('auth-module');
const session = AP.engine.get('session');

assert.ok(auth, 'Módulo de autenticação deve estar disponível');
assert.ok(session, 'Módulo de sessão deve estar disponível');

assert.equal(auth.signIn('user@teste.com', 'errada').ok, false);
assert.equal(session.isAuthenticated(), false);

const login = auth.signIn(' USER@TESTE.COM ', '1234');
assert.equal(login.ok, true);
assert.equal(session.getCurrentAccount().id, 'u1');
assert.equal(session.isAuthenticated(), true);

auth.signOut();
assert.equal(session.isAuthenticated(), false);

const invalid = auth.signUp({ name: 'A', email: 'invalido', password: '1', roles: [] });
assert.equal(invalid.ok, false);
assert.equal(invalid.error, 'invalid-registration');

const duplicate = auth.signUp({ name: 'Outro', email: 'USER@TESTE.COM', password: '1234', roles: ['user'] });
assert.equal(duplicate.ok, false);
assert.equal(duplicate.error, 'email-exists');

const created = auth.signUp({
  name: 'Conta Dupla',
  email: 'dupla@teste.com',
  password: '1234',
  roles: ['user', 'advertiser', 'user']
});

assert.equal(created.ok, true);
assert.equal(Array.from(created.account.roles).join(','), 'user,advertiser');
assert.equal(session.getCurrentAccount().email, 'dupla@teste.com');
assert.equal(AP.permissions.canAccessScreen(created.account, 'userScreen'), true);
assert.equal(AP.permissions.canAccessScreen(created.account, 'advertiserScreen'), true);

const stored = AP.database.read();
assert.equal(stored.users.some((user) => user.email === 'dupla@teste.com'), true);
assert.ok(stored.auditLogs.some((log) => log.action === 'auth:register'));
assert.ok(stored.auditLogs.some((log) => log.action === 'auth:login'));

console.log('Auth module tests: OK');

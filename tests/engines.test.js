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
  'src/modules/recommendation/recommendation.module.js',
  'src/modules/rewards/rewards.module.js'
].forEach(load);

const AP = window.AssistaPay;
AP.database.write({
  users: [{ id:'u1', name:'Usuário', email:'u@teste.com', password:'1234', roles:['user'], points:0, interests:{} }],
  campaigns: [{
    id:'c1', category:'Tecnologia', status:'active', pointsPerView:5, rewardReserve:1,
    answer:'fone', metrics:{views:0,likes:0,shares:0,clicks:0,completions:0}
  }]
});
AP.engine.start();

const recommendation = AP.engine.get('recommendation');
const rewards = AP.engine.get('rewards');

assert.equal(recommendation.recordInteraction({ userId:'u1', category:'Tecnologia', eventType:'like' }).ok, true);
assert.equal(AP.database.findUserById('u1').interests.Tecnologia, 6);
assert.equal(recommendation.recordInteraction({ userId:'u1', category:'Tecnologia', eventType:'skip' }).score, 2);

const ranked = recommendation.rank([
  { id:'a', category:'Tecnologia', status:'active', metrics:{completions:1} },
  { id:'b', category:'Casa', status:'active', metrics:{completions:100} }
], AP.database.findUserById('u1'));
assert.equal(ranked.length, 2);
assert.ok(typeof ranked[0].recommendationScore === 'number');

assert.equal(rewards.claim({ userId:'u1', campaignId:'c1', watchedRatio:0.5, answer:'fone' }).error, 'insufficient-watch-time');
assert.equal(rewards.claim({ userId:'u1', campaignId:'c1', watchedRatio:0.9, answer:'errado' }).error, 'invalid-answer');

const success = rewards.claim({ userId:'u1', campaignId:'c1', watchedRatio:0.9, answer:'fone bluetooth' });
assert.equal(success.ok, true);
assert.equal(AP.database.findUserById('u1').points, 5);
assert.equal(AP.database.read().campaigns[0].metrics.views, 1);
assert.ok(AP.database.read().campaigns[0].rewardReserve < 1);
assert.equal(rewards.claim({ userId:'u1', campaignId:'c1', watchedRatio:1, answer:'fone' }).error, 'already-rewarded');

console.log('Engine tests: OK');

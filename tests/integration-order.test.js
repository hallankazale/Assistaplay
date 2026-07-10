const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join(__dirname, '..', 'integration', 'modular-smoke.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const expectedOrder = [
  '../src/core/config.js',
  '../src/core/storage.js',
  '../src/core/permissions.js',
  '../src/core/auth.js',
  '../src/core/migrations.js',
  '../src/core/database.js',
  '../src/core/events.js',
  '../src/core/features.js',
  '../src/core/router.js',
  '../src/core/engine.js',
  '../src/core/logger.js',
  '../src/bootstrap.js'
];

let previousIndex = -1;
for (const script of expectedOrder) {
  const index = html.indexOf(`src="${script}"`);
  assert.notEqual(index, -1, `Script ausente: ${script}`);
  assert.ok(index > previousIndex, `Script fora de ordem: ${script}`);
  previousIndex = index;
}

assert.ok(
  html.includes('AssistaPay.bootstrap.startCompatibilityMode()'),
  'O bootstrap deve iniciar em modo de compatibilidade.'
);

assert.equal(
  html.includes('legacyAuthAdapter.start()'),
  false,
  'O adaptador de autenticação ainda não deve ser ativado.'
);

assert.equal(
  html.includes('legacyNavigationAdapter.start()'),
  false,
  'O adaptador de navegação ainda não deve ser ativado.'
);

console.log('Integration order tests: OK');

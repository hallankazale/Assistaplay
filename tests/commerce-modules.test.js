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
  'src/modules/products/products.module.js','src/modules/affiliates/affiliates.module.js',
  'src/modules/orders/orders.module.js'
].forEach(load);

const AP = window.AssistaPay;
AP.database.write({
  users: [
    { id:'adv1', name:'Loja 1', roles:['advertiser'], points:0, interests:{} },
    { id:'adv2', name:'Loja 2', roles:['advertiser'], points:0, interests:{} },
    { id:'buyer1', name:'Comprador', roles:['user'], points:0, interests:{} },
    { id:'affiliate1', name:'Afiliado', roles:['user'], points:0, interests:{} },
    { id:'admin1', name:'Admin', roles:['admin'], points:0, interests:{} }
  ]
});
AP.engine.start();

const products = AP.engine.get('products');
const affiliates = AP.engine.get('affiliates');
const orders = AP.engine.get('orders');

assert.equal(products.create('buyer1', { name:'Produto', price:10, stock:2 }).error, 'advertiser-required');
assert.equal(products.create('adv1', { name:'X', price:0, stock:-1 }).ok, false);

const created = products.create('adv1', {
  name:'Fone Bluetooth', desc:'Produto teste', category:'Tecnologia',
  price:100, stock:5, commissionPercent:10, checkoutLink:''
});
assert.equal(created.ok, true);
assert.equal(products.list({ advertiserId:'adv1' }).length, 1);
assert.equal(products.update('adv2', created.product.id, { price:90 }).error, 'permission-denied');
assert.equal(products.update('adv1', created.product.id, { price:90 }).product.price, 90);
assert.equal(products.setStatus('adv1', created.product.id, 'paused').product.status, 'paused');
assert.equal(products.setStatus('adv1', created.product.id, 'active').product.status, 'active');

const joined = affiliates.join('affiliate1', created.product.id);
assert.equal(joined.ok, true);
assert.equal(joined.existing, false);
assert.equal(affiliates.join('affiliate1', created.product.id).existing, true);
assert.equal(affiliates.recordClick(joined.affiliate.code).ok, true);

assert.equal(orders.createOrder({ buyerId:'buyer1', productId:created.product.id, quantity:10 }).error, 'insufficient-stock');
const purchase = orders.createOrder({
  buyerId:'buyer1', productId:created.product.id, quantity:2, affiliateCode:joined.affiliate.code
});
assert.equal(purchase.ok, true);
assert.equal(purchase.order.subtotal, 180);
assert.equal(purchase.order.commissionAmount, 18);
assert.equal(AP.database.read().products[0].stock, 3);

assert.equal(orders.updateStatus(purchase.order.id, 'paid', 'adv1').ok, true);
let db = AP.database.read();
assert.equal(db.products[0].sales, 2);
assert.equal(db.affiliateLinks[0].sales, 1);
assert.equal(db.affiliateLinks[0].commissionEarned, 18);

const second = orders.createOrder({ buyerId:'buyer1', productId:created.product.id, quantity:1 });
assert.equal(second.ok, true);
assert.equal(AP.database.read().products[0].stock, 2);
assert.equal(orders.updateStatus(second.order.id, 'cancelled', 'adv1').ok, true);
assert.equal(AP.database.read().products[0].stock, 3);

assert.equal(orders.listForUser('buyer1').length, 2);
assert.equal(orders.listForAdvertiser('adv1').length, 2);
assert.ok(AP.database.read().auditLogs.some((log)=>log.action==='product:created'));
assert.ok(AP.database.read().auditLogs.some((log)=>log.action==='order:created'));
assert.ok(AP.database.read().auditLogs.some((log)=>log.action==='affiliate:commission-credited'));

console.log('Commerce module tests: OK');

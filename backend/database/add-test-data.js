const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🧪 Seeding TEST data for admin verification...');

const TEST_EMAIL_DOMAIN = '@autobath.test';

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

(async () => {
  try {
    await runAsync('BEGIN');

    // 1) Customers
    const customers = [
      { name: '[TEST] John Admin', email: 'john' + TEST_EMAIL_DOMAIN, phone: '+60111111111' },
      { name: '[TEST] Sarah QA', email: 'sarah' + TEST_EMAIL_DOMAIN, phone: '+60112223333' },
      { name: '[TEST] Mike Dev', email: 'mike' + TEST_EMAIL_DOMAIN, phone: '+60113334444' },
      { name: '[TEST] Emily Ops', email: 'emily' + TEST_EMAIL_DOMAIN, phone: '+60114445555' },
      { name: '[TEST] David UAT', email: 'david' + TEST_EMAIL_DOMAIN, phone: '+60115556666' },
    ];

    for (const c of customers) {
      await runAsync(
        `INSERT INTO customers (name, email, phone, address, vehicle_make, vehicle_model, vehicle_year, vehicle_color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.name, c.email, c.phone, 'TEST Address', 'Perodua', 'Myvi', 2020, 'Silver']
      );
    }

    // 2) Bookings (today and next days)
    const today = new Date();
    function fmt(d) { return d.toISOString().split('T')[0]; }
    const d0 = fmt(new Date(today));
    const d1 = fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
    const d2 = fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2));

    const bookings = [
      { name: customers[0].name, email: customers[0].email, phone: customers[0].phone, service: 'Basic', date: d0, time: '10:00', duration: 60, status: 'pending' },
      { name: customers[1].name, email: customers[1].email, phone: customers[1].phone, service: 'Premium', date: d0, time: '13:00', duration: 120, status: 'confirmed' },
      { name: customers[2].name, email: customers[2].email, phone: customers[2].phone, service: 'Engine Bay Wash & Protect', date: d1, time: '11:00', duration: 60, status: 'pending' },
      { name: customers[3].name, email: customers[3].email, phone: customers[3].phone, service: 'Interior Detailing & Protect (5-seater)', date: d1, time: '15:00', duration: 120, status: 'confirmed' },
      { name: customers[4].name, email: customers[4].email, phone: customers[4].phone, service: 'Ultra', date: d2, time: '09:00', duration: 240, status: 'pending' },
    ];

    for (const b of bookings) {
      await runAsync(
        `INSERT INTO bookings (customer_name, customer_email, customer_phone, service_name, date, time_slot, duration_minutes, vehicle_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.name, b.email, b.phone, b.service, b.date, b.time, b.duration, 'sedan', b.status]
      );
    }

    // 3) Reviews (attach to some services)
    const reviews = [
      { name: customers[0].name, email: customers[0].email, rating: 5, title: '[TEST] Great', comment: 'Excellent service!' },
      { name: customers[1].name, email: customers[1].email, rating: 4, title: '[TEST] Good', comment: 'Pretty good overall.' },
    ];

    for (const r of reviews) {
      await runAsync(
        `INSERT INTO reviews (customer_name, customer_email, rating, title, comment, is_verified, is_approved, created_at)
         VALUES (?, ?, ?, ?, ?, 1, 1, datetime('now'))`,
        [r.name, r.email, r.rating, r.title, r.comment]
      );
    }

    // 4) Orders with items using existing products
    const products = await allAsync(`SELECT id, name, price FROM products ORDER BY id LIMIT 10`);
    const pick = (n) => products.slice(0, Math.min(n, products.length));

    const orders = [
      { customer: customers[2], items: pick(2).map((p) => ({ product_id: p.id, price: p.price, quantity: 1 })) },
      { customer: customers[3], items: pick(3).map((p) => ({ product_id: p.id, price: p.price, quantity: 2 })) },
      { customer: customers[4], items: pick(1).map((p) => ({ product_id: p.id, price: p.price, quantity: 1 })) },
    ];

    for (const o of orders) {
      const orderId = uuidv4();
      const totalAmount = o.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
      await runAsync(
        `INSERT INTO orders (id, customer_name, customer_email, customer_phone, total_amount, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`,
        [orderId, o.customer.name, o.customer.email, o.customer.phone, totalAmount.toFixed(2)]
      );
      for (const it of o.items) {
        await runAsync(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [orderId, it.product_id, it.quantity, it.price]
        );
      }
    }

    await runAsync('COMMIT');
    console.log('✅ TEST data seeded successfully');
  } catch (e) {
    console.error('❌ Error seeding test data:', e.message || e);
    try { await runAsync('ROLLBACK'); } catch(_) {}
  } finally {
    db.close();
  }
})();



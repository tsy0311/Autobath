const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
console.log('DB PATH:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  console.log('OPEN_ERR:', err && err.message);
});

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

(async () => {
  try {
    const tables = await all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('TABLES:', tables.map(t => t.name));

    const products = await all(`
      SELECT 
        p.id, p.name, p.description, p.price, p.image_url, p.category, p.brand, p.stock,
        IFNULL(SUM(oi.quantity), 0) AS sold
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY p.brand, p.name
    `);
    console.log('PRODUCTS_ROWS:', products);
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    db.close();
  }
})();



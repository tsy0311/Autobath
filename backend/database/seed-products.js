const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🛒 Seeding products...');

// Helper to parse RM price strings
function parsePrice(p) {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  const cleaned = String(p).trim().toLowerCase().replace(/rm\s*/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

const products = [
  { name: 'Metal Sprayer', brand: 'An-Riddle', price: 'rm58' },
  { name: 'JOYBOND Beauty Clay', brand: 'Other', price: 'rm65' },
  { name: 'Washing Brush Tool set (3pcs)', brand: 'An-Riddle', price: 'rm28' },
  { name: 'Multi-functional Collapsible Box', brand: 'Lutian', price: 'rm99' },
  { name: 'Car Wash Brush Mop', brand: 'Lutian', price: 'rm58' },
  { name: 'AJIGE Cup Measurement', brand: 'Other', price: 'rm9.9' },
  { name: 'Curve Holding Brush', brand: 'Autobath', price: 'rm22' },
  { name: 'Straight Holding Brush', brand: 'Autobath', price: 'rm22' },
  { name: 'Detachable Brush Mop', brand: 'Lutian', price: 'rm99.8' },
  { name: 'Easy Super PA PRO', brand: 'Lutian', price: 'rm159' },
  { name: 'High Pressure Washer F4', brand: 'Lutian', price: 'rm339' },
  { name: 'MJJC Foam Cannon', brand: 'Other', price: 'rm239' },
  { name: 'Foamer - F15', brand: 'Lutian', price: 'rm89' },
  { name: 'Washing Glove', brand: 'An-Riddle', price: 'rm16' },
  { name: 'Hand-Carry Box', brand: 'An-Riddle', price: 'rm28' },
  { name: 'Unicorn Brush (Large)', brand: 'Benzhi', price: 'rm39.9' },
  { name: 'MJJC V3', brand: 'Other', price: 'rm239' },
  { name: 'Multi-functional Clip', brand: 'An-Riddle', price: 'rm65' },
  { name: 'Multi-functional Detail Brush (5pcs)', brand: 'An-Riddle', price: 'rm20' },
  { name: 'PA Bottle Separator', brand: 'Lutian', price: 'rm59' },
  { name: 'PA Foam Separator', brand: 'An-Riddle', price: 'rm55' },
  { name: 'High Pressure Washer Panther 4 (P4)', brand: 'Lutian', price: 'rm399' },
  { name: 'High Pressure Washer Panther 6 (P6 PRO)', brand: 'Lutian', price: 'rm669' },
  { name: 'High Pressure Washer P6 PRO + Trolley (Bundle)', brand: 'Lutian', price: 'rm849' },
  { name: 'Washing Brush (Pig Hair)', brand: 'Benzhi', price: 'rm18' },
  { name: 'Washing Brush (Plastic)', brand: 'Benzhi', price: 'rm18' },
  { name: 'Rim Brush', brand: 'Benzhi', price: 'rm23.90' },
  { name: 'Unicorn Brush (Small)', brand: 'Benzhi', price: 'rm29.9' },
  { name: 'Snow Pro Foam Cannon', brand: 'Lutian', price: 'rm89' },
  { name: 'Spatula', brand: 'Autobath', price: 'rm9.9' },
  { name: 'Squeeze Bottle with measurement', brand: 'Autobath', price: 'rm9.9' },
  { name: 'Tear-Off Towel', brand: 'Benzhi', price: 'rm28.8' },
  { name: 'Tyre Brush', brand: 'Benzhi', price: 'rm18.8' },
  { name: 'Windstorm Vacuum-10L', brand: 'Lutian', price: 'rm150' },
  { name: 'Windstorm Vacuum-20L', brand: 'Lutian', price: 'rm269' },
  { name: 'Windstorm Vacuum-30L', brand: 'Lutian', price: 'rm339' }
];

db.serialize(() => {
  db.run('BEGIN');

  const selectStmt = db.prepare(`SELECT id FROM products WHERE name = ?`);
  const insertStmt = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category, brand, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const updateStmt = db.prepare(`
    UPDATE products 
    SET description = ?, price = ?, image_url = ?, category = ?, brand = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  products.forEach((p) => {
    const price = parsePrice(p.price);
    const brand = p.brand || null;
    const name = p.name.trim();
    selectStmt.get([name], (err, row) => {
      if (err) {
        console.error('Select error for', name, err.message);
        return;
      }
      if (row) {
        updateStmt.run([null, price, null, null, brand, 0, row.id], (e) => {
          if (e) console.error('Update error for', name, e.message);
          else console.log('✅ Updated', name);
        });
      } else {
        insertStmt.run([name, null, price, null, null, brand, 0], (e) => {
          if (e) console.error('Insert error for', name, e.message);
          else console.log('➕ Inserted', name);
        });
      }
    });
  });

  db.run('COMMIT', (e) => {
    if (e) console.error('Commit error:', e.message);
    console.log('🎉 Product seeding completed');
    selectStmt.finalize();
    insertStmt.finalize();
    updateStmt.finalize();
    db.close();
  });
});



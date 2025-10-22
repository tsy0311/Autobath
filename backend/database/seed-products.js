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
  // An-Riddle Brand Products
  { name: 'Metal Sprayer 原液壶', brand: 'An-Riddle', price: 'rm58', stock: 10 },
  { name: 'Washing Brush Tool Set (3pcs) 细节刷三件套', brand: 'An-Riddle', price: 'rm28', stock: 25 },
  { name: 'Washing Glove 纤维手套', brand: 'An-Riddle', price: 'rm16', stock: 50 },
  { name: 'Hand-Carry Box 手提工具篮', brand: 'An-Riddle', price: 'rm28', stock: 20 },
  { name: 'Multi-functional Clip 脚垫夹', brand: 'An-Riddle', price: 'rm65', stock: 6 },
  { name: 'Multi-functional Detail Brush (5pcs) 细节刷五件套', brand: 'An-Riddle', price: 'rm20', stock: 52 },
  { name: 'PA Foam Separator PA壶', brand: 'An-Riddle', price: 'rm55', stock: 10 },
  
  // Autobath Brand Products
  { name: 'Curve Holding Brush 鱼形毛刷', brand: 'Autobath', price: 'rm22', stock: 40 },
  { name: 'Straight Holding Brush 方形毛刷', brand: 'Autobath', price: 'rm22', stock: 50 },
  { name: 'Butter Knife 刮蜡刀', brand: 'Autobath', price: 'rm15', stock: 30 },
  { name: 'Squeeze Bottle with Measurement 250毫升分蜡瓶', brand: 'Autobath', price: 'rm9.9', stock: 50 },
  
  // Benzhi Brand Products
  { name: 'Rim Brush 轮毂刷', brand: 'Benzhi', price: 'rm23.90', stock: 70 },
  { name: 'Tyre Brush 轮子刷', brand: 'Benzhi', price: 'rm18.8', stock: 50 },
  { name: 'JOYBOND Beauty Clay 去污剂蓝色200G', brand: 'Benzhi', price: 'rm65', stock: 30 },
  { name: 'AJIGE Cup Measurement PC透明量杯', brand: 'Benzhi', price: 'rm9.9', stock: 50 },
  { name: 'MJJC Foam Cannon 蓝白', brand: 'Benzhi', price: 'rm239', stock: 10 },
  { name: 'MJJC V3', brand: 'Benzhi', price: 'rm239', stock: 5 },
  { name: 'Unicorn Brush (Large) 独角兽圣诞树轮毂刷', brand: 'Benzhi', price: 'rm39.9', stock: 100 },
  { name: 'Washing Brush (Pig Hair) 刷子', brand: 'Benzhi', price: 'rm18', stock: 50 },
  { name: 'Tear-Off Towel 毛巾卷', brand: 'Benzhi', price: 'rm28.8', stock: 80 },
  
  // Lutian Brand Products
  { name: 'F4', brand: 'Lutian', price: 'rm339', stock: 5 },
  { name: 'P4', brand: 'Lutian', price: 'rm399', stock: 5 },
  { name: 'P6PRO', brand: 'Lutian', price: 'rm669', stock: 5 },
  { name: 'P6PRO bundle', brand: 'Lutian', price: 'rm849', stock: 3 },
  { name: 'Car Wash Brush Mop 伸缩拖把', brand: 'Lutian', price: 'rm58', stock: 10 },
  { name: 'Detachable Brush Mop 可拆卸雪尼尔洗车刷', brand: 'Lutian', price: 'rm99.8', stock: 8 },
  { name: 'Easy Super PA PRO 金属高压泡沫发生器PA壶', brand: 'Lutian', price: 'rm159', stock: 3 },
  { name: 'Foamer - F15 暴雪气压', brand: 'Lutian', price: 'rm89', stock: 8 },
  { name: 'Snow Pro Foam Cannon 雪炮PA壶', brand: 'Lutian', price: 'rm89', stock: 5 },
  { name: 'Multi-functional Collapsible Box 多功能折叠收纳箱36L', brand: 'Lutian', price: 'rm99', stock: 5 },
  { name: 'PA Bottle Separator PA药剂分瓶', brand: 'Lutian', price: 'rm59', stock: 6 },
  { name: 'Windstorm Vacuum-10L 雄风', brand: 'Lutian', price: 'rm150', stock: 3 },
  { name: 'Windstorm Vacuum-20L 雄风', brand: 'Lutian', price: 'rm269', stock: 3 },
  { name: 'Windstorm Vacuum-30L 雄风', brand: 'Lutian', price: 'rm339', stock: 2 }
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
    const stock = p.stock || 0;
    selectStmt.get([name], (err, row) => {
      if (err) {
        console.error('Select error for', name, err.message);
        return;
      }
      if (row) {
        updateStmt.run([null, price, null, null, brand, stock, row.id], (e) => {
          if (e) console.error('Update error for', name, e.message);
          else console.log('✅ Updated', name, `(Stock: ${stock})`);
        });
      } else {
        insertStmt.run([name, null, price, null, null, brand, stock], (e) => {
          if (e) console.error('Insert error for', name, e.message);
          else console.log('➕ Inserted', name, `(Stock: ${stock})`);
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



const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Sample products data
const sampleProducts = [
  {
    name: "Car Shampoo",
    description: "High-quality pH-neutral car shampoo for safe and effective cleaning",
    price: 24.99,
    category: "Cleaning",
    stock_quantity: 50,
    image_url: null,
    is_active: 1
  },
  {
    name: "Interior Cleaner",
    description: "Multi-surface interior cleaner for leather, plastic, and fabric",
    price: 18.99,
    category: "Interior",
    stock_quantity: 30,
    image_url: null,
    is_active: 1
  },
  {
    name: "Microfiber Towels",
    description: "Premium microfiber towels for streak-free drying and polishing",
    price: 12.99,
    category: "Accessories",
    stock_quantity: 25,
    image_url: null,
    is_active: 1
  },
  {
    name: "Ceramic Coating Kit",
    description: "Professional-grade ceramic coating for long-lasting protection",
    price: 89.99,
    category: "Protection",
    stock_quantity: 15,
    image_url: null,
    is_active: 1
  },
  {
    name: "Wax Polish",
    description: "Premium carnauba wax for deep shine and protection",
    price: 34.99,
    category: "Protection",
    stock_quantity: 20,
    image_url: null,
    is_active: 1
  },
  {
    name: "Tire Shine",
    description: "Long-lasting tire shine gel for a glossy finish",
    price: 14.99,
    category: "Accessories",
    stock_quantity: 35,
    image_url: null,
    is_active: 1
  }
];

console.log('🚀 Adding sample products to database...');

// Clear existing products
db.run('DELETE FROM products', (err) => {
  if (err) {
    console.error('Error clearing products:', err);
    return;
  }
  
  console.log('✅ Cleared existing products');
  
  // Add sample products
  const insertStmt = db.prepare(`
    INSERT INTO products (name, description, price, category, stock, image_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  let completed = 0;
  
  sampleProducts.forEach((product) => {
    insertStmt.run([
      product.name,
      product.description,
      product.price,
      product.category,
      product.stock_quantity,
      product.image_url
    ], function(err) {
      if (err) {
        console.error(`❌ Error adding product ${product.name}:`, err);
      } else {
        console.log(`✅ Added product: ${product.name} (ID: ${this.lastID})`);
      }
      
      completed++;
      if (completed === sampleProducts.length) {
        insertStmt.finalize();
        
        // Verify products were added
        db.all('SELECT * FROM products', (err, rows) => {
          if (err) {
            console.error('Error verifying products:', err);
          } else {
            console.log(`🎉 Successfully added ${rows.length} products to database!`);
            console.log('Products:', rows.map(p => `${p.id}: ${p.name} - $${p.price}`).join('\n'));
          }
          
          db.close();
        });
      }
    });
  });
});

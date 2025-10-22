const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🎨 Seeding product variants...');

// Product variants to add
const productVariants = [
  {
    productName: 'Unicorn Brush (Large) 独角兽圣诞树轮毂刷',
    variants: [
      { name: 'Small', priceAdjustment: 0, stock: 100 },
      { name: 'Big', priceAdjustment: 0, stock: 100 }
    ]
  },
  {
    productName: 'Washing Brush (Pig Hair) 刷子',
    variants: [
      { name: 'Pig Hair (猪毛)', priceAdjustment: 0, stock: 50 },
      { name: 'Plastic (塑料细节刷)', priceAdjustment: 0, stock: 50 }
    ]
  },
  {
    productName: 'Tear-Off Towel 毛巾卷',
    variants: [
      { name: 'Pink', priceAdjustment: 0, stock: 80 },
      { name: 'Grey', priceAdjustment: 0, stock: 80 }
    ]
  }
];

db.serialize(() => {
  db.run('BEGIN');

  productVariants.forEach((productData) => {
    const { productName, variants } = productData;
    
    // Find the product
    db.get('SELECT id FROM products WHERE name = ?', [productName], (err, product) => {
      if (err) {
        console.error(`❌ Error finding product ${productName}:`, err);
        return;
      }
      
      if (!product) {
        console.log(`⚠️  Product not found: ${productName}`);
        return;
      }
      
      // Clear existing variants
      db.run('DELETE FROM product_colors WHERE product_id = ?', [product.id], (err) => {
        if (err) {
          console.error(`❌ Error clearing variants for ${productName}:`, err);
          return;
        }
        
        // Add new variants
        variants.forEach((variant, variantIndex) => {
          db.run(
            'INSERT INTO product_colors (product_id, color_name, price_adjustment, stock, sort_order) VALUES (?, ?, ?, ?, ?)',
            [product.id, variant.name, variant.priceAdjustment, variant.stock, variantIndex],
            function(err) {
              if (err) {
                console.error(`❌ Error adding variant ${variant.name} for ${productName}:`, err);
              } else {
                console.log(`✅ Added variant: ${productName} - ${variant.name} (Stock: ${variant.stock})`);
              }
            }
          );
        });
      });
    });
  });

  db.run('COMMIT', (e) => {
    if (e) console.error('Commit error:', e.message);
    console.log('🎉 Product variants seeding completed');
    db.close();
  });
});

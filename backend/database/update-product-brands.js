/**
 * Update Product Brands Script
 * 
 * This script adds brand information to products based on their category and type.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

// Use production database path
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.resolve(__dirname, '..', 'database.sqlite')
  : path.resolve(__dirname, '..', config.DB_PATH);

const db = new sqlite3.Database(dbPath);

// Brand assignments based on your actual brands
const brandAssignments = {
  1: 'An-Riddle', // Metal Sprayer
  2: 'An-Riddle', // Washing Brush Tool Set
  3: 'An-Riddle', // Washing Glove
  4: 'An-Riddle', // Hand-Carry Box
  5: 'An-Riddle', // Multi-functional Clip
  6: 'An-Riddle', // Multi-functional Detail Brush
  7: 'An-Riddle', // PA Foam Separator
  8: 'An-Riddle', // One Sided Towel
  9: 'An-Riddle', // Two Sided Towel
  10: 'An-Riddle', // Microfiber Towel
  11: 'An-Riddle', // Curve Holding Brush
  12: 'An-Riddle', // Straight Holding Brush
  13: 'An-Riddle', // Butter Knife
  14: 'An-Riddle', // Squeeze Bottle
  15: 'An-Riddle', // Rim Brush
  16: 'An-Riddle', // Tyre Brush
  17: 'Benzhi', // Beauty Clay
  18: 'Benzhi', // Cup Measurement
  19: 'Lutian', // Foam Cannon
  20: 'Lutian', // V3
  21: 'An-Riddle', // Unicorn Brush
  22: 'An-Riddle', // Washing Brush
  23: 'An-Riddle', // Tear-Off Towel
  24: 'Lutian', // High Pressure Washer F4
  25: 'Lutian', // High Pressure Washer P4
  26: 'Lutian', // High Pressure Washer P6 PRO
  27: 'Lutian', // High Pressure Washer P6 PRO + Trolley
  28: 'An-Riddle', // Car Wash Brush Mop
  29: 'An-Riddle', // Detachable Brush Mop
  30: 'An-Riddle', // Easy Super PA PRO
  31: 'An-Riddle', // Foamer - F15
  32: 'Lutian', // Snow Pro Foam Cannon
  33: 'An-Riddle', // Multi-functional Collapsible Box
  34: 'An-Riddle', // PA Bottle Separator
  35: 'Other', // Windstorm Vacuum-10L
  36: 'Other', // Windstorm Vacuum-20L
  37: 'Other' // Windstorm Vacuum-30L
};

console.log('🏷️ Starting product brand updates...');
console.log(`📁 Database path: ${dbPath}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Start transaction
db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  // Update each product with brand information
  Object.entries(brandAssignments).forEach(([productId, brand]) => {
    const updateQuery = `
      UPDATE products 
      SET brand = ? 
      WHERE id = ?
    `;
    
    db.run(updateQuery, [brand, parseInt(productId)], function(err) {
      if (err) {
        console.error(`❌ Error updating product ${productId}:`, err);
      } else {
        console.log(`✅ Updated product ${productId} with brand: ${brand}`);
      }
    });
  });

  // Commit transaction
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('❌ Error committing transaction:', err);
    } else {
      console.log('\n🎉 Product brand updates completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   • ${Object.keys(brandAssignments).length} products updated with brands`);
      console.log(`   • Brands assigned: An-Riddle, Lutian, Benzhi, Other`);
      console.log(`\n🌐 Updated brands will be visible on:`);
      console.log(`   • Product detail pages`);
      console.log(`   • Product listing pages`);
      console.log(`   • Brand filter options`);
    }
  });
});

db.close();

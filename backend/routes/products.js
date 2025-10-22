const express = require('express');
const router = express.Router();
const { db } = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all products
router.get('/', (req, res) => {
  const query = `
    SELECT 
      p.id, p.name, p.description, p.price, p.image_url, p.category, p.brand, p.stock,
      IFNULL(SUM(oi.quantity), 0) AS sold
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    GROUP BY p.id
    ORDER BY p.brand, p.name
  `;

  db.all(query, [], async (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch products'
      });
    }

    // Get images and colors for each product
    const productsWithDetails = await Promise.all(rows.map(async (product) => {
      const images = await new Promise((resolve) => {
        db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, id', [product.id], (err, images) => {
          if (err) {
            console.error('Error fetching product images:', err);
            resolve([]);
          } else {
            resolve(images);
          }
        });
      });

      const colors = await new Promise((resolve) => {
        db.all('SELECT * FROM product_colors WHERE product_id = ? AND is_available = 1 ORDER BY sort_order, id', [product.id], (err, colors) => {
          if (err) {
            console.error('Error fetching product colors:', err);
            resolve([]);
          } else {
            resolve(colors);
          }
        });
      });

      return {
        ...product,
        images,
        colors
      };
    }));

    res.json({
      success: true,
      products: productsWithDetails
    });
  });
});

// Get all categories
router.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch categories'
      });
    }

    res.json({
      success: true,
      categories: rows
    });
  });
});

// Initialize database with new tables
router.post('/init-db', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Create categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating categories table:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to create categories table'
        });
      }

      // Insert default categories
      const categories = [
        { name: 'Brushes & Tools', description: 'Cleaning brushes and detailing tools', sort_order: 1 },
        { name: 'Pressure Washers', description: 'High pressure washing equipment', sort_order: 2 },
        { name: 'Foam Cannons', description: 'Foam cannon and PA foam systems', sort_order: 3 },
        { name: 'Vacuum Cleaners', description: 'Car vacuum and cleaning systems', sort_order: 4 },
        { name: 'Accessories', description: 'Miscellaneous car detailing accessories', sort_order: 5 },
        { name: 'Brushes', description: 'Specialized cleaning brushes', sort_order: 6 },
        { name: 'Tools', description: 'Detailing tools and equipment', sort_order: 7 }
      ];

      const stmt = db.prepare(`
        INSERT OR IGNORE INTO categories (name, description, sort_order, is_active)
        VALUES (?, ?, ?, 1)
      `);

      let completed = 0;
      categories.forEach(category => {
        stmt.run(category.name, category.description, category.sort_order, (err) => {
          if (err) {
            console.error('Error inserting category:', err);
          }
          completed++;
          if (completed === categories.length) {
            stmt.finalize();
            res.json({
              success: true,
              message: 'Database initialized with categories table and default data'
            });
          }
        });
      });
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Database initialization failed'
    });
  }
});

// Add new category
router.post('/categories', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, sort_order } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required'
    });
  }

  const stmt = db.prepare(`
    INSERT INTO categories (name, description, sort_order, is_active)
    VALUES (?, ?, ?, 1)
  `);

  stmt.run(name, description || null, sort_order || 0, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to add category'
      });
    }

    res.json({
      success: true,
      message: 'Category added successfully',
      categoryId: this.lastID
    });
  });

  stmt.finalize();
});

// Get product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      p.id, p.name, p.description, p.price, p.image_url, p.category, p.brand, p.stock,
      IFNULL((SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.product_id = p.id), 0) AS sold
    FROM products p
    WHERE p.id = ?
  `;

  db.get(query, [id], async (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch product'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }

    // Get images and colors for the product
    const images = await new Promise((resolve) => {
      db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, id', [id], (err, images) => {
        if (err) {
          console.error('Error fetching product images:', err);
          resolve([]);
        } else {
          resolve(images);
        }
      });
    });

    const colors = await new Promise((resolve) => {
      db.all('SELECT * FROM product_colors WHERE product_id = ? AND is_available = 1 ORDER BY sort_order, id', [id], (err, colors) => {
        if (err) {
          console.error('Error fetching product colors:', err);
          resolve([]);
        } else {
          resolve(colors);
        }
      });
    });

    res.json({
      success: true,
      product: {
        ...row,
        images,
        colors
      }
    });
  });
});

// Get products by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;

  const query = `
    SELECT 
      p.id, p.name, p.description, p.price, p.image_url, p.category, p.brand, p.stock,
      IFNULL(SUM(oi.quantity), 0) AS sold
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    WHERE p.category = ?
    GROUP BY p.id
    ORDER BY p.name
  `;

  db.all(query, [category], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch products by category'
      });
    }

    res.json({
      success: true,
      products: rows
    });
  });
});

// Get all categories
router.get('/categories/list', (req, res) => {
  const query = `
    SELECT DISTINCT category
    FROM products
    ORDER BY category
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch categories'
      });
    }

    const categories = rows.map(row => row.category);
    
    res.json({
      success: true,
      categories
    });
  });
});

// Get all brands
router.get('/brands/list', (req, res) => {
  const query = `
    SELECT DISTINCT brand
    FROM products
    WHERE brand IS NOT NULL AND TRIM(brand) != ''
    ORDER BY brand
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch brands'
      });
    }

    const brands = rows.map(row => row.brand);
    
    res.json({
      success: true,
      brands
    });
  });
});

// Create new product (admin endpoint)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, image_url, category, brand, stock } = req.body;

  console.log('📦 Creating new product:', { name, brand, price, stock, description });

  // Validate required fields
  if (!name || !brand) {
    console.error('❌ Validation failed - missing name or brand:', { name, brand });
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name and brand are required'
    });
  }

  // Normalize price (optional; default 0)
  const normalizedPrice = (price === undefined || price === null || price === '') ? 0 : Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'Price must be a non-negative number'
    });
  }

  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category, brand, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(name, description || null, normalizedPrice, image_url || null, category || null, brand, stock || 0, function(err) {
    if (err) {
      console.error('❌ Database error creating product:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create product'
      });
    }

    console.log('✅ Product created successfully with ID:', this.lastID);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: this.lastID
    });
  });

  stmt.finalize();
});

// Update product (admin endpoint)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category, brand, stock } = req.body;

  const normalizedPrice = (price === undefined || price === null || price === '') ? 0 : Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'Price must be a non-negative number'
    });
  }

  const stmt = db.prepare(`
    UPDATE products 
    SET name = ?, description = ?, price = ?, image_url = ?, category = ?, brand = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(name, description, normalizedPrice, image_url, category || null, brand, stock, id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update product'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  });

  stmt.finalize();
});

// Delete product (admin endpoint)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM products WHERE id = ?');

  stmt.run(id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete product'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  });

  stmt.finalize();
});

// Seed products endpoint (admin only)
router.post('/seed', authenticateToken, requireAdmin, (req, res) => {
  console.log('🌱 Seeding products...');
  
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

  let added = 0;
  let updated = 0;
  let errors = 0;

  const processProduct = (product, callback) => {
    const price = parsePrice(product.price);
    const brand = product.brand || null;
    const name = product.name.trim();
    
    // Check if product exists
    db.get('SELECT id FROM products WHERE name = ?', [name], (err, row) => {
      if (err) {
        console.error('Select error for', name, err.message);
        errors++;
        callback();
        return;
      }
      
      if (row) {
        // Update existing
        db.run(
          'UPDATE products SET description = ?, price = ?, image_url = ?, category = ?, brand = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [null, price, null, null, brand, 0, row.id],
          (e) => {
            if (e) {
              console.error('Update error for', name, e.message);
              errors++;
            } else {
              console.log('✅ Updated', name);
              updated++;
            }
            callback();
          }
        );
      } else {
        // Insert new
        db.run(
          'INSERT INTO products (name, description, price, image_url, category, brand, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [name, null, price, null, null, brand, 0],
          function(e) {
            if (e) {
              console.error('Insert error for', name, e.message);
              errors++;
            } else {
              console.log('➕ Inserted', name);
              added++;
            }
            callback();
          }
        );
      }
    });
  };

  let processed = 0;
  products.forEach(product => {
    processProduct(product, () => {
      processed++;
      if (processed === products.length) {
        console.log(`🎉 Seeding completed: ${added} added, ${updated} updated, ${errors} errors`);
        res.json({
          success: true,
          message: 'Products seeded successfully',
          added,
          updated,
          errors
        });
      }
    });
  });
});

// Add product image
router.post('/:id/images', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { image_url, alt_text, sort_order, is_primary } = req.body;

  if (!image_url) {
    return res.status(400).json({
      success: false,
      message: 'Image URL is required'
    });
  }

  const stmt = db.prepare(`
    INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, image_url, alt_text || null, sort_order || 0, is_primary || 0, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to add product image'
      });
    }

    res.json({
      success: true,
      message: 'Image added successfully',
      imageId: this.lastID
    });
  });

  stmt.finalize();
});

// Delete product image
router.delete('/images/:imageId', authenticateToken, requireAdmin, (req, res) => {
  const { imageId } = req.params;

  const stmt = db.prepare('DELETE FROM product_images WHERE id = ?');

  stmt.run(imageId, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  });

  stmt.finalize();
});

// Add product color
router.post('/:id/colors', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order } = req.body;

  if (!color_name) {
    return res.status(400).json({
      success: false,
      message: 'Color name is required'
    });
  }

  const stmt = db.prepare(`
    INSERT INTO product_colors (product_id, color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id, 
    color_name, 
    color_code || null, 
    color_image_url || null, 
    price_adjustment || 0, 
    stock || 0, 
    is_available !== undefined ? is_available : 1, 
    sort_order || 0, 
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to add product color'
        });
      }

      res.json({
        success: true,
        message: 'Color added successfully',
        colorId: this.lastID
      });
    }
  );

  stmt.finalize();
});

// Update product color
router.put('/colors/:colorId', authenticateToken, requireAdmin, (req, res) => {
  const { colorId } = req.params;
  const { color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order } = req.body;

  const stmt = db.prepare(`
    UPDATE product_colors 
    SET color_name = ?, color_code = ?, color_image_url = ?, price_adjustment = ?, stock = ?, is_available = ?, sort_order = ?
    WHERE id = ?
  `);

  stmt.run(
    color_name, 
    color_code, 
    color_image_url, 
    price_adjustment, 
    stock, 
    is_available, 
    sort_order, 
    colorId, 
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to update product color'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Color not found'
        });
      }

      res.json({
        success: true,
        message: 'Color updated successfully'
      });
    }
  );

  stmt.finalize();
});

// Delete product color
router.delete('/colors/:colorId', authenticateToken, requireAdmin, (req, res) => {
  const { colorId } = req.params;

  const stmt = db.prepare('DELETE FROM product_colors WHERE id = ?');

  stmt.run(colorId, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete color'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Color not found'
      });
    }

    res.json({
      success: true,
      message: 'Color deleted successfully'
    });
  });

  stmt.finalize();
});

// Bulk import products
router.post('/bulk-import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type } = req.body;
    
    if (type === 'chinese-names') {
      // Run complete cleanup first, then final cleanup for exactly 45 products
      const { spawn } = require('child_process');
      const path = require('path');
      
      // First run complete cleanup
      const cleanupScript = path.join(__dirname, '../database/complete-cleanup.js');
      const finalScript = path.join(__dirname, '../database/final-cleanup-45-products.js');
      
      // Run complete cleanup first
      const cleanupChild = spawn('node', [cleanupScript], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
      
      let cleanupOutput = '';
      let cleanupError = '';
      
      cleanupChild.stdout.on('data', (data) => {
        cleanupOutput += data.toString();
      });
      
      cleanupChild.stderr.on('data', (data) => {
        cleanupError += data.toString();
      });
      
      cleanupChild.on('close', (cleanupCode) => {
        if (cleanupCode === 0) {
          console.log('Complete cleanup finished, now running final import...');
          
          // Now run final cleanup
          const finalChild = spawn('node', [finalScript], {
            cwd: path.join(__dirname, '..'),
            stdio: 'pipe'
          });
          
          let finalOutput = '';
          let finalError = '';
          
          finalChild.stdout.on('data', (data) => {
            finalOutput += data.toString();
          });
          
          finalChild.stderr.on('data', (data) => {
            finalError += data.toString();
          });
          
          finalChild.on('close', (finalCode) => {
            if (finalCode === 0) {
              // Count the number of products processed
              const successCount = (finalOutput.match(/✅/g) || []).length;
              const insertCount = (finalOutput.match(/➕/g) || []).length;
              const totalCount = successCount + insertCount;
              
              res.json({
                success: true,
                message: 'Bulk import completed successfully - exactly 45 products with variants',
                count: totalCount,
                output: cleanupOutput + '\n\n' + finalOutput
              });
            } else {
              console.error('Final import script error:', finalError);
              res.status(500).json({
                success: false,
                message: 'Final import failed',
                error: finalError
              });
            }
          });
        } else {
          console.error('Complete cleanup script error:', cleanupError);
          res.status(500).json({
            success: false,
            message: 'Complete cleanup failed',
            error: cleanupError
          });
        }
      });
      
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid import type'
      });
    }
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk import failed',
      error: error.message
    });
  }
});

module.exports = router;

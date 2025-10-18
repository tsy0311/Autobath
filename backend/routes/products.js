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

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch products'
      });
    }

    res.json({
      success: true,
      products: rows
    });
  });
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

  db.get(query, [id], (err, row) => {
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

    res.json({
      success: true,
      product: row
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

  // Validate required fields
  if (!name || !brand) {
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
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create product'
      });
    }

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

module.exports = router;

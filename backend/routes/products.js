/**
 * PRODUCTS ROUTE - DATABASE DRIVEN
 * 
 * This file handles all product operations using the database.
 * All product data is stored in and retrieved from the SQLite database.
 * 
 * Database tables:
 * - products: main product information
 * - product_images: product images with sort order and primary flag
 * - product_colors: product variants/colors with pricing and stock
 */

const express = require('express');
const router = express.Router();

// Helper function to get database connection
const getDatabase = () => {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const config = require('../config');
  
  const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
  return new sqlite3.Database(dbPath);
};

const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Helper to parse RM price strings
function parsePrice(p) {
  if (typeof p === 'number') return p;
  if (!p) return 0;
  const cleaned = String(p).trim().toLowerCase().replace(/rm\s*/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// Get all products
router.get('/', (req, res) => {
  const db = getDatabase();
  
  const getProductsQuery = `SELECT * FROM products ORDER BY id`;
  const getImagesQuery = `SELECT * FROM product_images ORDER BY product_id, sort_order`;
  
  db.all(getProductsQuery, [], (err, products) => {
    if (err) {
      console.error('Error fetching products from database:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
    
    db.all(getImagesQuery, [], (err, images) => {
      if (err) {
        console.error('Error fetching images from database:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch product images' });
      }
      
      const imagesByProduct = {};
      images.forEach(image => {
        if (!imagesByProduct[image.product_id]) {
          imagesByProduct[image.product_id] = [];
        }
        imagesByProduct[image.product_id].push(image);
      });
      
      // Get colors for all products
      const getColorsQuery = `SELECT * FROM product_colors ORDER BY product_id, sort_order`;
      
      db.all(getColorsQuery, [], (err, colors) => {
        if (err) {
          console.error('Error fetching colors from database:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch product colors'
          });
        }
        
        // Group colors by product_id
        const colorsByProduct = {};
        colors.forEach(color => {
          if (!colorsByProduct[color.product_id]) {
            colorsByProduct[color.product_id] = [];
          }
          colorsByProduct[color.product_id].push(color);
        });
        
        // Combine products with their images and colors
        const productsWithImagesAndColors = products.map(product => {
          const productImages = imagesByProduct[product.id] || [];
          const productColors = colorsByProduct[product.id] || [];
          
          // If no images in database but has image_url, create a fallback
          if (productImages.length === 0 && product.image_url) {
            productImages.push({
              id: Date.now() + product.id,
              product_id: product.id,
              image_url: product.image_url,
              alt_text: null,
              sort_order: 0,
              is_primary: 1,
              created_at: new Date().toISOString()
            });
          }
          
          return {
            ...product,
            images: productImages,
            colors: productColors
          };
        });
        
        res.json({
          success: true,
          products: productsWithImagesAndColors,
          deployment_version: 'v6.0.0',
          timestamp: new Date().toISOString()
        });
      });
    });
  });
});

// Get all categories
router.get('/categories', (req, res) => {
  const db = getDatabase();
  
  const getCategoriesQuery = `SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category`;
  
  db.all(getCategoriesQuery, [], (err, categories) => {
    if (err) {
      console.error('Error fetching categories from database:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
    
    const categoryList = categories.map(c => c.category);
    res.json({ success: true, categories: categoryList });
  });
});

// Get product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id);
  const db = getDatabase();

  const getProductQuery = `SELECT * FROM products WHERE id = ?`;
  const getImagesQuery = `SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order`;
  
  db.get(getProductQuery, [productId], (err, product) => {
    if (err) {
      console.error('Error fetching product from database:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found', message: 'No product found with the given ID' });
    }
    
    // Get images and colors for this product
    const getColorsQuery = `SELECT * FROM product_colors WHERE product_id = ? ORDER BY sort_order`;
    
    db.all(getImagesQuery, [productId], (err, images) => {
      if (err) {
        console.error('Error fetching product images from database:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch product images'
        });
      }
      
      db.all(getColorsQuery, [productId], (err, colors) => {
        if (err) {
          console.error('Error fetching product colors from database:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch product colors'
          });
        }
        
        // If no images in database but has image_url, create a fallback
        if (images.length === 0 && product.image_url) {
          images.push({
            id: Date.now() + productId,
            product_id: productId,
            image_url: product.image_url,
            alt_text: null,
            sort_order: 0,
            is_primary: 1,
            created_at: new Date().toISOString()
          });
        }
        
        res.json({
          success: true,
          product: {
            ...product,
            images,
            colors: colors || []
          }
        });
      });
    });
  });
});

// Create new product
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { name, description, price, image_url, category, brand, stock } = req.body;
  console.log('📦 Creating new product:', { name, brand, price, stock, description });

  if (!name || !brand) {
    console.error('❌ Validation failed - missing name or brand:', { name, brand });
    return res.status(400).json({ error: 'Missing required fields', message: 'Name and brand are required' });
  }

  const normalizedPrice = (price === undefined || price === null || price === '') ? 0 : Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({ error: 'Invalid price', message: 'Price must be a non-negative number' });
  }

  const db = getDatabase();
  const insertProductQuery = `
    INSERT INTO products (name, description, price, brand, stock, category, image_url, sold)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(insertProductQuery, [
    name, description || null, normalizedPrice, brand, stock || 0, category || null, image_url || null, 0
  ], function(err) {
    if (err) {
      console.error('❌ Error saving product to database:', err);
      return res.status(500).json({ success: false, message: 'Failed to save product to database' });
    }
    
    console.log('✅ Product created successfully with ID:', this.lastID);
    res.status(201).json({ success: true, message: 'Product created successfully', productId: this.lastID });
  });
});

// Update product
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category, brand, stock } = req.body;
  const productId = parseInt(id);

  const normalizedPrice = (price === undefined || price === null || price === '') ? 0 : Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({ error: 'Invalid price', message: 'Price must be a non-negative number' });
  }

  const db = getDatabase();
  const updateProductQuery = `
    UPDATE products 
    SET name = ?, description = ?, price = ?, image_url = ?, category = ?, brand = ?, stock = ?
    WHERE id = ?
  `;
  
  db.run(updateProductQuery, [
    name, description || null, normalizedPrice, image_url || null, category || null, brand, stock || 0, productId
  ], function(err) {
    if (err) {
      console.error('❌ Error updating product in database:', err);
      return res.status(500).json({ success: false, message: 'Failed to update product in database' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found', message: 'No product found with the given ID' });
    }
    
    res.json({ success: true, message: 'Product updated successfully' });
  });
});

// Delete product
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id);

  const db = getDatabase();
  const deleteProductQuery = `DELETE FROM products WHERE id = ?`;
  
  console.log('🗑️ Attempting to delete product ID:', productId);
  
  db.run(deleteProductQuery, [productId], function(err) {
    if (err) {
      console.error('❌ Error deleting product from database:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product from database'
      });
    }
    
    console.log('🗑️ Delete query executed. Changes:', this.changes);
    
    if (this.changes === 0) {
      console.log('❌ No rows affected - product not found');
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }
    
    // Also delete associated images and colors
    const deleteImagesQuery = `DELETE FROM product_images WHERE product_id = ?`;
    const deleteColorsQuery = `DELETE FROM product_colors WHERE product_id = ?`;
    
    db.run(deleteImagesQuery, [productId], function(err) {
      if (err) {
        console.error('❌ Error deleting product images:', err);
      }
    });
    
    db.run(deleteColorsQuery, [productId], function(err) {
      if (err) {
        console.error('❌ Error deleting product colors:', err);
      }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  });
});

// Add product image
router.post('/:id/images', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { image_url, alt_text, sort_order, is_primary } = req.body;
  const productId = parseInt(id);

  if (!image_url) {
    return res.status(400).json({ success: false, message: 'Image URL is required' });
  }

  const db = getDatabase();
  
  // Check if product exists
  const checkProductQuery = `SELECT id FROM products WHERE id = ?`;
  db.get(checkProductQuery, [productId], (err, product) => {
    if (err) {
      console.error('Error checking product:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const insertImageQuery = `
      INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertImageQuery, [
      productId, image_url, alt_text || null, sort_order || 0, is_primary || 0, new Date().toISOString()
    ], function(err) {
      if (err) {
        console.error('Error saving image to database:', err);
        return res.status(500).json({ success: false, message: 'Failed to save image to database' });
      }
      
      // If this is a primary image, update the products table image_url field
      if (is_primary) {
        const updateProductQuery = `UPDATE products SET image_url = ? WHERE id = ?`;
        db.run(updateProductQuery, [image_url, productId], function(err) {
          if (err) {
            console.error('Error updating product image_url:', err);
          } else {
            console.log('✅ Updated product image_url in database');
          }
        });
      }
      
      res.json({ success: true, message: 'Image added successfully', imageId: this.lastID });
    });
  });
});

// Delete product image
router.delete('/images/:imageId', authenticateToken, requireAdmin, (req, res) => {
  const { imageId } = req.params;
  const { productId } = req.query;
  
  console.log('Delete image request:', { imageId, productId });
  
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  const db = getDatabase();
  const deleteImageQuery = `DELETE FROM product_images WHERE id = ?`;
  
  db.run(deleteImageQuery, [imageId], function(err) {
    if (err) {
      console.error('Error deleting image from database:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete image from database' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    console.log('Image deleted successfully');
    res.json({ success: true, message: 'Image deleted successfully' });
  });
});

// Add product variant
router.post('/:id/colors', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order } = req.body;
  const productId = parseInt(id);

  if (!color_name) {
    return res.status(400).json({ success: false, message: 'Color name is required' });
  }

  const db = getDatabase();
  const insertColorQuery = `
    INSERT INTO product_colors (product_id, color_name, color_code, color_image_url, price_adjustment, stock, is_available, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(insertColorQuery, [
    productId, color_name, color_code || null, color_image_url || null, 
    price_adjustment || 0, stock || 0, is_available ? 1 : 0, sort_order || 0, 
    new Date().toISOString()
  ], function(err) {
    if (err) {
      console.error('Error adding variant to database:', err);
      return res.status(500).json({ success: false, message: 'Failed to add variant to database' });
    }
    
    res.json({ success: true, message: 'Variant added successfully', variantId: this.lastID });
  });
});

// Delete product variant
router.delete('/:id/colors/:colorId', authenticateToken, requireAdmin, (req, res) => {
  const { id, colorId } = req.params;
  const productId = parseInt(id);
  const variantId = parseInt(colorId);

  const db = getDatabase();
  const deleteColorQuery = `DELETE FROM product_colors WHERE id = ? AND product_id = ?`;
  
  db.run(deleteColorQuery, [variantId, productId], function(err) {
    if (err) {
      console.error('Error deleting variant from database:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete variant from database' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    
    res.json({ success: true, message: 'Variant deleted successfully' });
  });
});

module.exports = { router };

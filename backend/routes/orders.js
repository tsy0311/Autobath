const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');
const { sendEmail } = require('../services/emailService');

// Create new order
router.post('/', async (req, res) => {
  try {
    // Normalize request body to support both frontend payload shapes
    const body = req.body || {};
    let { customerName, customerEmail, customerPhone, items } = body;

    if ((!customerName || !customerEmail) && body.customerInfo) {
      customerName = body.customerInfo.name;
      customerEmail = body.customerInfo.email;
      customerPhone = body.customerInfo.phone;
    }

    // Map items that may come as { id, quantity } to { productId, quantity, selectedVariant }
    if (Array.isArray(items)) {
      items = items.map((it) => ({
        productId: it.productId || it.product_id || it.id,
        quantity: Number(it.quantity) || 1,
        selectedVariant: it.selectedVariant || null
      }));
    }

    // Validate required fields
    if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Customer name, email, and items are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { productId, quantity, selectedVariant } = item;
      
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          error: 'Invalid item data',
          message: 'Each item must have a valid product ID and quantity'
        });
      }

      // Get product details
      const product = await new Promise((resolve, reject) => {
        db.get('SELECT id, name, price, stock FROM products WHERE id = ?', [productId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!product) {
        return res.status(400).json({
          error: 'Product not found',
          message: `Product with ID ${productId} not found`
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Only ${product.stock} units available for ${product.name}`
        });
      }

      // Calculate price with variant adjustment
      const variantPriceAdjustment = selectedVariant ? (selectedVariant.price_adjustment || 0) : 0;
      const finalPrice = product.price + variantPriceAdjustment;
      const itemTotal = finalPrice * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId,
        name: product.name,
        price: finalPrice,
        quantity,
        total: itemTotal,
        variantId: selectedVariant ? selectedVariant.id : null,
        variantName: selectedVariant ? selectedVariant.color_name : null,
        variantPriceAdjustment: variantPriceAdjustment
      });
    }

    // Generate order ID
    const orderId = uuidv4();

    // Start transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Extract payment and delivery information
      const payment_method = (body.payment && body.payment.method) || 'tng';
      const payment_reference = (body.payment && body.payment.reference) || 'Pending verification';
      const payment_proof_url = (body.payment && body.payment.proofUrl) || null;
      const delivery_option = body.deliveryOption || 'collection';
      const delivery_address = body.address || null;

      // Validate payment proof is provided
      if (!payment_proof_url) {
        return res.status(400).json({
          error: 'Payment proof required',
          message: 'Please upload your payment receipt screenshot'
        });
      }

      // Insert order
      const orderStmt = db.prepare(`
        INSERT INTO orders (
          id, customer_name, customer_email, customer_phone, total_amount,
          payment_method, payment_reference, payment_proof_url,
          delivery_option, delivery_address
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      orderStmt.run(
        orderId, customerName, customerEmail, customerPhone || null, totalAmount,
        payment_method, payment_reference, payment_proof_url,
        delivery_option, delivery_address
      );

      // Insert order items
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price, variant_id, variant_name, variant_price_adjustment)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of orderItems) {
        itemStmt.run(
          orderId, 
          item.productId, 
          item.quantity, 
          item.price,
          item.variantId,
          item.variantName,
          item.variantPriceAdjustment
        );
      }

      // Update product stock
      const stockStmt = db.prepare(`
        UPDATE products 
        SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      for (const item of orderItems) {
        stockStmt.run(item.quantity, item.productId);
      }

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Transaction error:', err);
          db.run('ROLLBACK');
          return res.status(500).json({
            error: 'Order creation failed',
            message: 'Failed to process order'
          });
        }

        // Send confirmation email
        const emailData = {
          to: customerEmail,
          subject: `Order Confirmation - ${orderId}`,
          template: 'orderConfirmation',
          data: {
            orderId,
            customerName,
            customerEmail,
            totalAmount: totalAmount.toFixed(2),
            orderDate: new Date().toLocaleDateString(),
            items: orderItems
          }
        };

        sendEmail(emailData).catch(error => {
          console.error('Failed to send order confirmation email:', error);
        });

        res.status(201).json({
          success: true,
          message: 'Order created successfully',
          order: {
            id: orderId,
            customerName,
            customerEmail,
            totalAmount,
            items: orderItems
          }
        });
      });

      orderStmt.finalize();
      itemStmt.finalize();
      stockStmt.finalize();
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Order creation failed',
      message: 'Please try again'
    });
  }
});

// Get order by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  // Get order details
  const orderQuery = `
    SELECT id, customer_name, customer_email, customer_phone, total_amount, status, created_at
    FROM orders
    WHERE id = ?
  `;

  db.get(orderQuery, [id], (err, order) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch order'
      });
    }

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with the given ID'
      });
    }

    // Get order items
    const itemsQuery = `
      SELECT oi.quantity, oi.price, oi.variant_id, oi.variant_name, oi.variant_price_adjustment,
             p.name, p.description, p.brand, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;

    db.all(itemsQuery, [id], (err, items) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to fetch order items'
        });
      }

      res.json({
        success: true,
        order: {
          ...order,
          items
        }
      });
    });
  });
});

// Get all orders (admin endpoint)
router.get('/', (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT o.id, o.customer_name, o.customer_email, o.customer_phone, o.total_amount, 
           o.status, o.created_at, o.payment_method, o.payment_reference, 
           o.payment_proof_url, o.payment_verified, o.payment_verified_by, 
           o.payment_verified_at, o.delivery_option, o.delivery_address
    FROM orders o
  `;
  const params = [];

  if (status) {
    query += ' WHERE o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, async (err, orders) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch orders'
      });
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      return new Promise((resolve, reject) => {
        const itemsQuery = `
          SELECT oi.quantity, oi.price, oi.variant_id, oi.variant_name, oi.variant_price_adjustment,
                 p.id as product_id, p.name as product_name, p.brand, p.image_url
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `;
        
        db.all(itemsQuery, [order.id], (err, items) => {
          if (err) {
            console.error('Error fetching order items:', err);
            reject(err);
            return;
          }
          
          // Parse images JSON if it exists
          const itemsWithImages = items.map(item => ({
            ...item,
            images: item.images ? JSON.parse(item.images) : []
          }));
          
          resolve({
            ...order,
            items: itemsWithImages
          });
        });
      });
    }));

    res.json({
      success: true,
      orders: ordersWithItems
    });
  });
});

// Update order status (admin endpoint)
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: 'Status must be pending, processing, shipped, delivered, completed, or cancelled'
    });
  }

  const stmt = db.prepare(`
    UPDATE orders 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(status, id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update order status'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  });

  stmt.finalize();
});

// Verify payment for order (admin endpoint)
router.put('/:id/verify-payment', (req, res) => {
  const { id } = req.params;
  const { verified, verifiedBy, notes } = req.body;

  if (typeof verified !== 'boolean') {
    return res.status(400).json({
      error: 'Invalid input',
      message: 'verified must be a boolean'
    });
  }

  const stmt = db.prepare(`
    UPDATE orders 
    SET payment_verified = ?, 
        payment_verified_by = ?, 
        payment_verified_at = CURRENT_TIMESTAMP,
        status = CASE WHEN ? = 1 THEN 'processing' ELSE status END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(verified ? 1 : 0, verifiedBy || 'admin', verified ? 1 : 0, id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to verify payment'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with the given ID'
      });
    }

    // Send email notification to customer
    if (verified) {
      db.get('SELECT customer_name, customer_email, total_amount FROM orders WHERE id = ?', [id], (err, order) => {
        if (!err && order) {
          const emailData = {
            to: order.customer_email,
            subject: `Payment Confirmed - Order #${id}`,
            template: 'paymentConfirmation',
            data: {
              orderId: id,
              customerName: order.customer_name,
              totalAmount: order.total_amount.toFixed(2)
            }
          };
          sendEmail(emailData).catch(error => {
            console.error('Failed to send payment confirmation email:', error);
          });
        }
      });
    }

    res.json({
      success: true,
      message: verified ? 'Payment verified successfully' : 'Payment verification removed'
    });
  });

  stmt.finalize();
});

module.exports = router;

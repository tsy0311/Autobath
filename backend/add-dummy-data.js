const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🎲 Adding dummy data to AutoBath database...\n');

db.serialize(() => {
  // Add dummy customers
  const customers = [
    { name: 'John Smith', email: 'john.smith@email.com', phone: '+60123456789', vehicle_make: 'Toyota', vehicle_model: 'Camry', vehicle_year: 2020, vehicle_color: 'Silver', loyalty_points: 150, loyalty_tier: 'silver', total_spent: 450.00 },
    { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+60187654321', vehicle_make: 'Honda', vehicle_model: 'Civic', vehicle_year: 2019, vehicle_color: 'Blue', loyalty_points: 250, loyalty_tier: 'gold', total_spent: 750.00 },
    { name: 'Michael Chen', email: 'mchen@email.com', phone: '+60192345678', vehicle_make: 'BMW', vehicle_model: '3 Series', vehicle_year: 2021, vehicle_color: 'Black', loyalty_points: 80, loyalty_tier: 'bronze', total_spent: 240.00 },
    { name: 'Emily Wong', email: 'emily.wong@email.com', phone: '+60165432109', vehicle_make: 'Mercedes', vehicle_model: 'C-Class', vehicle_year: 2022, vehicle_color: 'White', loyalty_points: 320, loyalty_tier: 'platinum', total_spent: 960.00 },
    { name: 'David Tan', email: 'david.tan@email.com', phone: '+60178901234', vehicle_make: 'Mazda', vehicle_model: 'CX-5', vehicle_year: 2020, vehicle_color: 'Red', loyalty_points: 120, loyalty_tier: 'silver', total_spent: 360.00 },
    { name: 'Lisa Kumar', email: 'lisa.kumar@email.com', phone: '+60143218765', vehicle_make: 'Nissan', vehicle_model: 'Altima', vehicle_year: 2018, vehicle_color: 'Gray', loyalty_points: 50, loyalty_tier: 'bronze', total_spent: 150.00 }
  ];

  console.log('📝 Adding customers...');
  const customerStmt = db.prepare(`
    INSERT INTO customers (name, email, phone, vehicle_make, vehicle_model, vehicle_year, vehicle_color, loyalty_points, loyalty_tier, total_spent, last_service_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now', '-' || ? || ' days'))
  `);

  customers.forEach((customer, index) => {
    customerStmt.run(
      customer.name, customer.email, customer.phone, customer.vehicle_make,
      customer.vehicle_model, customer.vehicle_year, customer.vehicle_color,
      customer.loyalty_points, customer.loyalty_tier, customer.total_spent,
      Math.floor(Math.random() * 60) + 1 // Random days ago (1-60)
    );
  });
  customerStmt.finalize();
  console.log(`✅ Added ${customers.length} customers\n`);

  // Add dummy bookings
  const bookingDates = [];
  for (let i = 0; i < 15; i++) {
    const daysOffset = Math.floor(Math.random() * 30) - 15; // -15 to +15 days from today
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    bookingDates.push(date.toISOString().split('T')[0]);
  }

  const services = ['Premium Wash Package', 'Interior Detailing', 'Exterior Polish', 'Full Detail Package', 'Quick Wash', 'Ceramic Coating'];
  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const vehicleTypes = ['sedan', 'suv', 'truck'];

  console.log('📝 Adding bookings...');
  const bookingStmt = db.prepare(`
    INSERT INTO bookings (customer_name, customer_email, customer_phone, service_name, date, time_slot, duration_minutes, vehicle_type, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 15; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const date = bookingDates[i];
    const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    const duration = [60, 90, 120][Math.floor(Math.random() * 3)];
    const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const notes = i % 3 === 0 ? 'Please pay extra attention to the wheels' : null;

    bookingStmt.run(
      customer.name, customer.email, customer.phone, service, date, timeSlot,
      duration, vehicleType, notes, status
    );
  }
  bookingStmt.finalize();
  console.log(`✅ Added 15 bookings\n`);

  // Add dummy reviews
  const reviewComments = [
    { title: 'Excellent Service!', comment: 'The team did an amazing job on my car. It looks brand new! Highly recommend.', rating: 5 },
    { title: 'Very Professional', comment: 'Great attention to detail. Will definitely come back for more services.', rating: 5 },
    { title: 'Good Value', comment: 'Quality service at a reasonable price. My car looks great!', rating: 4 },
    { title: 'Outstanding Work', comment: 'The interior cleaning was thorough and my car smells fresh. Thank you!', rating: 5 },
    { title: 'Satisfied Customer', comment: 'Professional service, friendly staff. Minor delay but overall good experience.', rating: 4 },
    { title: 'Impressed!', comment: 'Best detailing service I have used. The ceramic coating is perfect!', rating: 5 },
    { title: 'Decent Service', comment: 'Good job overall, but could improve on the drying process.', rating: 3 },
    { title: 'Happy with Results', comment: 'My SUV looks amazing after the full detail package. Worth every penny!', rating: 5 },
    { title: 'Needs Improvement', comment: 'Service was okay, but I expected more attention to detail for the price.', rating: 3 },
    { title: 'Highly Recommended', comment: 'Fantastic work! They even cleaned areas I did not expect. Will return!', rating: 5 }
  ];

  console.log('📝 Adding reviews...');
  const reviewStmt = db.prepare(`
    INSERT INTO reviews (customer_name, customer_email, rating, title, comment, is_approved, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
  `);

  reviewComments.forEach((review, index) => {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const isApproved = Math.random() > 0.3 ? 1 : 0; // 70% approved
    const daysAgo = Math.floor(Math.random() * 90) + 1;

    reviewStmt.run(
      customer.name, customer.email, review.rating, review.title, review.comment,
      isApproved, daysAgo
    );
  });
  reviewStmt.finalize();
  console.log(`✅ Added ${reviewComments.length} reviews\n`);

  // Add dummy orders WITH order items
  console.log('📝 Adding orders with items...');
  
  const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  let ordersAdded = 0;

  // Get existing products first
  db.all('SELECT id, name, price FROM products LIMIT 6', [], (err, products) => {
    if (err || !products || products.length === 0) {
      console.error('⚠️ No products found. Skipping orders.');
      console.log(`✅ Added ${ordersAdded} orders\n`);
      finishUp();
      return;
    }

    console.log(`   Found ${products.length} products to use in orders`);

    for (let i = 0; i < 12; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      
      // Select 1-3 random products for this order
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderProducts = [];
      const usedProductIds = new Set();
      
      for (let j = 0; j < numItems; j++) {
        let product;
        do {
          product = products[Math.floor(Math.random() * products.length)];
        } while (usedProductIds.has(product.id));
        
        usedProductIds.add(product.id);
        const quantity = Math.floor(Math.random() * 3) + 1;
        orderProducts.push({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity
        });
      }

      // Calculate total
      const totalAmount = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Insert order
      const orderStmt = db.prepare(`
        INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
      `);

      orderStmt.run(
        customer.name, customer.email, customer.phone, totalAmount.toFixed(2), status, daysAgo,
        function(orderErr) {
          if (orderErr) {
            console.error('Error inserting order:', orderErr);
            return;
          }

          const orderId = this.lastID;
          ordersAdded++;

          // Insert order items
          const itemStmt = db.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
          `);

          orderProducts.forEach(item => {
            itemStmt.run(orderId, item.product_id, item.quantity, item.price);
          });

          itemStmt.finalize();

          // If this is the last order, finish up
          if (ordersAdded === 12) {
            console.log(`✅ Added ${ordersAdded} orders with items\n`);
            finishUp();
          }
        }
      );

      orderStmt.finalize();
    }
  });

  function finishUp() {
    console.log('🎉 Dummy data added successfully!\n');
    console.log('Summary:');
    console.log('- 6 customers with vehicles and loyalty info');
    console.log('- 15 bookings with various statuses');
    console.log('- 10 reviews (some pending approval)');
    console.log('- 12 orders with items and different statuses\n');
    console.log('✅ You can now test all admin features!\n');
    db.close();
  }

  return; // Exit here, finishUp() will close db

});


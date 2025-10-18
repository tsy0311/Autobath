const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
const db = new sqlite3.Database(dbPath);

console.log('🔧 Updating service packages and individual services prices...');

db.serialize(() => {
  // Upsert service packages
  const packages = [
    { name: 'Basic Wash', base_price: 80.0, duration_minutes: 75, is_popular: 0 },
    { name: 'Premium Wash', base_price: 138.0, duration_minutes: 180, is_popular: 1 },
    { name: 'Ultra', base_price: 258.0, duration_minutes: 480, is_popular: 0 }
  ];

  db.run('BEGIN');

  packages.forEach((pkg) => {
    // Try to find existing by similar names (Basic|Premium|Ultra)
    db.get(
      `SELECT id FROM service_packages WHERE name LIKE ?`,
      [`%${pkg.name.split(' ')[0]}%`],
      (err, row) => {
        if (err) {
          console.error('Error selecting package', pkg.name, err.message);
          return;
        }
        if (row) {
          db.run(
            `UPDATE service_packages 
             SET name = ?, base_price = ?, duration_minutes = ?, discount_percentage = 0, is_popular = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [pkg.name, pkg.base_price, pkg.duration_minutes, pkg.is_popular, row.id],
            (e) => {
              if (e) console.error('Error updating package', pkg.name, e.message);
              else console.log('✅ Updated package', pkg.name);
            }
          );
        } else {
          db.run(
            `INSERT INTO service_packages (name, description, base_price, duration_minutes, services, discount_percentage, image_url, is_popular, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [pkg.name, null, pkg.base_price, pkg.duration_minutes, JSON.stringify([]), 0, null, pkg.is_popular],
            (e) => {
              if (e) console.error('Error inserting package', pkg.name, e.message);
              else console.log('➕ Inserted package', pkg.name);
            }
          );
        }
      }
    );
  });

  // Upsert individual services
  const services = [
    { name: 'Engine Bay Wash & Protect', base_price: 88.0, duration_minutes: 60, category: 'Detailing' },
    { name: 'Interior Detailing & Protect (5-seater)', base_price: 280.0, duration_minutes: 120, category: 'Interior' },
    { name: 'Interior Detailing & Protect (7-seater)', base_price: 389.0, duration_minutes: 150, category: 'Interior' },
    { name: 'S002 Spray Sealant', base_price: 29.0, duration_minutes: 15, category: 'Protection' }
  ];

  services.forEach((svc) => {
    db.get(`SELECT id FROM services WHERE name = ?`, [svc.name], (err, row) => {
      if (err) {
        console.error('Error selecting service', svc.name, err.message);
        return;
      }
      if (row) {
        db.run(
          `UPDATE services 
           SET description = COALESCE(description, ''), base_price = ?, duration_minutes = ?, category = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [svc.base_price, svc.duration_minutes, svc.category, row.id],
          (e) => {
            if (e) console.error('Error updating service', svc.name, e.message);
            else console.log('✅ Updated service', svc.name);
          }
        );
      } else {
        db.run(
          `INSERT INTO services (name, description, base_price, duration_minutes, category, vehicle_types, requirements, image_url, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [svc.name, null, svc.base_price, svc.duration_minutes, svc.category, JSON.stringify(['sedan','suv','truck']), JSON.stringify([]), null],
          (e) => {
            if (e) console.error('Error inserting service', svc.name, e.message);
            else console.log('➕ Inserted service', svc.name);
          }
        );
      }
    });
  });

  db.run('COMMIT', (e) => {
    if (e) console.error('Commit error:', e.message);
    console.log('🎉 Service updates completed');
    db.close();
  });
});



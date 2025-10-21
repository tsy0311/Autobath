const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

// Use the same DB path as the server
const dbPath = path.resolve(__dirname, '..', config.DB_PATH);

function parsePrice(value) {
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  if (!value) return 0;
  const cleaned = String(value).trim().toLowerCase().replace(/rm\s*/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

// Consolidated, opinionated catalog to be present in all environments
const PRODUCT_CATALOG = [
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

// Service Packages by Vehicle Type
const SERVICE_PACKAGES = [
  // Hatchback
  { name: 'Basic Wash', base_price: 78.0, duration_minutes: 90, vehicle_type: 'hatchback', is_popular: 0 },
  { name: 'Premium Wash', base_price: 120.0, duration_minutes: 105, vehicle_type: 'hatchback', is_popular: 1 },
  { name: 'Ultra', base_price: 190.0, duration_minutes: 135, vehicle_type: 'hatchback', is_popular: 0 },
  
  // Sedan/SUV
  { name: 'Basic Wash', base_price: 88.0, duration_minutes: 120, vehicle_type: 'sedan/suv', is_popular: 0 },
  { name: 'Premium Wash', base_price: 150.0, duration_minutes: 135, vehicle_type: 'sedan/suv', is_popular: 1 },
  { name: 'Ultra', base_price: 230.0, duration_minutes: 165, vehicle_type: 'sedan/suv', is_popular: 0 },
  
  // Truck/MPV
  { name: 'Basic Wash', base_price: 108.0, duration_minutes: 150, vehicle_type: 'truck/mpv', is_popular: 0 },
  { name: 'Premium Wash', base_price: 190.0, duration_minutes: 165, vehicle_type: 'truck/mpv', is_popular: 1 },
  { name: 'Ultra', base_price: 260.0, duration_minutes: 195, vehicle_type: 'truck/mpv', is_popular: 0 }
];

// Individual Services (Motorcycle and Add-ons)
const INDIVIDUAL_SERVICES = [
  // Motorcycle - Normal Bike
  { name: 'Basic Wash - Normal Bike', base_price: 25.0, duration_minutes: 40, category: 'Motorcycle', vehicle_types: ['motorcycle'], bike_type: 'normal' },
  { name: 'Detailing + Wax - Normal Bike', base_price: 55.0, duration_minutes: 50, category: 'Motorcycle', vehicle_types: ['motorcycle'], bike_type: 'normal' },
  { name: 'Polish - Normal Bike', base_price: 130.0, duration_minutes: 120, category: 'Motorcycle', vehicle_types: ['motorcycle'], bike_type: 'normal' },
  
  // Motorcycle - Sportbike
  { name: 'Basic Wash - Sportbike', base_price: 25.0, duration_minutes: 70, category: 'Motorcycle', vehicle_types: ['motorcycle'], bike_type: 'sportbike' },
  { name: 'Detailing + Wax - Sportbike', base_price: 55.0, duration_minutes: 120, category: 'Motorcycle', vehicle_types: ['motorcycle'], bike_type: 'sportbike' },
  { name: 'Polish - Sportbike', base_price: 130.0, duration_minutes: 150, category: 'Motorcycle', vehicle_types: ['motorcycle'], bike_type: 'sportbike' },
  
  // Add-on Services
  { name: 'Engine Bay Wash & Protect', base_price: 88.0, duration_minutes: 60, category: 'Add-on', vehicle_types: ['hatchback', 'sedan/suv', 'truck/mpv'] },
  { name: 'Interior Detailing & Protect (5-seater)', base_price: 280.0, duration_minutes: 120, category: 'Add-on', vehicle_types: ['hatchback', 'sedan/suv', 'truck/mpv'] },
  { name: 'Interior Detailing & Protect (7-seater)', base_price: 389.0, duration_minutes: 150, category: 'Add-on', vehicle_types: ['hatchback', 'sedan/suv', 'truck/mpv'] },
  { name: 'S002 Spray Sealant', base_price: 29.0, duration_minutes: 15, category: 'Protection', vehicle_types: ['hatchback', 'sedan/suv', 'truck/mpv'] }
];

function upsertProducts(db) {
  return new Promise((resolve) => {
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

    let remaining = PRODUCT_CATALOG.length;
    if (remaining === 0) return resolve();

    PRODUCT_CATALOG.forEach((item) => {
      const normalizedName = item.name.trim();
      const normalizedPrice = parsePrice(item.price);
      const normalizedBrand = item.brand || null;

      selectStmt.get([normalizedName], (err, row) => {
        if (err) {
          // soft-fail one item; continue
          remaining -= 1;
          if (remaining === 0) {
            selectStmt.finalize();
            insertStmt.finalize();
            updateStmt.finalize();
            resolve();
          }
          return;
        }

        if (row) {
          updateStmt.run([null, normalizedPrice, null, null, normalizedBrand, 0, row.id], () => {
            remaining -= 1;
            if (remaining === 0) {
              selectStmt.finalize();
              insertStmt.finalize();
              updateStmt.finalize();
              resolve();
            }
          });
        } else {
          insertStmt.run([normalizedName, null, normalizedPrice, null, null, normalizedBrand, 0], () => {
            remaining -= 1;
            if (remaining === 0) {
              selectStmt.finalize();
              insertStmt.finalize();
              updateStmt.finalize();
              resolve();
            }
          });
        }
      });
    });
  });
}

function upsertServicePackages(db) {
  return new Promise((resolve) => {
    let pending = SERVICE_PACKAGES.length;
    if (pending === 0) return resolve();

    SERVICE_PACKAGES.forEach((pkg) => {
      db.get(`SELECT id FROM service_packages WHERE name LIKE ?`, [`%${pkg.name.split(' ')[0]}%`], (err, row) => {
        if (err) {
          pending -= 1;
          if (pending === 0) resolve();
          return;
        }
        if (row) {
          db.run(
            `UPDATE service_packages 
             SET name = ?, base_price = ?, duration_minutes = ?, vehicle_type = ?, discount_percentage = 0, is_popular = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [pkg.name, pkg.base_price, pkg.duration_minutes, pkg.vehicle_type, pkg.is_popular, row.id],
            () => {
              pending -= 1;
              if (pending === 0) resolve();
            }
          );
        } else {
          db.run(
            `INSERT INTO service_packages (name, description, base_price, duration_minutes, vehicle_type, services, discount_percentage, image_url, is_popular, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [pkg.name, null, pkg.base_price, pkg.duration_minutes, pkg.vehicle_type, JSON.stringify([]), 0, null, pkg.is_popular],
            () => {
              pending -= 1;
              if (pending === 0) resolve();
            }
          );
        }
      });
    });
  });
}

function upsertIndividualServices(db) {
  return new Promise((resolve) => {
    let pending = INDIVIDUAL_SERVICES.length;
    if (pending === 0) return resolve();

    INDIVIDUAL_SERVICES.forEach((svc) => {
      db.get(`SELECT id FROM services WHERE name = ?`, [svc.name], (err, row) => {
        if (err) {
          pending -= 1;
          if (pending === 0) resolve();
          return;
        }
        if (row) {
          db.run(
            `UPDATE services 
             SET description = COALESCE(description, ''), base_price = ?, duration_minutes = ?, category = ?, vehicle_types = ?, bike_type = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [svc.base_price, svc.duration_minutes, svc.category, JSON.stringify(svc.vehicle_types || []), svc.bike_type || null, row.id],
            () => {
              pending -= 1;
              if (pending === 0) resolve();
            }
          );
        } else {
          db.run(
            `INSERT INTO services (name, description, base_price, duration_minutes, category, vehicle_types, bike_type, requirements, image_url, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [svc.name, null, svc.base_price, svc.duration_minutes, svc.category, JSON.stringify(svc.vehicle_types || []), svc.bike_type || null, JSON.stringify([]), null],
            () => {
              pending -= 1;
              if (pending === 0) resolve();
            }
          );
        }
      });
    });
  });
}

function addSpraySealantToPackages(db) {
  return new Promise((resolve) => {
    // Find S002 Spray Sealant service ID
    db.get(`SELECT id FROM services WHERE name = 'S002 Spray Sealant'`, (err, sealantService) => {
      if (err || !sealantService) {
        console.log('S002 Spray Sealant service not found, skipping package updates');
        resolve();
        return;
      }

      // Update Premium and Ultra packages to include S002 Spray Sealant
      const updateStmt = db.prepare(`
        UPDATE service_packages 
        SET services = ?, updated_at = CURRENT_TIMESTAMP
        WHERE (name LIKE '%Premium%' OR name LIKE '%Ultra%') AND is_active = 1
      `);
      
      updateStmt.run(JSON.stringify([sealantService.id]), (err) => {
        if (err) {
          console.error('Error updating packages with spray sealant:', err);
        } else {
          console.log('✅ Added S002 Spray Sealant to Premium and Ultra packages');
        }
        updateStmt.finalize();
        resolve();
      });
    });
  });
}

function ensureCatalogSeeded() {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath);
    db.serialize(async () => {
      db.run('BEGIN');
      try {
        await upsertProducts(db);
        await upsertServicePackages(db);
        await upsertIndividualServices(db);
        await addSpraySealantToPackages(db);
        db.run('COMMIT', () => {
          db.close();
          resolve();
        });
      } catch (e) {
        // best-effort rollback
        try { db.run('ROLLBACK'); } catch (_) {}
        db.close();
        resolve();
      }
    });
  });
}

module.exports = {
  ensureCatalogSeeded
};



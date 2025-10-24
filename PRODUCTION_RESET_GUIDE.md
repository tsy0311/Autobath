# 🚨 Production Database Reset Guide

## Problem
The live website is not retrieving products and service packages because the production database is using old initialization data that contains removed services.

## Root Cause
- Production database was initialized with old data from `backend/database/init.js`
- The old data included services we removed: Paint Correction, Premium Detailing, Interior Deep Clean, Basic Car Wash, Ceramic Coating
- Service packages were using old structure without proper vehicle types

## ✅ Solution Applied
1. **Updated `backend/database/init.js`** with correct data:
   - 15 individual services (removed unwanted ones)
   - 9 service packages with proper vehicle types
   - Correct pricing and durations

2. **Created reset script** `backend/database/reset-production-db.js`

## 🔧 To Fix Live Website

### Option 1: Automatic (Wait for deployment)
The changes are pushed to GitHub and should deploy automatically. Wait 5-10 minutes and check:
- https://autobath.co
- https://api.autobath.co/api/services
- https://api.autobath.co/api/service-packages

### Option 2: Add Missing Products Only (If services work but products are missing)
If services and service packages are working but products are missing:

1. **Access your Render dashboard**
2. **Go to your backend service** (autobath-api)
3. **Open the shell/console**
4. **Run the add products script**:
   ```bash
   cd backend
   node database/add-missing-products-to-live.js
   ```

### Option 3: Manual Reset (If automatic doesn't work)
If the production database still has old data, you need to manually reset it:

1. **Access your Render dashboard**
2. **Go to your backend service** (autobath-api)
3. **Open the shell/console**
4. **Run the force reset script**:
   ```bash
   cd backend
   node database/force-reset-production.js
   ```

### Option 4: Alternative Reset (If force reset doesn't work)
If the above doesn't work, try the regular reset:
```bash
cd backend
node database/reset-production-db.js
```

### Option 5: Force Database Recreation
If the above doesn't work, delete the database file and let it recreate:
1. **Delete** `database.sqlite` from production
2. **Restart** the backend service
3. **Database will recreate** with correct data

## 📊 Expected Results After Fix

### Individual Services (15 total)
- **Add-on**: Engine Bay Wash & Protect, Interior Detailing & Protect (5-seater), Interior Detailing & Protect (7-seater)
- **Coating**: GYEON Coating (Hatchback, Sedan/SUV, MPV/Truck)
- **Motorcycle**: Basic Wash, Detailing + Wax, Polish (Normal Bike, Sportbike)
- **Polish**: Polish (Hatchback, Sedan/SUV, MPV/Truck)

### Service Packages (9 total)
- **Hatchback**: Basic Wash (RM78), Premium Wash (RM120), Ultra (RM190)
- **Sedan/SUV**: Basic Wash (RM88), Premium Wash (RM150), Ultra (RM230)
- **Truck/MPV**: Basic Wash (RM108), Premium Wash (RM190), Ultra (RM260)

### Products (37 total)
- All product data should be restored

## 🔍 Verification Steps
1. Visit https://autobath.co
2. Check Home page shows 3 Sedan/SUV service packages
3. Go to Products page - should show all products
4. Go to Booking page → Individual Services - should show 15 services
5. Test booking flow with different vehicle types

## ⚠️ Important Notes
- The reset script will **delete all existing data** and recreate it
- This ensures production matches localhost exactly
- All bookings, orders, and admin data will be reset
- Make sure to backup any important data before running reset

## 🎯 Success Indicators
- ✅ Home page shows service packages
- ✅ Products page shows all products
- ✅ Individual services shows 15 services (not 5)
- ✅ No removed services appear anywhere
- ✅ Service packages have correct vehicle types and pricing

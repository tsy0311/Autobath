# 🚀 Live Website Database Update Guide

## Overview
This guide ensures the live website (Render deployment) has the same data as localhost after removing unwanted services.

## ✅ Changes Made Locally
- **Removed Services**: Paint Correction, Premium Detailing, Interior Deep Clean, Basic Car Wash, Ceramic Coating
- **Remaining Services**: 15 core services (GYEON Coating, Polish, Interior Detailing, Engine Bay, Motorcycle)
- **Service Packages**: 9 packages (3 per vehicle type: Hatchback, Sedan/SUV, Truck/MPV)

## 🔧 To Update Live Website

### Option 1: Automatic (Recommended)
The Render deployment should automatically pick up the changes. Check:
1. **Frontend**: https://autobath.co
2. **API**: https://api.autobath.co/api/services
3. **Service Packages**: https://api.autobath.co/api/service-packages

### Option 2: Manual Database Update (If needed)
If the live database needs manual updating, run these scripts on the production server:

```bash
# Connect to production server
cd backend
node database/update-services-final.js
node database/verify-service-packages.js
```

## 📊 Expected Results

### Individual Services (15 total)
- **Add-on**: Engine Bay Wash & Protect, Interior Detailing & Protect (5-seater), Interior Detailing & Protect (7-seater)
- **Coating**: GYEON Coating (Hatchback, Sedan/SUV, MPV/Truck)
- **Motorcycle**: Basic Wash, Detailing + Wax, Polish (Normal Bike, Sportbike)
- **Polish**: Polish (Hatchback, Sedan/SUV, MPV/Truck)

### Service Packages (9 total)
- **Hatchback**: Basic Wash (RM78), Premium Wash (RM120), Ultra (RM190)
- **Sedan/SUV**: Basic Wash (RM88), Premium Wash (RM150), Ultra (RM230)
- **Truck/MPV**: Basic Wash (RM108), Premium Wash (RM190), Ultra (RM260)

## 🎯 Home Page Display
The Home page should show 3 Sedan/SUV packages:
1. **Basic Wash - Sedan/SUV** - RM88
2. **Premium Wash - Sedan/SUV** - RM150 (Most Popular)
3. **Ultra - Sedan/SUV** - RM230

## 🔍 Verification Steps
1. Visit https://autobath.co
2. Check Home page shows 3 service packages
3. Go to Booking page → Individual Services
4. Verify only 15 services are shown (no removed services)
5. Test booking flow with different vehicle types

## 📝 Notes
- Database changes are not tracked in git (database.sqlite is in .gitignore)
- The update scripts ensure production matches localhost
- Service packages use hardcoded service lists on Home page
- Individual services are dynamically filtered by vehicle type

# Image Update Guide for Live Website

## Overview
This guide explains how to update the live website to display the same hardcoded images as the localhost version.

## What Was Changed
- ✅ Database updated with local image paths (`/img/filename.jpg`) instead of external URLs
- ✅ 62 images mapped to 37 products with proper sorting and primary image designation
- ✅ Frontend proxy configuration fixed to point to correct backend port
- ✅ Images now stored directly in database - no upload required

## Live Website URLs
- **Frontend**: https://autobath.co
- **Backend API**: https://api.autobath.co
- **Image Access**: https://api.autobath.co/img/filename.jpg

## Steps to Update Live Website

### 1. Wait for Deployment
The changes have been pushed to GitHub and should automatically deploy to Render. Wait for the deployment to complete.

### 2. Run Image Update Script
Once deployed, you need to run the image update script on the live database:

```bash
# SSH into your Render service or use Render's console
cd /opt/render/project/src/backend
npm run update:images
```

### 3. Verify Images Are Working
Test that images are accessible:
- Visit: https://api.autobath.co/img/metalsprayer1.jpg
- Check main website: https://autobath.co
- Verify products display images correctly

## Alternative: Manual Database Update
If you can't access the Render console, you can manually update the database by running SQL commands:

```sql
-- Clear existing images
DELETE FROM product_images;

-- Insert new images (example for first product)
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary, created_at)
VALUES 
(1, '/img/metalsprayer1.jpg', 'Product 1 - metalsprayer1.jpg', 0, 1, datetime('now')),
(1, '/img/metalsprayer2.jpg', 'Product 1 - metalsprayer2.jpg', 1, 0, datetime('now'));

-- Update main product image_url
UPDATE products SET image_url = '/img/metalsprayer1.jpg' WHERE id = 1;
```

## Expected Results
After running the update script:
- ✅ All 37 products will have multiple images
- ✅ Images will be accessible at `https://api.autobath.co/img/filename.jpg`
- ✅ Frontend will display images correctly
- ✅ No more broken image links
- ✅ Consistent image display between localhost and live website

## Troubleshooting
If images still don't display:
1. Check if the image files exist in the `/img` directory on the server
2. Verify the static file serving is working: `https://api.autobath.co/img/metalsprayer1.jpg`
3. Check browser console for any CORS or loading errors
4. Ensure the database update script completed successfully

## Files Modified
- `backend/database/update-images-to-local.js` - Local development script
- `backend/database/update-live-images.js` - Production script
- `backend/package.json` - Added update:images script
- `frontend/package.json` - Fixed proxy configuration

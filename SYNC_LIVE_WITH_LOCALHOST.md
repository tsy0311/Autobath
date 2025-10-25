# Sync Live Website with Localhost

## Current Localhost Database Status
✅ 37 products with multiple images and variants
✅ 62 product images properly stored with sort order
✅ Variants (colors/sizes) properly configured

## Issue
The live website (https://autobath.co) does not show the same data as localhost:
- Missing multiple images per product
- Missing variants
- Incorrect image order

## Solution
Run the image update script on the live production database.

## Steps to Sync Live Website

### Option 1: Via Render Dashboard (Recommended)

1. **Login to Render Dashboard**
   - Go to: https://dashboard.render.com
   - Navigate to your `autobath-api` service

2. **Open Shell**
   - Click on "Shell" tab
   - Wait for terminal to connect

3. **Run Update Script**
   ```bash
   cd /opt/render/project/src
   npm run update:images
   ```

4. **Verify Update**
   ```bash
   # Check if images were updated
   sqlite3 database.sqlite "SELECT COUNT(*) FROM product_images;"
   # Should show 62 images
   
   # Check products with images
   sqlite3 database.sqlite "SELECT p.name, COUNT(pi.id) as images FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id GROUP BY p.id LIMIT 5;"
   ```

### Option 2: Via Local Database Upload

If you can't access Render shell, you can upload the localhost database:

1. **Backup Live Database First**
   ```bash
   # Download current live database
   # (Use Render's dashboard or CLI)
   ```

2. **Upload Localhost Database**
   ```bash
   # Copy your localhost database.sqlite to Render
   # (Use Render's file upload or deployment)
   ```

### Option 3: Manual SQL Update

Run these SQL commands directly on the live database:

```sql
-- Clear existing images
DELETE FROM product_images;

-- Run the full insert statements from update-live-images.js
-- (Copy from the script file)
```

## Expected Results After Sync

### Products with Multiple Images:
- Product 1 (Metal Sprayer): 2 images
- Product 3 (Washing Glove): 3 images  
- Product 5 (Multi-functional Clip): 2 images
- Product 8 (One Sided Towel): 4 images
- Product 21 (Unicorn Brush): 3 images
- Product 22 (Washing Brush): 3 images
- Product 23 (Tear-Off Towel): 2 images
- Product 24-26 (High Pressure Washers): 3 images each
- Product 28 (Car Wash Brush Mop): 3 images

### Products with Variants:
- Product 3 (Washing Glove): 3 variants (BlackWhite, Blue, Red)
- Product 8 (One Sided Towel): 2 variants (40x40, 60x80)
- Product 9 (Two Sided Towel): 2 variants (40x40, 60x80)
- Product 10 (Microfiber Towel): 2 variants (30x40, 30x60)
- Product 21 (Unicorn Brush): 2 variants (Big, Small)
- Product 22 (Washing Brush): 2 variants (Pig Hair, Plastic)
- Product 23 (Tear-Off Towel): 2 variants (Grey, Pink)

## Verification

After running the update script, verify on the live website:

1. **Check Images**
   - Visit: https://autobath.co/products
   - Click on any product
   - Should see multiple images with arrows to navigate

2. **Check Variants**
   - Visit: https://autobath.co/product/3 (Washing Glove)
   - Should see variant options (BlackWhite, Blue, Red)

3. **Check API Response**
   - Visit: https://api.autobath.co/api/products
   - Should see `images` array with multiple entries
   - Should see `colors` array for products with variants

## Troubleshooting

### Images Not Showing
- Check if images exist: https://api.autobath.co/img/metalsprayer1.jpg
- Verify image paths in database start with `/img/`
- Check CORS headers allow image loading

### Variants Not Showing
- Check database: `SELECT * FROM product_colors WHERE product_id = 3;`
- Verify frontend is displaying variant selector
- Check if `is_available` is set to 1

### Script Fails
- Check Node.js version on Render
- Verify sqlite3 is installed
- Check database file permissions

## Files Modified
- `backend/database/update-live-images.js` - Production update script
- `backend/package.json` - Added `update:images` command
- `backend/database/update-images-to-local.js` - Local development script


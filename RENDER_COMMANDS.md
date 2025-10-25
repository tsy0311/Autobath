# Render Commands - Quick Reference

## 🚀 **Complete Update (Images + Variants)**

Run this command in Render shell to update everything:

```bash
cd backend
npm run update:complete
```

## 📸 **Images Only Update**

If you only want to update images:

```bash
cd backend
npm run update:images
```

## 🔍 **Check Current Status**

Before running updates, check what's currently in the database:

```bash
cd backend

# Check image count
sqlite3 database.sqlite "SELECT COUNT(*) as total_images FROM product_images;"

# Check variant count  
sqlite3 database.sqlite "SELECT COUNT(*) as total_variants FROM product_colors;"

# Check products with images
sqlite3 database.sqlite "SELECT p.name, COUNT(pi.id) as images FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id GROUP BY p.id LIMIT 5;"

# Check products with variants
sqlite3 database.sqlite "SELECT p.name, COUNT(pc.id) as variants FROM products p LEFT JOIN product_colors pc ON p.id = pc.product_id GROUP BY p.id HAVING variants > 0;"
```

## ✅ **Expected Results After Complete Update**

- **62 images** stored in database
- **15 variants** across 7 products
- **37 products** with proper data

### Products with Multiple Images:
- Metal Sprayer: 2 images
- Washing Glove: 3 images
- One Sided Towel: 4 images
- Unicorn Brush: 3 images
- Washing Brush: 3 images
- High Pressure Washers: 3 images each

### Products with Variants:
- Washing Glove: BlackWhite, Blue, Red
- One Sided Towel: 40x40, 60x80
- Two Sided Towel: 40x40, 60x80
- Microfiber Towel: 30x40, 30x60
- Unicorn Brush: Big, Small
- Washing Brush: Pig Hair, Plastic
- Tear-Off Towel: Grey, Pink

## 🧪 **Test After Update**

1. **Check API Response:**
   - Visit: https://api.autobath.co/api/products
   - Look for `images` arrays and `colors` arrays

2. **Check Frontend:**
   - Visit: https://autobath.co/products
   - Click on products to see multiple images
   - Check for variant selectors

3. **Check Specific Product:**
   - Visit: https://autobath.co/product/3 (Washing Glove)
   - Should see 3 images and 3 color variants

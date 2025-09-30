# Monica Opto Hub - Admin Panel

## Overview
This admin panel allows you to manage your luxury eyewear boutique website, including product management and visitor analytics.

## Accessing the Admin Panel

1. Open `admin.html` in your web browser
2. Login with the default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`

## Features

### 🔐 Authentication
- Secure login system
- Session management
- Logout functionality

### 📦 Product Management
- **Add Products:** Upload new eyewear products with details like:
  - Product name and brand
  - Price in ₹ (Indian Rupees)
  - Category (Sunglasses, Optical Frames, Contact Lenses)
  - Gender (Men, Women, Unisex)
  - Model code
  - Description
  - Product image URL
  - Featured product status

- **Edit Products:** Modify existing product information
- **Delete Products:** Remove products from your inventory
- **Search & Filter:** Find products by name, brand, or category
- **Featured Products:** Mark products as featured for homepage display

### 📊 Analytics Dashboard
- **Visitor Statistics:**
  - Total visitors
  - Unique visitors
  - Page views
  - Average session duration

- **Popular Pages:** See which pages get the most traffic
- **Visitor Timeline:** Track visitor activity over time
- **Device Statistics:** Mobile, desktop, and tablet usage
- **Time Period Filtering:** View data for last 7, 30, 90 days, or 1 year

### ⚙️ Settings
- **Admin Account:** Change username and password
- **Website Settings:** Update site title, description, contact information
- **Data Management:** Export/import data, clear all data

## How to Use

### Adding a New Product
1. Go to the **Products** section
2. Click **"Add New Product"**
3. Fill in the product details:
   - Enter product name (e.g., "Ray-Ban Aviator Classic")
   - Select brand from dropdown
   - Enter price in ₹
   - Choose category and gender
   - Add model code if available
   - Write a description
   - Add product image URL
   - Check "Featured Product" if it should be highlighted
4. Click **"Save Product"**

### Viewing Analytics
1. Go to the **Analytics** section
2. Select time period from dropdown
3. View visitor statistics and trends
4. Check popular pages and device usage

### Managing Settings
1. Go to the **Settings** section
2. Update admin credentials or website information
3. Use data management tools for backup/restore

## Data Storage

All data is stored locally in your browser's localStorage, including:
- Product inventory
- Visitor analytics
- Admin settings
- User sessions

## Security Notes

- Change the default admin password immediately
- The admin panel is accessible to anyone who knows the URL
- Consider adding server-side authentication for production use
- Data is stored locally and will be lost if browser data is cleared

## Browser Compatibility

The admin panel works on all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Can't Login
- Check username and password are correct
- Clear browser cache and try again
- Default credentials: admin / admin123

### Data Not Saving
- Check if localStorage is enabled in your browser
- Ensure you have sufficient storage space
- Try clearing browser data and starting fresh

### Analytics Not Showing
- Make sure `analytics.js` is loaded on your main website
- Check browser console for any JavaScript errors
- Analytics data is collected automatically when visitors browse your site

## Customization

### Adding New Brands
Edit the brand dropdown in `admin.html` to add new eyewear brands.

### Modifying Analytics
The analytics system tracks:
- Page views
- Button clicks
- Form submissions
- Scroll depth
- Time on page
- Session duration

You can extend this by modifying `js/analytics.js`.

### Styling
All admin panel styles are in `css/admin.css`. The design matches your main website's luxury aesthetic.

## Support

For technical support or feature requests, please contact your web developer.

---

**Note:** This is a client-side admin panel. For production use, consider implementing server-side authentication and database storage for better security and data persistence.

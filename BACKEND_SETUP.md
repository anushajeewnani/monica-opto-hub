# Monica Opto Hub Backend Setup Instructions

## Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following content:
```
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_PATH=./database.sqlite
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,file://
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start the Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

## API Endpoints

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/stats/summary` - Get product statistics

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/settings` - Get website settings
- `PUT /api/admin/settings` - Update website settings

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/stats/summary` - Get appointment statistics

### Analytics
- `POST /api/analytics/track` - Track visitor analytics
- `GET /api/analytics/visitors` - Get visitor data
- `GET /api/analytics/stats` - Get analytics statistics
- `GET /api/analytics/timeline` - Get visitor timeline
- `GET /api/analytics/pages` - Get page analytics

## Default Admin Credentials
- Username: `admin`
- Password: `admin123`

**Important**: Change these credentials in production!

## File Structure
```
backend/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── database/
│   └── init.js              # Database initialization
├── routes/
│   ├── products.js          # Product API routes
│   ├── admin.js             # Admin API routes
│   ├── appointments.js      # Appointment API routes
│   └── analytics.js         # Analytics API routes
└── uploads/                 # File upload directory
    └── products/            # Product images
```

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- File upload validation
- SQL injection protection

## Database Schema
The system uses SQLite with the following tables:
- `products` - Product information
- `appointments` - Customer appointments
- `admin_users` - Admin user accounts
- `website_settings` - Website configuration
- `analytics` - Visitor analytics data

## Development Notes
- The server runs on port 3001 by default
- Database file is created automatically on first run
- Upload directory is created automatically
- All API responses are in JSON format
- Error handling is implemented throughout

## Production Deployment
1. Set `NODE_ENV=production` in your environment
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Set up proper file storage (consider cloud storage)
5. Use a production database (PostgreSQL/MySQL)
6. Set up SSL/HTTPS
7. Configure proper logging and monitoring

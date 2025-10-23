// Load environment variables from .env file if it exists (for local development)
if (require('fs').existsSync('.env')) {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const { router: productRoutes } = require('./routes/products');
const orderRoutes = require('./routes/orders');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');
const servicePackageRoutes = require('./routes/servicePackages');
const customerRoutes = require('./routes/customers');
const reviewRoutes = require('./routes/reviews');
const productBundleRoutes = require('./routes/productBundles');
const paymentRoutes = require('./routes/payments');
// const migrateRoutes = require('./routes/migrate'); // Removed - file doesn't exist

// Import database
const { initDatabase } = require('./database/init');
const { verifyEmailTransport } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5001;

// Increase header size limit to handle large headers
// This helps prevent "Request Header Fields Too Large" errors
app.use((req, res, next) => {
  // Allow larger headers by setting appropriate limits
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Trust proxy for accurate IP detection (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:5001"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:5001"],
    },
  },
}));

// Rate limiting (temporarily disabled for testing)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://autobath.co',
  'https://www.autobath.co',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static serving for uploaded files with CORS
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));

// Serve static files from img directory
const imgDir = path.join(__dirname, 'img');
app.use('/img', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(imgDir));

// Simple local upload handling (single image)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  const absoluteUrl = `${req.protocol}://${req.get('host')}${publicUrl}`;
  res.json({ success: true, url: absoluteUrl, path: publicUrl });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-packages', servicePackageRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/product-bundles', productBundleRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/migrate', migrateRoutes); // Removed - route doesn't exist

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AUTOBATH API is running',
    timestamp: new Date().toISOString()
  });
});

// Root health check for platform probes (e.g., Render default /health)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AUTOBATH API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Email verification endpoint (available in all environments)
app.get('/api/_email/verify', async (req, res) => {
  try {
    const result = await verifyEmailTransport();
    res.json({ 
      success: result.ok, 
      ...result, 
      user: process.env.EMAIL_USER || '',
      hasCredentials: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
  } catch (e) {
    res.status(500).json({ 
      success: false, 
      error: e.message || String(e),
      hasCredentials: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
  }
});

// Email test endpoint
app.post('/api/_email/test', async (req, res) => {
  try {
    const { sendEmail } = require('./services/emailService');
    
    const result = await sendEmail({
      to: 'autobath36@gmail.com',
      subject: 'Test Email from AUTOBATH Backend',
      template: 'contact',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test email to verify email functionality.'
      }
    });
    
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hasCredentials: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
  }
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing - return the main index.html file for any non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // For all other routes, serve the React app
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
// Catch-all route for non-production environments only
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Initialize database and start server
console.log('🚀 Starting AUTOBATH Backend...');
console.log('📋 Environment variables check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PORT:', process.env.PORT || 'not set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
console.log('- EMAIL_USER:', process.env.EMAIL_USER || 'not set');

initDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
    app.listen(PORT, async () => {
      console.log(`🚗 AUTOBATH Backend running on port ${PORT}`);
      console.log(`📧 Email service configured for: autobath36@gmail.com`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
      // Attempt to verify email transport at startup in non-prod
      if (process.env.NODE_ENV !== 'production') {
        try {
          const result = await verifyEmailTransport();
          if (result.ok) {
            console.log('✅ Email transport verified');
          } else {
            console.warn('⚠️ Email transport verification failed:', result.message || result.reason);
          }
        } catch (err) {
          console.warn('⚠️ Email transport verification error:', err && err.message ? err.message : String(err));
        }
      }
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });

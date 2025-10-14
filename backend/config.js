// Backend Configuration
module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Email Configuration
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: process.env.EMAIL_PORT || 587,
    USER: process.env.EMAIL_USER || '',
    PASS: process.env.EMAIL_PASS || '',
    OAUTH: {
      ENABLED: process.env.EMAIL_OAUTH_ENABLED === 'true',
      CLIENT_ID: process.env.OAUTH_CLIENT_ID || '',
      CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET || '',
      REFRESH_TOKEN: process.env.OAUTH_REFRESH_TOKEN || '',
        }
  },
  
  // Database
  DB_PATH: process.env.DB_PATH || './database.sqlite',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Payment Configuration
  PAYMENT: {
    BILLPLZ: {
      API_KEY: process.env.BILLPLZ_API_KEY || '',
      COLLECTION_ID: process.env.BILLPLZ_COLLECTION_ID || '',
      SANDBOX: process.env.BILLPLZ_SANDBOX === 'true',
      CALLBACK_URL: process.env.BILLPLZ_CALLBACK_URL || '',
      REDIRECT_URL: process.env.BILLPLZ_REDIRECT_URL || ''
    },
    STRIPE: {
      SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
      PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
      WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || ''
    }
  }
};

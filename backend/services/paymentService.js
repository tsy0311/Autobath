const Stripe = require('stripe');
const crypto = require('crypto');
const axios = require('axios');
const QRCode = require('qrcode');

// Initialize Stripe from environment; never hardcode secrets
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? Stripe(stripeSecretKey) : null;

// Billplz Configuration (for Touch 'n Go eWallet)
const BILLPLZ_CONFIG = {
  API_KEY: process.env.BILLPLZ_API_KEY || '', // Get from Billplz dashboard
  COLLECTION_ID: process.env.BILLPLZ_COLLECTION_ID || '', // Your collection ID
  API_URL: process.env.BILLPLZ_SANDBOX === 'true' 
    ? 'https://www.billplz-sandbox.com/api/v3' 
    : 'https://www.billplz.com/api/v3',
  CALLBACK_URL: process.env.BILLPLZ_CALLBACK_URL || `${process.env.FRONTEND_URL}/api/payments/billplz/callback`,
  REDIRECT_URL: process.env.BILLPLZ_REDIRECT_URL || `${process.env.FRONTEND_URL}/payment/success`
};

class PaymentService {
  constructor() {
    this.supportedMethods = {
      CARD: 'card',
      TNG: 'tng',
      BANK_TRANSFER: 'bank_transfer',
      CASH: 'cash'
    };
  }

  /**
   * Create a payment intent for Stripe
   * @param {Object} paymentData - Payment information
   * @returns {Object} Payment intent response
   */
  async createPaymentIntent(paymentData) {
    try {
      if (!stripe) {
        throw new Error('Stripe secret not configured');
      }
      const { amount, currency = 'myr', metadata = {} } = paymentData;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          orderId: metadata.orderId || '',
          customerId: metadata.customerId || '',
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @returns {Object} Confirmation response
   */
  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        charges: paymentIntent.charges?.data || []
      };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create TNG eWallet payment request via Billplz
   * @param {Object} paymentData - Payment information
   * @returns {Object} TNG payment response
   */
  async createTNGPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;
      
      // Check if Billplz is configured
      if (!BILLPLZ_CONFIG.API_KEY || !BILLPLZ_CONFIG.COLLECTION_ID) {
        console.warn('⚠️ Billplz not configured - using test mode');
        return this.createTestTNGPayment(paymentData);
      }

      // Create bill via Billplz API
      const billData = {
        collection_id: BILLPLZ_CONFIG.COLLECTION_ID,
        email: customerInfo.email,
        name: customerInfo.name,
        amount: Math.round(amount * 100), // Convert to cents
        callback_url: BILLPLZ_CONFIG.CALLBACK_URL,
        redirect_url: BILLPLZ_CONFIG.REDIRECT_URL,
        description: `Order #${orderId} - AUTOBATH Payment`,
        reference_1_label: 'Order ID',
        reference_1: orderId,
        reference_2_label: 'Customer',
        reference_2: customerInfo.name
      };

      const response = await axios.post(
        `${BILLPLZ_CONFIG.API_URL}/bills`,
        billData,
        {
          auth: {
            username: BILLPLZ_CONFIG.API_KEY,
            password: ''
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.id) {
        const bill = response.data;
        
        // Generate QR code for the payment URL
        const qrCodeDataUrl = await QRCode.toDataURL(bill.url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1e3a8a',
            light: '#ffffff'
          }
        });

        return {
          success: true,
          payment: {
            paymentId: bill.id,
            amount: amount,
            currency: 'MYR',
            status: 'pending',
            orderId: orderId,
            customerInfo: customerInfo,
            redirectUrl: bill.url,
            qrCode: qrCodeDataUrl, // Base64 QR code image
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            billplzUrl: bill.url
          }
        };
      } else {
        throw new Error('Invalid response from Billplz');
      }
    } catch (error) {
      console.error('TNG payment creation failed:', error.response?.data || error.message);
      
      // Fallback to test mode if API fails
      if (error.response?.status === 401) {
        console.warn('⚠️ Billplz authentication failed - check API key');
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create payment'
      };
    }
  }

  /**
   * Create test TNG payment (for development)
   * @param {Object} paymentData - Payment information
   * @returns {Object} Test payment response
   */
  async createTestTNGPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;
      const tngPaymentId = this.generatePaymentId();
      
      // Generate a test QR code
      const testPaymentUrl = `https://autobath.com/test-payment/${tngPaymentId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(testPaymentUrl, {
        width: 300,
        margin: 2
      });

      return {
        success: true,
        payment: {
          paymentId: tngPaymentId,
          amount: amount,
          currency: 'MYR',
          status: 'pending',
          orderId: orderId,
          customerInfo: customerInfo,
          redirectUrl: testPaymentUrl,
          qrCode: qrCodeDataUrl,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          testMode: true
        }
      };
    } catch (error) {
      console.error('Test TNG payment creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify TNG payment status via Billplz
   * @param {string} paymentId - Billplz bill ID
   * @returns {Object} Payment status
   */
  async verifyTNGPayment(paymentId) {
    try {
      // Check if Billplz is configured
      if (!BILLPLZ_CONFIG.API_KEY) {
        // Test mode - simulate payment completion after 5 seconds
        const isCompleted = Math.random() > 0.7; // 30% chance of completion
        return {
          success: true,
          status: isCompleted ? 'completed' : 'pending',
          paymentId: paymentId,
          verifiedAt: new Date().toISOString(),
          testMode: true
        };
      }

      // Get bill status from Billplz
      const response = await axios.get(
        `${BILLPLZ_CONFIG.API_URL}/bills/${paymentId}`,
        {
          auth: {
            username: BILLPLZ_CONFIG.API_KEY,
            password: ''
          }
        }
      );

      if (response.data) {
        const bill = response.data;
        const status = bill.paid ? 'completed' : 'pending';
        
        return {
          success: true,
          status: status,
          paymentId: bill.id,
          verifiedAt: new Date().toISOString(),
          paidAt: bill.paid_at || null,
          amount: bill.amount / 100, // Convert from cents
          transactionId: bill.transaction_id || null
        };
      } else {
        throw new Error('Invalid response from Billplz');
      }
    } catch (error) {
      console.error('TNG payment verification failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to verify payment'
      };
    }
  }

  /**
   * Create bank transfer payment
   * @param {Object} paymentData - Payment information
   * @returns {Object} Bank transfer details
   */
  async createBankTransferPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;
      const referenceNumber = this.generateReferenceNumber();
      
      const bankTransfer = {
        referenceNumber: referenceNumber,
        amount: amount,
        currency: 'MYR',
        bankName: 'Maybank',
        accountNumber: '1234567890',
        accountName: 'AUTOBATH DETAILING & ACCESSORIES',
        orderId: orderId,
        customerInfo: customerInfo,
        instructions: `Please transfer RM ${amount.toFixed(2)} to the account above and include reference: ${referenceNumber}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      return {
        success: true,
        bankTransfer: bankTransfer
      };
    } catch (error) {
      console.error('Bank transfer creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process refund
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {number} amount - Refund amount (optional, defaults to full refund)
   * @returns {Object} Refund response
   */
  async processRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason
      };
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment methods
   * @returns {Array} Available payment methods
   */
  getPaymentMethods() {
    return [
      {
        id: this.supportedMethods.TNG,
        name: 'Touch \'n Go eWallet',
        description: 'Pay securely with TNG eWallet',
        icon: 'mobile',
        enabled: true
      }
    ];
  }

  /**
   * Generate unique payment ID
   * @returns {string} Payment ID
   */
  generatePaymentId() {
    return 'TNG_' + crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * Generate reference number
   * @returns {string} Reference number
   */
  generateReferenceNumber() {
    return 'AUTOBATH_' + Date.now().toString().slice(-8);
  }

  /**
   * Verify Billplz callback signature
   * @param {Object} callbackData - Callback data from Billplz
   * @param {string} signature - X-Signature header
   * @returns {boolean} Is signature valid
   */
  verifyBillplzSignature(callbackData, signature) {
    if (!BILLPLZ_CONFIG.API_KEY) {
      return true; // Skip verification in test mode
    }

    try {
      const crypto = require('crypto');
      const sourceString = `billplzamount${callbackData.amount}|billplzcollection_id${callbackData.collection_id}|billplzid${callbackData.id}|billplzpaid_at${callbackData.paid_at}|billplzpaid${callbackData.paid}|billplzstate${callbackData.state}`;
      
      const hash = crypto
        .createHmac('sha256', BILLPLZ_CONFIG.API_KEY)
        .update(sourceString)
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Handle Billplz webhook callback
   * @param {Object} callbackData - Callback data
   * @param {string} signature - X-Signature header
   * @returns {Object} Callback result
   */
  async handleBillplzCallback(callbackData, signature) {
    try {
      // Verify signature
      if (!this.verifyBillplzSignature(callbackData, signature)) {
        return {
          success: false,
          error: 'Invalid signature'
        };
      }

      // Extract payment details
      const paymentResult = {
        paymentId: callbackData.id,
        status: callbackData.paid === 'true' ? 'completed' : 'failed',
        amount: parseFloat(callbackData.amount) / 100,
        paidAt: callbackData.paid_at,
        transactionId: callbackData.transaction_id,
        orderId: callbackData.reference_1,
        customerName: callbackData.reference_2
      };

      return {
        success: true,
        payment: paymentResult
      };
    } catch (error) {
      console.error('Billplz callback handling failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate payment data
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} Validation result
   */
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid payment amount');
    }

    if (!paymentData.currency) {
      errors.push('Currency is required');
    }

    if (!paymentData.method) {
      errors.push('Payment method is required');
    }

    if (!Object.values(this.supportedMethods).includes(paymentData.method)) {
      errors.push('Unsupported payment method');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = new PaymentService();

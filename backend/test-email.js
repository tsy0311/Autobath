// Test email configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Testing Email Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,
  debug: true
});

// Verify connection
console.log('🔗 Testing connection...\n');
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email connection FAILED:');
    console.log(error);
    console.log('\n💡 Common fixes:');
    console.log('1. Make sure EMAIL_PASS has NO SPACES (should be 16 characters)');
    console.log('2. Verify 2FA is enabled on Gmail account');
    console.log('3. Generate a new App Password: https://myaccount.google.com/apppasswords');
    console.log('4. Make sure "Less secure app access" is not blocking (if old account)');
  } else {
    console.log('✅ Email server is ready to send messages!');
    console.log('✅ Connection successful!');
    
    // Try sending a test email
    console.log('\n📧 Sending test email...');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from AUTOBATH',
      text: 'This is a test email to verify the email configuration is working correctly.',
      html: '<p>This is a <strong>test email</strong> to verify the email configuration is working correctly.</p>'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Test email FAILED:', error);
      } else {
        console.log('✅ Test email SENT successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Check your inbox:', process.env.EMAIL_USER);
      }
      process.exit(error ? 1 : 0);
    });
  }
});


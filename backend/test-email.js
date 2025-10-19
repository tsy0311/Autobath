const nodemailer = require('nodemailer');

// Test email configuration
const testEmail = async () => {
  console.log('🔧 Testing email configuration...');
  
  // Check environment variables
  console.log('📧 Email Environment Variables:');
  console.log('- EMAIL_HOST:', process.env.EMAIL_HOST || 'not set');
  console.log('- EMAIL_PORT:', process.env.EMAIL_PORT || 'not set');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'set' : 'not set');
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'set' : 'not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured');
    console.log('Please set EMAIL_USER and EMAIL_PASS in Render dashboard');
    return;
  }
  
  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT || 587) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Verify connection
  try {
    console.log('🔍 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully');
    
    // Send test email
    console.log('📤 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'autobath36@gmail.com',
      subject: 'Test Email from AUTOBATH Backend',
      text: 'This is a test email to verify email functionality.',
      html: '<p>This is a test email to verify email functionality.</p>'
    });
    
    console.log('✅ Test email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('💡 Authentication failed. Please check:');
      console.log('1. EMAIL_USER is correct');
      console.log('2. EMAIL_PASS is a Gmail App Password (not regular password)');
      console.log('3. 2FA is enabled on Gmail account');
    }
  }
};

testEmail();

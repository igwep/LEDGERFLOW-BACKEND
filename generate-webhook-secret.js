// Generate secure webhook secret
const crypto = require('crypto');

function generateWebhookSecret() {
  // Generate 64-character hex string (32 bytes)
  const secret = crypto.randomBytes(32).toString('hex');
  
  console.log('🔑 Your Webhook Secret:');
  console.log('');
  console.log('WEBHOOK_SECRET=' + secret);
  console.log('');
  console.log('✅ Copy this and add to your environment variables');
  console.log('📝 Also add this same secret in your Paystack dashboard');
  console.log('');
  console.log('🔒 Keep this secret secure - never commit to git!');
  
  return secret;
}

// Generate and display
generateWebhookSecret();

// Alternative formats
console.log('\n📋 Alternative Formats:');
console.log('Base64:', crypto.randomBytes(32).toString('base64'));
console.log('UUID:', crypto.randomUUID());
console.log('Short (16 chars):', crypto.randomBytes(8).toString('hex'));

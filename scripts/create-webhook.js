#!/usr/bin/env node

/**
 * Create Stripe Webhook Endpoint for Production
 * 
 * This script creates a webhook endpoint in your Stripe account
 * for the production domain.
 */

const https = require('https');

// Get API key from environment or command line
const apiKey = process.env.STRIPE_SECRET_KEY || process.argv[2];

if (!apiKey) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found');
  console.error('\nUsage:');
  console.error('  node scripts/create-webhook.js [STRIPE_SECRET_KEY]');
  console.error('  or set STRIPE_SECRET_KEY environment variable');
  process.exit(1);
}

const webhookConfig = {
  url: 'https://platform.mapmycurriculum.com/api/stripe/webhook',
  enabled_events: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
  ],
  description: 'Production webhook for Map My Curriculum',
  api_version: '2023-10-16',
};

// Convert to form data
const formData = new URLSearchParams();
formData.append('url', webhookConfig.url);
webhookConfig.enabled_events.forEach(event => {
  formData.append('enabled_events[]', event);
});
formData.append('description', webhookConfig.description);
formData.append('api_version', webhookConfig.api_version);

const data = formData.toString();

const options = {
  hostname: 'api.stripe.com',
  port: 443,
  path: '/v1/webhook_endpoints',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(data),
  },
};

console.log('🔧 Creating Stripe webhook endpoint...\n');
console.log('URL:', webhookConfig.url);
console.log('Events:', webhookConfig.enabled_events.join(', '));
console.log('');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(responseData);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Webhook endpoint created successfully!\n');
      console.log('Webhook ID:', response.id);
      console.log('Webhook URL:', response.url);
      console.log('Status:', response.status);
      console.log('\n🔑 IMPORTANT: Save this webhook signing secret:\n');
      console.log(`   ${response.secret}`);
      console.log('\n📋 Next steps:');
      console.log('1. Copy the secret above (starts with whsec_)');
      console.log('2. Run: vercel env add STRIPE_WEBHOOK_SECRET production');
      console.log('3. Paste the secret when prompted');
      console.log('4. Redeploy: vercel --prod');
    } else {
      console.error('❌ Error creating webhook:', res.statusCode);
      console.error(JSON.stringify(response, null, 2));
      
      if (response.error && response.error.code === 'url_already_exists') {
        console.log('\n💡 Webhook already exists. Listing existing webhooks...\n');
        listWebhooks(apiKey);
      }
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e);
});

req.write(data);
req.end();

// Helper function to list existing webhooks
function listWebhooks(apiKey) {
  const options = {
    hostname: 'api.stripe.com',
    port: 443,
    path: '/v1/webhook_endpoints',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      if (response.data && response.data.length > 0) {
        console.log('Existing webhooks:');
        response.data.forEach((webhook, i) => {
          console.log(`\n${i + 1}. ${webhook.url}`);
          console.log(`   ID: ${webhook.id}`);
          console.log(`   Status: ${webhook.status}`);
          console.log(`   Events: ${webhook.enabled_events.length}`);
        });
        
        console.log('\n💡 To get the signing secret for an existing webhook:');
        console.log('   Go to: https://dashboard.stripe.com/webhooks');
        console.log('   Click on the webhook');
        console.log('   Click "Reveal" next to "Signing secret"');
      }
    });
  });
}

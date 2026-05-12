// test-whatsapp.js
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('Checking variables:');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅' : '❌');
console.log('OWNER_WHATSAPP_NUMBER:', process.env.OWNER_WHATSAPP_NUMBER);

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendTest() {
  try {
    const message = await client.messages.create({
      body: '🎉 Test from Twilio',
      from: process.env.TWILIO_FROM_NUMBER,
      to: process.env.OWNER_WHATSAPP_NUMBER,
    });
    console.log('✅ Success! Message SID:', message.sid);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

sendTest();
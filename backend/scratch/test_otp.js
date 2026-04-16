const axios = require('axios');

async function testOtpFlow(phone = '1234567890') {
  const BASE_URL = 'http://localhost:4000/api';
  
  try {
    console.log(`\n--- Testing OTP Flow for ${phone} ---`);
    
    // 1. Send OTP
    console.log('1. Requesting OTP...');
    const sendRes = await axios.post(`${BASE_URL}/auth/send-otp`, { phone });
    console.log('Send Result:', sendRes.data);
    
    if (!sendRes.data.success) {
      console.error('Failed to send OTP');
      return;
    }

    const otp = sendRes.data.otp;
    console.log(`Received OTP from response: ${otp}`);

    // 2. Verify OTP
    console.log('\n2. Verifying OTP...');
    const verifyRes = await axios.post(`${BASE_URL}/auth/verify-otp`, { phone, otp });
    console.log('Verify Result:', verifyRes.data);

    if (verifyRes.data.success) {
      console.log('\n✅ OTP Flow Working Perfectly!');
    } else {
      console.log('\n❌ OTP Verification Failed');
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure the backend server is running on port 4000');
    }
  }
}

// Run test
testOtpFlow('9039732315');

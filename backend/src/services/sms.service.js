const axios = require("axios");

/**
 * SMSIndiaHub Service
 * Documentation: https://www.smsindiahub.in/sms-api/
 */

async function sendSms(phone, message) {
  const apiKey = process.env.SMSINDIAHUB_API_KEY;
  const senderId = process.env.SMSINDIAHUB_SENDER_ID || "SMSHUB";

  if (!apiKey) {
    console.log("------------------------------------------");
    console.log(`[MOCK SMS] To: ${phone}`);
    console.log(`[MOCK SMS] Msg: ${message}`);
    console.log("------------------------------------------");
    return { success: true, message: "Mock SMS sent" };
  }

  try {
    const msisdn = phone.length === 10 ? `91${phone}` : phone;
    const url = `http://cloud.smsindiahub.in/vendorsms/pushsms.aspx?APIKey=${apiKey}&msisdn=${msisdn}&sid=${senderId}&msg=${encodeURIComponent(message)}&fl=0&gwid=2`;
    
    console.log("[SMS SERVICE] Sending to:", url);
    
    const response = await axios.get(url);
    console.log("[SMS SERVICE] Result:", response.data);
    
    return { 
      success: true, 
      response: response.data,
      debugUrl: url 
    };
  } catch (error) {
    console.error("[SMS SERVICE] Error:", error.message);
    return { success: false, error: error.message };
  }
}

async function sendOtpSms(phone, otp) {
  const message = `Welcome to the trans powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;
  return sendSms(phone, message);
}

module.exports = { sendSms, sendOtpSms };

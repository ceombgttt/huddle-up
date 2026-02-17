const TWILIO_ENABLED = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);

let twilioClient = null;

if (TWILIO_ENABLED) {
  try {
    const twilio = await import('twilio');
    twilioClient = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio SMS enabled');
  } catch (err) {
    console.log('Twilio package not installed - SMS disabled');
  }
} else {
  console.log('Twilio not configured - SMS notifications disabled. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to enable.');
}

export async function sendSMS(toPhoneNumber, message) {
  if (!TWILIO_ENABLED || !twilioClient) {
    console.log(`[SMS DISABLED] Would send to ${toPhoneNumber}: ${message}`);
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhoneNumber,
    });
    console.log(`[SMS] Sent to ${toPhoneNumber}`);
    return true;
  } catch (err) {
    console.error(`[SMS] Failed to send to ${toPhoneNumber}:`, err.message);
    return false;
  }
}

export { TWILIO_ENABLED };

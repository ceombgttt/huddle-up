import nodemailer from 'nodemailer';

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@huddleupusa.com';
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

let transporter = null;

if (EMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_FROM,
      pass: EMAIL_APP_PASSWORD,
    },
  });

  transporter.verify()
    .then(() => console.log('Email service connected successfully'))
    .catch((err) => console.error('Email service connection failed:', err.message));
} else {
  console.log('Email not configured - EMAIL_APP_PASSWORD not set');
}

export async function sendPasswordResetEmail(toEmail, code) {
  if (!transporter) {
    console.log(`[Email Disabled] Password reset code for ${toEmail}: ${code}`);
    return false;
  }

  const mailOptions = {
    from: `"Huddle Up" <${EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Your Huddle Up Password Reset Code',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0F1115; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1E90FF 0%, #FFD700 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px;">HUDDLE UP</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 13px;">Find Your Crew, Watch The Game.</p>
        </div>
        <div style="padding: 32px; background: #0F1115;">
          <h2 style="color: white; font-size: 20px; margin: 0 0 12px; font-weight: 700;">Password Reset</h2>
          <p style="color: #A0A4AB; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            You requested a password reset for your Huddle Up account. Use the code below to set your new password. This code expires in 10 minutes.
          </p>
          <div style="background: #151A22; border: 2px solid #1E90FF; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
            <div style="color: #1E90FF; font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">${code}</div>
          </div>
          <p style="color: #A0A4AB; font-size: 12px; line-height: 1.5; margin: 0;">
            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="padding: 16px 32px; background: #151A22; border-top: 1px solid #222A36; text-align: center;">
          <p style="color: #555; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Huddle Up USA. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Password reset code sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${toEmail}:`, error.message);
    return false;
  }
}

export async function sendWelcomeEmail(toEmail, userName) {
  if (!transporter) {
    console.log(`[Email Disabled] Welcome email for ${toEmail}`);
    return false;
  }

  const mailOptions = {
    from: `"Huddle Up" <${EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Welcome to Huddle Up!',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0F1115; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1E90FF 0%, #FFD700 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px;">HUDDLE UP</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 13px;">Find Your Crew, Watch The Game.</p>
        </div>
        <div style="padding: 32px; background: #0F1115;">
          <h2 style="color: white; font-size: 20px; margin: 0 0 12px; font-weight: 700;">Welcome, ${userName || 'Fan'}!</h2>
          <p style="color: #A0A4AB; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            You're officially part of the Huddle Up community. Here's how to get started:
          </p>
          <div style="margin: 0 0 24px;">
            <div style="margin-bottom: 16px;">
              <span style="background: #1E90FF; color: white; font-weight: 900; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; margin-right: 12px; font-size: 13px;">1</span>
              <strong style="color: white; font-size: 14px;">Set your favorite teams</strong>
              <div style="color: #A0A4AB; font-size: 12px; margin-left: 40px;">Get personalized game alerts and find fans like you</div>
            </div>
            <div style="margin-bottom: 16px;">
              <span style="background: #1E90FF; color: white; font-weight: 900; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; margin-right: 12px; font-size: 13px;">2</span>
              <strong style="color: white; font-size: 14px;">Find or create a watch party</strong>
              <div style="color: #A0A4AB; font-size: 12px; margin-left: 40px;">Join fans at local venues for game day</div>
            </div>
            <div>
              <span style="background: #1E90FF; color: white; font-weight: 900; width: 28px; height: 28px; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; margin-right: 12px; font-size: 13px;">3</span>
              <strong style="color: white; font-size: 14px;">Invite your crew</strong>
              <div style="color: #A0A4AB; font-size: 12px; margin-left: 40px;">Earn 100 points for every friend who joins</div>
            </div>
          </div>
          <p style="color: #FFD700; font-size: 13px; font-weight: 700; text-align: center; margin: 0;">
            As an early member, you're a Founding Member with exclusive perks!
          </p>
        </div>
        <div style="padding: 16px 32px; background: #151A22; border-top: 1px solid #222A36; text-align: center;">
          <p style="color: #555; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Huddle Up USA. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Welcome email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send welcome to ${toEmail}:`, error.message);
    return false;
  }
}

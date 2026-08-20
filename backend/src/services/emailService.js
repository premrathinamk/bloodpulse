const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const smtpEmail = (process.env.SMTP_EMAIL || 'premrathinamk@gmail.com').trim();
const rawPass = process.env.SMTP_PASSWORD || 'azth kavo wokr uinp';
const smtpPass = rawPass.trim().replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpEmail,
    pass: smtpPass
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});

/**
 * Send BloodPulse OTP Verification Email (Optimized for Primary Inbox Delivery)
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6 digit verification code
 * @param {string} recipientName - Name of the user
 */
async function sendOtpEmail(toEmail, otp, recipientName = 'User') {
  const cleanEmail = toEmail.trim().toLowerCase();
  const cleanName = recipientName.trim();

  const mailOptions = {
    from: `"BloodPulse" <${smtpEmail}>`,
    to: cleanEmail,
    replyTo: smtpEmail,
    subject: `Your BloodPulse verification code is ${otp}`,
    text: `Hi ${cleanName},\n\nYour BloodPulse verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.\n\nThanks,\nThe BloodPulse Team`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BloodPulse Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px; text-align: left;">
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">BloodPulse</span>
                    <span style="font-size: 12px; color: #94a3b8; margin-left: 8px; font-weight: 500;">Emergency Network</span>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px 24px; text-align: left;">
                    <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                      Verification Code
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #475569;">
                      Hi ${cleanName},<br>
                      Please use the verification code below to complete your sign in on BloodPulse:
                    </p>

                    <!-- Code Box -->
                    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">
                      <div style="font-size: 32px; font-weight: 800; color: #dc2626; letter-spacing: 6px; font-family: monospace;">
                        ${otp}
                      </div>
                      <div style="font-size: 12px; color: #991b1b; margin-top: 6px;">
                        Valid for 10 minutes
                      </div>
                    </div>

                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                      If you did not request this verification code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      © 2026 BloodPulse. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendOtpEmail
};

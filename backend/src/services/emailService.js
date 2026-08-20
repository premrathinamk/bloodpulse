const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const smtpEmail = process.env.SMTP_EMAIL || 'premrathinamk@gmail.com';
const smtpPass = process.env.SMTP_PASSWORD || 'azth kavo wokr uinp';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpEmail,
    pass: smtpPass
  }
});

/**
 * Send BloodPulse OTP Verification Email
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6 digit verification code
 * @param {string} recipientName - Optional name of the user
 */
async function sendOtpEmail(toEmail, otp, recipientName = 'Lifesaver') {
  const mailOptions = {
    from: `"BloodPulse EMERGENCY OPS" <${smtpEmail}>`,
    to: toEmail,
    subject: `🩸 ${otp} is your BloodPulse Verification Code`,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    },
    text: `Hello ${recipientName},\n\nYour BloodPulse Emergency Donor Network verification code is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share this OTP with anyone.\n\nStay Safe,\nBloodPulse Emergency Ops Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BloodPulse Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f9; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="520" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0B1120; padding: 28px 30px; text-align: left;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <div style="display: inline-block; vertical-align: middle;">
                            <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">BloodPulse</span>
                            <span style="background-color: #DC2626; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 7px; border-radius: 4px; text-transform: uppercase; margin-left: 6px; letter-spacing: 0.5px; vertical-align: middle;">EMERGENCY OPS</span>
                          </div>
                          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 500;">
                            Rapid Donor Response Network
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 30px 24px 30px; text-align: left;">
                    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                      Verify Your Email Address
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                      Hello <strong>${recipientName}</strong>,<br>
                      Thank you for joining the BloodPulse Rapid Donor Response Network. Please use the one-time verification code below to verify your account:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #fff1f2; border: 2px dashed #f43f5e; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                      <div style="font-size: 11px; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                        ONE-TIME VERIFICATION CODE
                      </div>
                      <div style="font-size: 36px; font-weight: 800; color: #be123c; letter-spacing: 8px; font-family: monospace;">
                        ${otp}
                      </div>
                      <div style="font-size: 12px; color: #9f1239; margin-top: 6px; font-weight: 500;">
                        ⏱️ Valid for 10 minutes
                      </div>
                    </div>

                    <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                      If you did not request this verification code, you can safely ignore this email. Someone may have entered your email by mistake.
                    </p>

                    <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                        🔒 <strong>Privacy-First Guarantee</strong>: Your contact details are securely encrypted and protected against spam.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      © 2026 BloodPulse Emergency Donor Network. All rights reserved.
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

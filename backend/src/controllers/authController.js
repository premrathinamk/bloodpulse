const crypto = require('crypto');
const db = require('../db');
const { sendOtpEmail } = require('../services/emailService');

const ADMIN_EMAILS = [
  'premrathinamk@gmail.com',
  'sathyan2007sara@gmail.com'
];

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// Secure password hashing using PBKDF2 (built-in Node.js crypto, zero external dependencies)
function hashPassword(password) {
  if (!password) return null;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Generate secure 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to user's email address
 */
exports.sendOtp = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Clear old unverified OTPs for this email and insert new OTP
    try {
      await db.execute({
        sql: 'DELETE FROM email_otps WHERE email = ? AND is_verified = 0',
        args: [normalizedEmail]
      });
    } catch (e) {
      // Ignore if delete fails
    }

    await db.execute({
      sql: `
        INSERT INTO email_otps (email, otp_code, expires_at, is_verified)
        VALUES (?, ?, ?, 0)
      `,
      args: [normalizedEmail, otp, expiresAt]
    });

    // Dispatch email via Gmail SMTP
    const displayName = fullName ? fullName.trim() : (isAdminEmail(normalizedEmail) ? 'Admin' : 'Lifesaver');
    await sendOtpEmail(normalizedEmail, otp, displayName);

    console.log(`✉️ OTP [${otp}] sent to ${normalizedEmail}`);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}. Check your inbox!`
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP email: ' + (error.message || 'Please check your email address.')
    });
  }
};

/**
 * Verify OTP entered by user and save hashed password
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, fullName, role, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Query active unverified OTP for this email
    const queryRes = await db.execute({
      sql: `
        SELECT * FROM email_otps 
        WHERE email = ? AND otp_code = ? AND is_verified = 0
        ORDER BY id DESC LIMIT 1
      `,
      args: [normalizedEmail, cleanOtp]
    });

    const otpRecord = queryRes.rows?.[0];

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.'
      });
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(otpRecord.expires_at);
    if (now > expiry) {
      return res.status(400).json({
        success: false,
        message: 'This verification code has expired. Please request a new OTP.'
      });
    }

    // Mark OTP as verified
    await db.execute({
      sql: 'UPDATE email_otps SET is_verified = 1 WHERE id = ?',
      args: [otpRecord.id]
    });

    // Determine role (Grant ADMIN if admin email)
    const userRole = isAdminEmail(normalizedEmail) ? 'ADMIN' : (role || 'DONOR').toUpperCase();

    // Hash the password if provided
    const hashedPassword = password ? hashPassword(password) : null;

    // Check if user exists in database
    const userQuery = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
      args: [normalizedEmail]
    });

    let user = userQuery.rows?.[0];

    if (!user) {
      // Create new verified user with hashed password
      const userFullName = fullName || normalizedEmail.split('@')[0];
      
      const insertUser = await db.execute({
        sql: `
          INSERT INTO users (email, full_name, role, password_hash, is_email_verified)
          VALUES (?, ?, ?, ?, 1)
        `,
        args: [normalizedEmail, userFullName, userRole, hashedPassword]
      });

      user = {
        id: insertUser.lastInsertRowid ? String(insertUser.lastInsertRowid) : '1',
        email: normalizedEmail,
        fullName: userFullName,
        role: userRole,
        isEmailVerified: true
      };
    } else {
      // Update existing user with new verified status and new password/role if provided
      if (hashedPassword) {
        await db.execute({
          sql: 'UPDATE users SET is_email_verified = 1, password_hash = ?, full_name = ?, role = ? WHERE id = ?',
          args: [hashedPassword, fullName || user.full_name, userRole, user.id]
        });
      } else {
        await db.execute({
          sql: 'UPDATE users SET is_email_verified = 1, role = ? WHERE id = ?',
          args: [userRole, user.id]
        });
      }

      user = {
        id: user.id,
        email: user.email,
        fullName: fullName || user.full_name,
        role: userRole,
        isEmailVerified: true
      };
    }

    res.json({
      success: true,
      message: 'Email verified and account activated successfully!',
      user
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal verification error'
    });
  }
};

/**
 * Sign In with Email & Password (Strict Password Matching)
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your email address and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
      args: [normalizedEmail]
    });

    let user = result.rows?.[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please Sign Up to verify and create your account.'
      });
    }

    // Check if user has a password set
    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        message: 'No password was set for this account. Please use Sign Up with OTP to set your password.'
      });
    }

    // Strictly verify entered password against stored hash
    const isPasswordValid = verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please enter the correct password used during Sign Up.'
      });
    }

    // Ensure role is updated to ADMIN if this is an admin email
    const finalRole = isAdminEmail(normalizedEmail) ? 'ADMIN' : (user.role || 'DONOR');
    if (finalRole === 'ADMIN' && user.role !== 'ADMIN') {
      await db.execute({
        sql: 'UPDATE users SET role = ? WHERE id = ?',
        args: ['ADMIN', user.id]
      });
    }

    res.json({
      success: true,
      message: 'Signed in successfully!',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: finalRole,
        isEmailVerified: user.is_email_verified === 1
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.ADMIN_EMAILS = ADMIN_EMAILS;

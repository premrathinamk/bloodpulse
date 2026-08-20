const db = require('../db');
const { ADMIN_EMAILS } = require('./authController');

function isUserAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// Medical blood compatibility matrix (who can donate to patient with blood group X)
const COMPATIBLE_DONORS_FOR_PATIENT = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Universal Donor
};

function calculateEligibility(lastDonationDate, totalDonations) {
  if (!lastDonationDate) {
    return {
      status: 'eligible',
      badgeText: 'Eligible now',
      lastDonationText: totalDonations === 0 ? 'First-time donor' : 'Ready'
    };
  }

  const now = new Date();
  const lastDate = new Date(lastDonationDate);
  const diffTime = Math.abs(now - lastDate);
  const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cooldownPeriod = 90; // Standard 90 days interval

  if (daysSince < cooldownPeriod) {
    const daysLeft = cooldownPeriod - daysSince;
    return {
      status: 'cooldown',
      badgeText: `Cooldown: ${daysLeft}d left`,
      daysLeft,
      daysSince,
      lastDonationText: `Last: ${daysSince}d ago`
    };
  } else {
    return {
      status: 'eligible',
      badgeText: 'Eligible now',
      daysSince,
      lastDonationText: totalDonations <= 1 ? 'First-time donor' : `Last: ${daysSince}d ago`
    };
  }
}

// Mask phone number for privacy: e.g. +91 98*** *****
function maskPhone(phone) {
  if (!phone) return '+91 98*** *****';
  const clean = phone.trim();
  if (clean.length > 6) {
    return clean.slice(0, 6) + '*** *****';
  }
  return '+91 98*** *****';
}

exports.getDonors = async (req, res) => {
  try {
    const { bloodGroup, locality, compatible } = req.query;

    let query = 'SELECT * FROM donors WHERE is_available = 1';
    const params = [];

    // Filter by Blood Group
    if (bloodGroup && bloodGroup !== 'Any Blood Group' && bloodGroup !== 'all') {
      const normalizedGroup = bloodGroup.trim().toUpperCase();
      if (compatible === 'true' || compatible === true) {
        const allowedGroups = COMPATIBLE_DONORS_FOR_PATIENT[normalizedGroup] || [normalizedGroup];
        const placeholders = allowedGroups.map(() => '?').join(',');
        query += ` AND blood_group IN (${placeholders})`;
        params.push(...allowedGroups);
      } else {
        query += ' AND blood_group = ?';
        params.push(normalizedGroup);
      }
    }

    // Filter by Locality / City / Area
    if (locality && locality.trim() !== '') {
      const searchTerm = `%${locality.trim().toLowerCase()}%`;
      query += ' AND (LOWER(city) LIKE ? OR LOWER(area) LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY is_verified DESC, id ASC';

    const result = await db.execute({ sql: query, args: params });
    const rows = result.rows || [];

    const donors = rows.map((donor) => {
      const eligibility = calculateEligibility(donor.last_donation_date, donor.total_donations);
      return {
        id: donor.id,
        fullName: donor.full_name,
        bloodGroup: donor.blood_group,
        city: donor.city,
        area: donor.area,
        email: donor.email,
        phone: donor.phone,
        age: donor.age,
        gender: donor.gender,
        maskedPhone: maskPhone(donor.phone),
        totalDonations: donor.total_donations,
        lastDonationDate: donor.last_donation_date,
        isVerified: donor.is_verified === 1,
        isAvailable: donor.is_available === 1,
        eligibilityStatus: eligibility.status,
        eligibilityBadge: eligibility.badgeText,
        lastDonationText: eligibility.lastDonationText
      };
    });

    res.json({
      success: true,
      count: donors.length,
      donors
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch the logged-in user's own donor profile
 */
exports.getMyDonorProfile = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query parameter is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await db.execute({
      sql: 'SELECT * FROM donors WHERE LOWER(email) = ? ORDER BY id DESC LIMIT 1',
      args: [normalizedEmail]
    });

    const donor = result.rows?.[0];
    if (!donor) {
      return res.json({ success: true, exists: false, donor: null });
    }

    const eligibility = calculateEligibility(donor.last_donation_date, donor.total_donations);

    res.json({
      success: true,
      exists: true,
      donor: {
        id: donor.id,
        fullName: donor.full_name,
        bloodGroup: donor.blood_group,
        city: donor.city,
        area: donor.area,
        phone: donor.phone,
        email: donor.email,
        age: donor.age,
        gender: donor.gender,
        totalDonations: donor.total_donations,
        lastDonationDate: donor.last_donation_date,
        isAvailable: donor.is_available === 1,
        isVerified: donor.is_verified === 1,
        eligibilityStatus: eligibility.status,
        eligibilityBadge: eligibility.badgeText
      }
    });
  } catch (error) {
    console.error('Error fetching my donor profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.registerDonor = async (req, res) => {
  try {
    const {
      fullName,
      bloodGroup,
      city,
      area,
      phone,
      email,
      age,
      gender,
      lastDonationDate,
      totalDonations
    } = req.body;

    if (!fullName || !bloodGroup || !city || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, blood group, city, and phone number are required.'
      });
    }

    const normalizedEmail = email ? email.trim().toLowerCase() : null;

    // Check if a donor profile already exists for this email
    if (normalizedEmail) {
      const existing = await db.execute({
        sql: 'SELECT id FROM donors WHERE LOWER(email) = ? LIMIT 1',
        args: [normalizedEmail]
      });

      if (existing.rows && existing.rows.length > 0) {
        const existingId = existing.rows[0].id;
        // Update existing donor profile
        await db.execute({
          sql: `
            UPDATE donors 
            SET full_name = ?, blood_group = ?, city = ?, area = ?, phone = ?, age = ?, gender = ?, total_donations = ?, last_donation_date = ?, is_available = 1
            WHERE id = ?
          `,
          args: [
            fullName.trim(),
            bloodGroup.trim().toUpperCase(),
            city.trim(),
            area ? area.trim() : city.trim(),
            phone.trim(),
            age ? parseInt(age, 10) : 25,
            gender || 'Other',
            totalDonations ? parseInt(totalDonations, 10) : 0,
            lastDonationDate || null,
            existingId
          ]
        });

        return res.json({
          success: true,
          message: 'Your donor profile has been updated successfully!',
          donorId: String(existingId)
        });
      }
    }

    const result = await db.execute({
      sql: `
        INSERT INTO donors (full_name, blood_group, city, area, phone, email, age, gender, total_donations, last_donation_date, is_available, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
      `,
      args: [
        fullName.trim(),
        bloodGroup.trim().toUpperCase(),
        city.trim(),
        area ? area.trim() : city.trim(),
        phone.trim(),
        normalizedEmail,
        age ? parseInt(age, 10) : 25,
        gender || 'Other',
        totalDonations ? parseInt(totalDonations, 10) : 0,
        lastDonationDate || null
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Donor registered successfully!',
      donorId: result.lastInsertRowid ? String(result.lastInsertRowid) : undefined
    });
  } catch (error) {
    console.error('Error registering donor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Edit / Update an existing donor profile (Owner or Admin only)
 */
exports.updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      bloodGroup,
      city,
      area,
      phone,
      email,
      age,
      gender,
      lastDonationDate,
      totalDonations,
      isAvailable,
      userEmail
    } = req.body;

    const donorRes = await db.execute({
      sql: 'SELECT * FROM donors WHERE id = ?',
      args: [id]
    });

    const donor = donorRes.rows?.[0];
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Check ownership or admin permissions
    const requester = userEmail || req.headers['x-user-email'];
    const isOwner = requester && donor.email && requester.trim().toLowerCase() === donor.email.trim().toLowerCase();
    const isAdmin = isUserAdmin(requester);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only edit your own donor profile.'
      });
    }

    await db.execute({
      sql: `
        UPDATE donors 
        SET full_name = ?, blood_group = ?, city = ?, area = ?, phone = ?, age = ?, gender = ?, total_donations = ?, last_donation_date = ?, is_available = ?
        WHERE id = ?
      `,
      args: [
        fullName ? fullName.trim() : donor.full_name,
        bloodGroup ? bloodGroup.trim().toUpperCase() : donor.blood_group,
        city ? city.trim() : donor.city,
        area ? area.trim() : donor.area,
        phone ? phone.trim() : donor.phone,
        age !== undefined ? parseInt(age, 10) : donor.age,
        gender || donor.gender,
        totalDonations !== undefined ? parseInt(totalDonations, 10) : donor.total_donations,
        lastDonationDate !== undefined ? lastDonationDate : donor.last_donation_date,
        isAvailable !== undefined ? (isAvailable ? 1 : 0) : donor.is_available,
        id
      ]
    });

    res.json({
      success: true,
      message: 'Donor profile updated successfully!'
    });
  } catch (error) {
    console.error('Error updating donor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a donor profile (Owner or Admin only)
 */
exports.deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.headers['x-user-email'] || req.body?.userEmail || req.query?.userEmail;

    const donorRes = await db.execute({
      sql: 'SELECT * FROM donors WHERE id = ?',
      args: [id]
    });

    const donor = donorRes.rows?.[0];
    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Check ownership or admin permissions
    const isOwner = requester && donor.email && requester.trim().toLowerCase() === donor.email.trim().toLowerCase();
    const isAdmin = isUserAdmin(requester);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only delete your own donor profile.'
      });
    }

    // Delete related contact requests
    await db.execute({
      sql: 'DELETE FROM contact_requests WHERE donor_id = ?',
      args: [id]
    });

    // Delete donor record
    await db.execute({
      sql: 'DELETE FROM donors WHERE id = ?',
      args: [id]
    });

    res.json({
      success: true,
      message: 'Donor profile deleted successfully!'
    });
  } catch (error) {
    console.error('Error deleting donor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestContact = async (req, res) => {
  try {
    const { donorId } = req.params;
    const { requesterName, requesterPhone, purpose } = req.body;

    const donorStmt = await db.execute({
      sql: 'SELECT id, full_name, phone, blood_group, city, area FROM donors WHERE id = ?',
      args: [donorId]
    });
    const donor = donorStmt.rows?.[0];

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }

    // Log the contact reveal request
    await db.execute({
      sql: `
        INSERT INTO contact_requests (donor_id, requester_name, requester_phone, purpose)
        VALUES (?, ?, ?, ?)
      `,
      args: [donorId, requesterName || 'Emergency Requester', requesterPhone || 'Direct', purpose || 'Emergency Blood Matching']
    });

    res.json({
      success: true,
      donor: {
        id: donor.id,
        fullName: donor.full_name,
        bloodGroup: donor.blood_group,
        city: donor.city,
        area: donor.area,
        phone: donor.phone // Unmasked phone for emergency caller
      }
    });
  } catch (error) {
    console.error('Error requesting contact:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

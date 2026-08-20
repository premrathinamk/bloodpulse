const db = require('../db');

const ADMIN_EMAILS = [
  'premrathinamk@gmail.com',
  'sathyan2007sara@gmail.com'
];

function isAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Middleware or helper to verify admin permissions
 */
function verifyAdminRequest(req, res) {
  const adminEmail = req.headers['x-admin-email'] || req.body?.adminEmail || req.query?.adminEmail;
  if (!adminEmail || !isAdmin(adminEmail)) {
    res.status(403).json({
      success: false,
      message: 'Access denied. You must be an authorized BloodPulse administrator.'
    });
    return false;
  }
  return true;
}

/**
 * Get all database records for the Admin Console
 */
exports.getAdminData = async (req, res) => {
  try {
    if (!verifyAdminRequest(req, res)) return;

    const [donorsRes, sosRes, requestsRes, contactsRes, usersRes] = await Promise.all([
      db.execute('SELECT * FROM donors ORDER BY id DESC'),
      db.execute('SELECT * FROM sos_alerts ORDER BY id DESC'),
      db.execute('SELECT * FROM blood_requests ORDER BY id DESC'),
      db.execute(`
        SELECT cr.*, d.full_name as donor_name, d.blood_group as donor_blood_group 
        FROM contact_requests cr 
        LEFT JOIN donors d ON cr.donor_id = d.id 
        ORDER BY cr.id DESC
      `),
      db.execute('SELECT id, email, full_name, role, is_email_verified, created_at FROM users ORDER BY id DESC')
    ]);

    res.json({
      success: true,
      data: {
        donors: donorsRes.rows || [],
        sosAlerts: sosRes.rows || [],
        bloodRequests: requestsRes.rows || [],
        contactLogs: contactsRes.rows || [],
        users: usersRes.rows || []
      }
    });
  } catch (error) {
    console.error('Admin fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a donor record
 */
exports.deleteDonor = async (req, res) => {
  try {
    if (!verifyAdminRequest(req, res)) return;
    const { id } = req.params;

    // Delete related contact requests first
    await db.execute({
      sql: 'DELETE FROM contact_requests WHERE donor_id = ?',
      args: [id]
    });

    // Delete donor
    const result = await db.execute({
      sql: 'DELETE FROM donors WHERE id = ?',
      args: [id]
    });

    res.json({
      success: true,
      message: `Donor record #${id} deleted permanently by admin.`
    });
  } catch (error) {
    console.error('Delete donor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete an SOS emergency alert
 */
exports.deleteSosAlert = async (req, res) => {
  try {
    if (!verifyAdminRequest(req, res)) return;
    const { id } = req.params;

    await db.execute({
      sql: 'DELETE FROM sos_alerts WHERE id = ?',
      args: [id]
    });

    res.json({
      success: true,
      message: `Emergency SOS Alert #${id} deleted permanently by admin.`
    });
  } catch (error) {
    console.error('Delete SOS error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a patient blood request
 */
exports.deleteBloodRequest = async (req, res) => {
  try {
    if (!verifyAdminRequest(req, res)) return;
    const { id } = req.params;

    await db.execute({
      sql: 'DELETE FROM blood_requests WHERE id = ?',
      args: [id]
    });

    res.json({
      success: true,
      message: `Blood Request #${id} deleted permanently by admin.`
    });
  } catch (error) {
    console.error('Delete blood request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.ADMIN_EMAILS = ADMIN_EMAILS;

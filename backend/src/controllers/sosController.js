const db = require('../db');

const ADMIN_EMAILS = [
  'premrathinamk@gmail.com',
  'sathyan2007sara@gmail.com'
];

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

exports.getSosAlerts = async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT * FROM sos_alerts 
      ORDER BY 
        CASE urgency
          WHEN 'CRITICAL' THEN 1
          WHEN 'IMMEDIATE' THEN 2
          ELSE 3
        END,
        created_at DESC
    `);
    const alerts = result.rows || [];

    res.json({
      success: true,
      count: alerts.length,
      alerts: alerts.map(a => ({
        id: a.id,
        patientName: a.patient_name,
        bloodGroup: a.blood_group,
        unitsNeeded: a.units_needed,
        hospitalName: a.hospital_name,
        city: a.city,
        area: a.area,
        contactPerson: a.contact_person,
        contactPhone: a.contact_phone,
        urgency: a.urgency,
        status: a.status,
        details: a.details,
        creatorEmail: a.creator_email || null,
        createdAt: a.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.broadcastSos = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      city,
      area,
      contactPerson,
      contactPhone,
      urgency,
      details,
      creatorEmail,
      userEmail
    } = req.body;

    if (!patientName || !bloodGroup || !hospitalName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, blood group, hospital name, and contact phone are required.'
      });
    }

    const cleanBloodGroup = bloodGroup.trim().toUpperCase();
    const cleanCity = city ? city.trim() : 'Chennai';
    const cleanArea = area ? area.trim() : '';
    const cleanCreatorEmail = (creatorEmail || userEmail || req.headers['x-user-email'] || '').trim().toLowerCase();

    const result = await db.execute({
      sql: `
        INSERT INTO sos_alerts (patient_name, blood_group, units_needed, hospital_name, city, area, contact_person, contact_phone, urgency, status, details, creator_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
      `,
      args: [
        patientName.trim(),
        cleanBloodGroup,
        unitsNeeded ? parseInt(unitsNeeded, 10) : 1,
        hospitalName.trim(),
        cleanCity,
        cleanArea,
        contactPerson ? contactPerson.trim() : 'Emergency Coordinator',
        contactPhone.trim(),
        urgency ? urgency.trim().toUpperCase() : 'CRITICAL',
        details ? details.trim() : '',
        cleanCreatorEmail || null
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Emergency SOS Broadcasted successfully!',
      alertId: result.lastInsertRowid ? String(result.lastInsertRowid) : undefined
    });
  } catch (error) {
    console.error('Error broadcasting SOS:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing SOS Alert (Strict Creator or Admin only)
 */
exports.updateSos = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      city,
      area,
      contactPerson,
      contactPhone,
      urgency,
      status,
      details,
      userEmail
    } = req.body;

    // Check if alert exists
    const alertQuery = await db.execute({
      sql: 'SELECT * FROM sos_alerts WHERE id = ? LIMIT 1',
      args: [id]
    });

    const alert = alertQuery.rows?.[0];
    if (!alert) {
      return res.status(404).json({ success: false, message: 'SOS Alert not found' });
    }

    const cleanUserEmail = (userEmail || req.headers['x-user-email'] || '').trim().toLowerCase();
    const isOwner = Boolean(
      cleanUserEmail && 
      alert.creator_email && 
      alert.creator_email.toLowerCase().trim() === cleanUserEmail
    );
    const isAdmin = isAdminEmail(cleanUserEmail);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only edit SOS alerts created by your account.'
      });
    }

    await db.execute({
      sql: `
        UPDATE sos_alerts
        SET patient_name = ?,
            blood_group = ?,
            units_needed = ?,
            hospital_name = ?,
            city = ?,
            area = ?,
            contact_person = ?,
            contact_phone = ?,
            urgency = ?,
            status = ?,
            details = ?
        WHERE id = ?
      `,
      args: [
        patientName ? patientName.trim() : alert.patient_name,
        bloodGroup ? bloodGroup.trim().toUpperCase() : alert.blood_group,
        unitsNeeded !== undefined ? parseInt(unitsNeeded, 10) : alert.units_needed,
        hospitalName ? hospitalName.trim() : alert.hospital_name,
        city ? city.trim() : alert.city,
        area !== undefined ? area.trim() : alert.area,
        contactPerson ? contactPerson.trim() : alert.contact_person,
        contactPhone ? contactPhone.trim() : alert.contact_phone,
        urgency ? urgency.trim().toUpperCase() : alert.urgency,
        status ? status.trim().toUpperCase() : alert.status,
        details !== undefined ? details.trim() : alert.details,
        id
      ]
    });

    res.json({
      success: true,
      message: 'SOS alert updated successfully!'
    });
  } catch (error) {
    console.error('Error updating SOS alert:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete an existing SOS Alert (Strict Creator or Admin only)
 */
exports.deleteSos = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.query.userEmail || req.body.userEmail || req.headers['x-user-email'];

    const alertQuery = await db.execute({
      sql: 'SELECT * FROM sos_alerts WHERE id = ? LIMIT 1',
      args: [id]
    });

    const alert = alertQuery.rows?.[0];
    if (!alert) {
      return res.status(404).json({ success: false, message: 'SOS alert not found' });
    }

    const cleanUserEmail = (userEmail || '').trim().toLowerCase();
    const isOwner = Boolean(
      cleanUserEmail && 
      alert.creator_email && 
      alert.creator_email.toLowerCase().trim() === cleanUserEmail
    );
    const isAdmin = isAdminEmail(cleanUserEmail);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only delete SOS alerts created by your account.'
      });
    }

    await db.execute({
      sql: 'DELETE FROM sos_alerts WHERE id = ?',
      args: [id]
    });

    res.json({
      success: true,
      message: 'SOS Alert deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting SOS alert:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const db = require('../db');

const ADMIN_EMAILS = [
  'premrathinamk@gmail.com',
  'sathyan2007sara@gmail.com'
];

function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

exports.getRequests = async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM blood_requests ORDER BY created_at DESC');
    const requests = result.rows || [];

    res.json({
      success: true,
      count: requests.length,
      requests: requests.map(r => ({
        id: r.id,
        patientName: r.patient_name,
        bloodGroup: r.blood_group,
        unitsNeeded: r.units_needed,
        hospitalName: r.hospital_name,
        city: r.city,
        area: r.area,
        requiredByDate: r.required_by_date,
        contactPhone: r.contact_phone,
        status: r.status,
        notes: r.notes,
        creatorEmail: r.creator_email || null,
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      city,
      area,
      requiredByDate,
      contactPhone,
      notes,
      creatorEmail,
      userEmail
    } = req.body;

    if (!patientName || !bloodGroup || !hospitalName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, blood group, hospital, and contact phone are required.'
      });
    }

    const cleanCreatorEmail = (creatorEmail || userEmail || req.headers['x-user-email'] || '').trim().toLowerCase();

    const result = await db.execute({
      sql: `
        INSERT INTO blood_requests (patient_name, blood_group, units_needed, hospital_name, city, area, required_by_date, contact_phone, status, notes, creator_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
      `,
      args: [
        patientName.trim(),
        bloodGroup.trim().toUpperCase(),
        unitsNeeded ? parseInt(unitsNeeded, 10) : 1,
        hospitalName.trim(),
        city ? city.trim() : 'Chennai',
        area ? area.trim() : '',
        requiredByDate || null,
        contactPhone.trim(),
        notes ? notes.trim() : '',
        cleanCreatorEmail || null
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Blood request registered successfully!',
      requestId: result.lastInsertRowid ? String(result.lastInsertRowid) : undefined
    });
  } catch (error) {
    console.error('Error creating blood request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an existing Blood Request (Strict Creator or Admin only)
 */
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      city,
      area,
      requiredByDate,
      contactPhone,
      status,
      notes,
      userEmail
    } = req.body;

    const requestQuery = await db.execute({
      sql: 'SELECT * FROM blood_requests WHERE id = ? LIMIT 1',
      args: [id]
    });

    const existing = requestQuery.rows?.[0];
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    const cleanUserEmail = (userEmail || req.headers['x-user-email'] || '').trim().toLowerCase();
    const isOwner = Boolean(
      cleanUserEmail && 
      existing.creator_email && 
      existing.creator_email.toLowerCase().trim() === cleanUserEmail
    );
    const isAdmin = isAdminEmail(cleanUserEmail);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only edit blood requests created by your account.'
      });
    }

    await db.execute({
      sql: `
        UPDATE blood_requests
        SET patient_name = ?,
            blood_group = ?,
            units_needed = ?,
            hospital_name = ?,
            city = ?,
            area = ?,
            required_by_date = ?,
            contact_phone = ?,
            status = ?,
            notes = ?
        WHERE id = ?
      `,
      args: [
        patientName ? patientName.trim() : existing.patient_name,
        bloodGroup ? bloodGroup.trim().toUpperCase() : existing.blood_group,
        unitsNeeded !== undefined ? parseInt(unitsNeeded, 10) : existing.units_needed,
        hospitalName ? hospitalName.trim() : existing.hospital_name,
        city ? city.trim() : existing.city,
        area !== undefined ? area.trim() : existing.area,
        requiredByDate !== undefined ? requiredByDate : existing.required_by_date,
        contactPhone ? contactPhone.trim() : existing.contact_phone,
        status ? status.trim().toUpperCase() : existing.status,
        notes !== undefined ? notes.trim() : existing.notes,
        id
      ]
    });

    res.json({
      success: true,
      message: 'Blood request updated successfully!'
    });
  } catch (error) {
    console.error('Error updating blood request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete an existing Blood Request (Strict Creator or Admin only)
 */
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.query.userEmail || req.body.userEmail || req.headers['x-user-email'];

    const requestQuery = await db.execute({
      sql: 'SELECT * FROM blood_requests WHERE id = ? LIMIT 1',
      args: [id]
    });

    const existing = requestQuery.rows?.[0];
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    const cleanUserEmail = (userEmail || '').trim().toLowerCase();
    const isOwner = Boolean(
      cleanUserEmail && 
      existing.creator_email && 
      existing.creator_email.toLowerCase().trim() === cleanUserEmail
    );
    const isAdmin = isAdminEmail(cleanUserEmail);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied. You can only delete blood requests created by your account.'
      });
    }

    await db.execute({
      sql: 'DELETE FROM blood_requests WHERE id = ?',
      args: [id]
    });

    res.json({
      success: true,
      message: 'Blood request deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting blood request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const db = require('../db');
const { sendSosBroadcastEmail } = require('../services/emailService');

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
      details
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

    const result = await db.execute({
      sql: `
        INSERT INTO sos_alerts (patient_name, blood_group, units_needed, hospital_name, city, area, contact_person, contact_phone, urgency, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
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
        details ? details.trim() : ''
      ]
    });

    // Query all registered users and donors who have provided their email
    let recipientEmails = [];
    try {
      const usersQuery = await db.execute(`SELECT DISTINCT email FROM users WHERE email IS NOT NULL AND email != ''`);
      const donorsQuery = await db.execute(`SELECT DISTINCT email FROM donors WHERE email IS NOT NULL AND email != ''`);
      
      const emailSet = new Set();
      (usersQuery.rows || []).forEach(r => {
        if (r.email && r.email.includes('@')) emailSet.add(r.email.trim().toLowerCase());
      });
      (donorsQuery.rows || []).forEach(r => {
        if (r.email && r.email.includes('@')) emailSet.add(r.email.trim().toLowerCase());
      });

      recipientEmails = Array.from(emailSet);
    } catch (queryErr) {
      console.warn('Could not query user emails for SOS broadcast:', queryErr);
    }

    // Trigger emergency broadcast emails to all registered members
    if (recipientEmails.length > 0) {
      sendSosBroadcastEmail(recipientEmails, {
        patientName: patientName.trim(),
        bloodGroup: cleanBloodGroup,
        unitsNeeded: unitsNeeded ? parseInt(unitsNeeded, 10) : 1,
        hospitalName: hospitalName.trim(),
        city: cleanCity,
        area: cleanArea,
        contactPerson: contactPerson ? contactPerson.trim() : 'Emergency Coordinator',
        contactPhone: contactPhone.trim(),
        urgency: urgency ? urgency.trim().toUpperCase() : 'CRITICAL',
        details: details ? details.trim() : ''
      }).catch(err => {
        console.error('Failed to send SOS broadcast emails:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: `Emergency SOS Broadcasted successfully! Alert emails dispatched to ${recipientEmails.length} registered user(s).`,
      alertId: result.lastInsertRowid ? String(result.lastInsertRowid) : undefined,
      notifiedCount: recipientEmails.length
    });
  } catch (error) {
    console.error('Error broadcasting SOS:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

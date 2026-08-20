const db = require('../db');

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

    const result = await db.execute({
      sql: `
        INSERT INTO sos_alerts (patient_name, blood_group, units_needed, hospital_name, city, area, contact_person, contact_phone, urgency, status, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
      `,
      args: [
        patientName.trim(),
        bloodGroup.trim().toUpperCase(),
        unitsNeeded ? parseInt(unitsNeeded, 10) : 1,
        hospitalName.trim(),
        city ? city.trim() : 'Chennai',
        area ? area.trim() : 'Central',
        contactPerson ? contactPerson.trim() : 'Emergency Coordinator',
        contactPhone.trim(),
        urgency ? urgency.trim().toUpperCase() : 'CRITICAL',
        details ? details.trim() : ''
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Emergency SOS Broadcasted successfully to compatible network donors!',
      alertId: result.lastInsertRowid ? String(result.lastInsertRowid) : undefined
    });
  } catch (error) {
    console.error('Error broadcasting SOS:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

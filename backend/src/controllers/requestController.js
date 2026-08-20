const db = require('../db');

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
      notes
    } = req.body;

    if (!patientName || !bloodGroup || !hospitalName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, blood group, hospital, and contact phone are required.'
      });
    }

    const result = await db.execute({
      sql: `
        INSERT INTO blood_requests (patient_name, blood_group, units_needed, hospital_name, city, area, required_by_date, contact_phone, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
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
        notes ? notes.trim() : ''
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

const db = require('../db');

exports.getStats = async (req, res) => {
  try {
    const donorsCountRes = await db.execute('SELECT COUNT(*) as count FROM donors WHERE is_available = 1');
    const activeDonors = donorsCountRes.rows?.[0]?.count ?? donorsCountRes.rows?.[0]?.[0] ?? 0;

    const activeSosRes = await db.execute("SELECT COUNT(*) as count FROM sos_alerts WHERE status = 'ACTIVE'");
    const activeSos = activeSosRes.rows?.[0]?.count ?? activeSosRes.rows?.[0]?.[0] ?? 0;

    const totalDonationsRes = await db.execute('SELECT SUM(total_donations) as total FROM donors');
    const totalDonations = totalDonationsRes.rows?.[0]?.total ?? totalDonationsRes.rows?.[0]?.[0] ?? 0;

    const pendingRequestsRes = await db.execute("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'PENDING'");
    const pendingRequests = pendingRequestsRes.rows?.[0]?.count ?? pendingRequestsRes.rows?.[0]?.[0] ?? 0;

    res.json({
      success: true,
      stats: {
        availableDonors: Number(activeDonors),
        activeSosAlerts: Number(activeSos),
        totalDonationsRecorded: Number(totalDonations) || 0,
        pendingRequests: Number(pendingRequests)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const donorController = require('./controllers/donorController');
const sosController = require('./controllers/sosController');
const requestController = require('./controllers/requestController');
const statsController = require('./controllers/statsController');
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
// 1. Stats
app.get('/api/stats', statsController.getStats);

// 2. Authentication & Email OTP Verification
app.post('/api/auth/send-otp', authController.sendOtp);
app.post('/api/auth/verify-otp', authController.verifyOtp);
app.post('/api/auth/login', authController.login);

// 3. Donors
app.get('/api/donors', donorController.getDonors);
app.get('/api/donors/me', donorController.getMyDonorProfile);
app.post('/api/donors', donorController.registerDonor);
app.put('/api/donors/:id', donorController.updateDonor);
app.delete('/api/donors/:id', donorController.deleteDonor);
app.post('/api/donors/:donorId/contact', donorController.requestContact);

// 4. Emergency SOS Broadcasts
app.get('/api/sos', sosController.getSosAlerts);
app.post('/api/sos', sosController.broadcastSos);

// 5. Blood Requests
app.get('/api/requests', requestController.getRequests);
app.post('/api/requests', requestController.createRequest);

// 6. Admin Console Endpoints (Protected by Admin Email Verification)
app.get('/api/admin/data', adminController.getAdminData);
app.delete('/api/admin/donors/:id', adminController.deleteDonor);
app.delete('/api/admin/sos/:id', adminController.deleteSosAlert);
app.delete('/api/admin/requests/:id', adminController.deleteBloodRequest);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root API info
app.get('/api', (req, res) => {
  res.json({ name: 'BloodPulse Emergency Ops API', status: 'operational' });
});

// Only listen when executed directly (not in Vercel serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🩸 BloodPulse Emergency API running at http://localhost:${PORT}`);
  });
}

module.exports = app;

# 🩸 BloodPulse EMERGENCY OPS - Rapid Donor Response Network

A full-stack emergency blood donation and rapid donor matching web application.

---

## 📁 Project Structure

```
bloodpulse new/
├── 📁 frontend/                # React (Vite) + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/        # Navbar, FilterBar, DonorCard, EmergencyBanner, Modals (SOS, Contact, Sign In)
│   │   ├── pages/             # FindDonorView, SosAlertsView, RequestsView, BecomeDonorView
│   │   ├── services/          # api.js client service
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── 📁 backend/                 # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/       # donorController, sosController, requestController, statsController
│   │   ├── db.js              # Database connection & auto-migration
│   │   └── server.js          # API Routes & Express App
│   └── package.json
│
├── 📁 database/                # Database Layer & Schema
│   ├── schema.sql             # SQL table definitions (donors, sos_alerts, blood_requests, contact_requests, users)
│   ├── seed.sql               # Seed data matching initial verified donors (Aizen, Priya, Arun, etc.)
│   ├── bloodpulse.db          # Active SQLite database file
│   └── README.md              # Instructions for swapping or uploading database information
│
├── start.bat                  # One-click Windows launcher for both backend & frontend
└── package.json               # Root scripts
```

---

## 🚀 How to Run the Web Application

### Option 1: Quick Launch (Windows)
Double-click `start.bat` in the root folder, or run:
```cmd
start.bat
```

### Option 2: Run via Terminal
1. **Start Backend** (Port 5000):
   ```bash
   cd backend
   npm start
   ```
2. **Start Frontend** (Port 5173):
   ```bash
   cd frontend
   npm run dev
   ```
3. Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🗄️ How to Upload / Connect Your Database Later

The database layer is isolated in `database/`:
- **Using Custom SQL Data**: You can edit or replace `database/schema.sql` and `database/seed.sql` with your own SQL schema and dump.
- **Connecting External DB (PostgreSQL / MySQL / Supabase / MongoDB)**: You can change the connection in `backend/src/db.js` with your connection string.

---

## ✨ Features Implemented
- **Find Compatible Donors**:
  - Medical blood compatibility matrix (e.g. O- universal donors, AB+ universal recipients).
  - Search by patient blood group and locality/area.
  - Eligibility badge with donation cooldown counter (`Cooldown: 72d left` vs `Eligible now`).
  - Privacy-first protected contact reveal (`+91 98*** *****` unmasking with audit logging).
- **Emergency SOS Broadcast**:
  - Critical blood emergency broadcast modal.
  - Real-time emergency feed in **🚨 SOS Alerts** tab with hospital contact numbers and patient urgency levels.
- **Patient Blood Requests**:
  - Browse planned surgery and dialysis blood requests or submit new ones.
- **Become a Donor**:
  - Direct donor registration flow adding new lifesavers instantly to the live network.

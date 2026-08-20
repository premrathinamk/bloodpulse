-- BloodPulse Emergency Ops Database Schema

-- 1. Donors Table
CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    blood_group TEXT NOT NULL, -- A+, A-, B+, B-, AB+, AB-, O+, O-
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    gender TEXT,
    total_donations INTEGER DEFAULT 0,
    last_donation_date DATE, -- YYYY-MM-DD
    is_available INTEGER DEFAULT 1, -- 1 = Yes, 0 = No
    is_verified INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Emergency SOS Alerts Table
CREATE TABLE IF NOT EXISTS sos_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    units_needed INTEGER NOT NULL DEFAULT 1,
    hospital_name TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    urgency TEXT DEFAULT 'CRITICAL', -- CRITICAL, IMMEDIATE, URGENT
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, FULFILLED, EXPIRED
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Blood Requests Table
CREATE TABLE IF NOT EXISTS blood_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    units_needed INTEGER NOT NULL DEFAULT 1,
    hospital_name TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT,
    required_by_date DATE,
    contact_phone TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, MATCHED, FULFILLED, CANCELLED
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Protected Contact Reveal Logs
CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    requester_name TEXT,
    requester_phone TEXT,
    purpose TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(id)
);

-- 5. Users / Auth Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'USER', -- ADMIN, HOSPITAL, DONOR, USER
    is_email_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Email OTP Verification Table
CREATE TABLE IF NOT EXISTS email_otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

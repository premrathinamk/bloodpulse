-- BloodPulse Seed Data (Matches UI snapshot)

INSERT INTO donors (full_name, blood_group, city, area, phone, email, age, gender, total_donations, last_donation_date, is_available, is_verified)
VALUES
('Aizen', 'O+', 'Chennai', 'Chennai Central', '+91 98765 43210', 'aizen@example.com', 26, 'Male', 1, date('now', '-18 days'), 1, 1),
('Priya Sundaram', 'O-', 'Chennai', 'T. Nagar', '+91 98401 23456', 'priya.s@example.com', 24, 'Female', 1, date('now', '-120 days'), 1, 1),
('Arun Kumar', 'O+', 'Chennai', 'Adyar', '+91 98840 98765', 'arun.k@example.com', 29, 'Male', 4, date('now', '-131 days'), 1, 1),
('Kavitha R', 'A+', 'Chennai', 'Anna Nagar', '+91 94441 55667', 'kavitha.r@example.com', 27, 'Female', 3, date('now', '-110 days'), 1, 1),
('Rajesh V', 'B+', 'Chennai', 'Velachery', '+91 97908 11223', 'rajesh.v@example.com', 31, 'Male', 2, date('now', '-95 days'), 1, 1),
('Sneha Menon', 'AB+', 'Chennai', 'Nungambakkam', '+91 98410 99887', 'sneha.m@example.com', 25, 'Female', 5, date('now', '-150 days'), 1, 1),
('Dinesh Karthik', 'A-', 'Chennai', 'Tambaram', '+91 91760 33445', 'dinesh.k@example.com', 28, 'Male', 2, date('now', '-105 days'), 1, 1),
('Meera Krishnan', 'B-', 'Chennai', 'Porur', '+91 98844 77889', 'meera.k@example.com', 23, 'Female', 1, date('now', '-140 days'), 1, 1),
('Vikramaditya', 'O-', 'Chennai', 'Guindy', '+91 99400 66554', 'vikram@example.com', 33, 'Male', 6, date('now', '-160 days'), 1, 1);

-- 1 Active Emergency SOS Alert (Matching the "SOS Alerts (1)" counter)
INSERT INTO sos_alerts (patient_name, blood_group, units_needed, hospital_name, city, area, contact_person, contact_phone, urgency, status, details)
VALUES
('Senthil Nathan', 'O+', 2, 'Apollo Hospitals (Greams Road)', 'Chennai', 'Thousand Lights', 'Dr. Ramesh (Emergency Dept)', '+91 98400 11223', 'CRITICAL', 'ACTIVE', 'Emergency cardiac surgery scheduled. Urgent O+ blood units needed immediately.');

-- Sample Blood Requests
INSERT INTO blood_requests (patient_name, blood_group, units_needed, hospital_name, city, area, required_by_date, contact_phone, status, notes)
VALUES
('Lakshmi Narayanan', 'B+', 1, 'MIOT International', 'Chennai', 'Manapakkam', date('now', '+2 days'), '+91 98412 34567', 'PENDING', 'Post-operative recovery blood transfusion requirement.'),
('Mohamed Faiz', 'A-', 2, 'Kauvery Hospital', 'Chennai', 'Alwarpet', date('now', '+1 days'), '+91 97911 22334', 'PENDING', 'Dialysis patient support.');

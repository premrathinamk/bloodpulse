# Database Documentation & Configuration

This directory contains the database files and definitions for the **BloodPulse Emergency Ops** platform.

## Files
- `schema.sql`: Complete DDL table schemas (`donors`, `sos_alerts`, `blood_requests`, `contact_requests`, `users`).
- `seed.sql`: Realistic pre-seeded data matching the 9 verified donors in Chennai and the active SOS alerts.
- `bloodpulse.db`: Auto-generated SQLite database file (created on server start).

## How to upload / swap your database later:
1. **Using Custom SQL Data**: You can place your custom `.sql` dumps in this directory or run them against `bloodpulse.db`.
2. **Connecting PostgreSQL / MySQL / Supabase**:
   In `backend/.env` (or `backend/src/db.js`), you can change the DB connector configuration to point to your cloud or local database connection string (e.g. `DATABASE_URL=postgres://...`).

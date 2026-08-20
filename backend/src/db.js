const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL || 'libsql://bloodpulse-prem-rathinam-tk0e5j.aws-ap-south-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODcxMjk4MTQsImlkIjoiMDFhMDE5M2MtYTEwMS03ZmE0LWFhODQtZDkzZGRmY2Y3MzBjIiwia2lkIjoiSzZjd0xSako5REptQUJxV2dNMVZReEx1dm9HdGpnd3NuZ21jLS0tY3hjUSIsInJpZCI6IjE1M2FiZTJmLTY5YmMtNGI4MS1iMmFlLWY5NWQzZTU2ZWQ4YSJ9.YRBCl6DWWuQgI6tC7GbwPxfwGz9ala6I-mov1qUkgq9_k-Gi28qOEuxD7uU5HqLP0Lhp-Gl1ioGt-2lHGtI8Dw';

const db = createClient({
  url,
  authToken
});

// Auto-initialize schema & seed data if needed (safe on Vercel)
async function initDatabase() {
  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await db.execute(statement);
      }
    }
  } catch (err) {
    // Non-blocking for serverless runtime
    console.log('Database already initialized or connection established.');
  }
}

initDatabase().catch(() => {});

module.exports = db;

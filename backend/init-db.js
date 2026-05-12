const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres'  // Connect to default database first
});

const queries = [
  // Create database if it doesn't exist
  `CREATE DATABASE ${process.env.DB_NAME || 'lead_management'};`,
];

const dbQueries = `
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('Call', 'WhatsApp', 'Field')),
  status VARCHAR(20) NOT NULL DEFAULT 'Interested' CHECK (status IN ('Interested', 'Not Interested', 'Converted')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO leads (name, phone, source, status, notes) VALUES
  ('Ravi Kumar', '+91-9876543210', 'Call', 'Interested', 'Interested in premium plan'),
  ('Priya Sharma', '+91-9123456789', 'WhatsApp', 'Converted', 'Signed up for 1 year'),
  ('Amit Singh', '+91-9988776655', 'Field', 'Not Interested', 'Budget constraints'),
  ('Neha Gupta', '+91-9871234567', 'WhatsApp', 'Interested', 'Follow up next week'),
  ('Suresh Patel', '+91-9345678901', 'Call', 'Converted', 'Enterprise customer')
ON CONFLICT (phone) DO NOTHING;
`;

async function initDatabase() {
  try {
    console.log('🔌 Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✅ Connected!');

    // Try to create database
    try {
      console.log('📁 Creating database...');
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'lead_management'}`);
      console.log('✅ Database created!');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('ℹ️  Database already exists');
      } else {
        throw err;
      }
    }

    await client.end();

    // Connect to the actual database
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'lead_management',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    });

    console.log('🔌 Connecting to lead_management database...');
    await dbClient.connect();
    console.log('✅ Connected to lead_management!');

    console.log('📋 Creating tables...');
    await dbClient.query(dbQueries);
    console.log('✅ Tables created/verified!');

    // Verify data
    const result = await dbClient.query('SELECT COUNT(*) as count FROM leads');
    console.log(`✅ Database initialized successfully! (${result.rows[0].count} leads in database)`);

    await dbClient.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
    console.error('Error code:', err.code);
    process.exit(1);
  }
}

initDatabase();

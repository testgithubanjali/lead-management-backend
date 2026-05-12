#!/usr/bin/env node

/**
 * Database Setup Guide for Lead Management Backend
 * 
 * This script helps you set up the PostgreSQL database.
 * Prerequisites: PostgreSQL must be installed and running
 */

const { exec } = require('child_process');
const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Lead Management Database Setup\n');
  console.log('Prerequisites:');
  console.log('1. PostgreSQL must be installed');
  console.log('2. PostgreSQL service must be running');
  console.log('3. Connection details should be in .env file\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };

  console.log('Using configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  User: ${config.user}`);
  console.log(`  Database: ${process.env.DB_NAME || 'lead_management'}\n`);

  // Step 1: Connect to default database
  console.log('📋 Step 1: Checking PostgreSQL connection...');
  const adminPool = new Pool({
    ...config,
    database: 'postgres'
  });

  try {
    const client = await adminPool.connect();
    const res = await client.query('SELECT version()');
    console.log('✅ Connected to PostgreSQL!');
    console.log('   Version:', res.rows[0].version.split(',')[0], '\n');
    client.release();
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL');
    console.error('   Error:', err.message);
    console.error('\n⚠️  Please ensure:');
    console.error('   1. PostgreSQL service is running');
    console.error('   2. The connection details are correct in .env file');
    console.error('   3. Firewall is not blocking port 5432\n');
    adminPool.end();
    process.exit(1);
  }

  // Step 2: Create database
  console.log('📁 Step 2: Creating database (if needed)...');
  try {
    await adminPool.query(
      `CREATE DATABASE ${process.env.DB_NAME || 'lead_management'}`
    );
    console.log('✅ Database created!\n');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('ℹ️  Database already exists\n');
    } else {
      console.error('❌ Error creating database:', err.message);
      adminPool.end();
      process.exit(1);
    }
  }

  await adminPool.end();

  // Step 3: Connect to the actual database and create tables
  console.log('📋 Step 3: Creating tables and indexes...');
  const dbPool = new Pool({
    ...config,
    database: process.env.DB_NAME || 'lead_management'
  });

  const sqlCommands = [
    `CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL UNIQUE,
      source VARCHAR(20) NOT NULL CHECK (source IN ('Call', 'WhatsApp', 'Field')),
      status VARCHAR(20) NOT NULL DEFAULT 'Interested' CHECK (status IN ('Interested', 'Not Interested', 'Converted')),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`,
    `CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source)`,
    `CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at)`,
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'`,
    `DROP TRIGGER IF EXISTS update_leads_updated_at ON leads`,
    `CREATE TRIGGER update_leads_updated_at
      BEFORE UPDATE ON leads
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()`,
  ];

  try {
    const client = await dbPool.connect();
    for (const sql of sqlCommands) {
      await client.query(sql);
    }
    console.log('✅ Tables and indexes created!\n');
    client.release();
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
    dbPool.end();
    process.exit(1);
  }

  // Step 4: Insert sample data
  console.log('📊 Step 4: Inserting sample data...');
  try {
    const client = await dbPool.connect();
    
    // Check if data already exists
    const countRes = await client.query('SELECT COUNT(*) FROM leads');
    if (countRes.rows[0].count > 0) {
      console.log(`ℹ️  Database already has ${countRes.rows[0].count} leads\n`);
      client.release();
    } else {
      const sampleData = [
        { name: 'Ravi Kumar', phone: '+91-9876543210', source: 'Call', status: 'Interested', notes: 'Interested in premium plan' },
        { name: 'Priya Sharma', phone: '+91-9123456789', source: 'WhatsApp', status: 'Converted', notes: 'Signed up for 1 year' },
        { name: 'Amit Singh', phone: '+91-9988776655', source: 'Field', status: 'Not Interested', notes: 'Budget constraints' },
        { name: 'Neha Gupta', phone: '+91-9871234567', source: 'WhatsApp', status: 'Interested', notes: 'Follow up next week' },
        { name: 'Suresh Patel', phone: '+91-9345678901', source: 'Call', status: 'Converted', notes: 'Enterprise customer' }
      ];

      for (const lead of sampleData) {
        await client.query(
          'INSERT INTO leads (name, phone, source, status, notes) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (phone) DO NOTHING',
          [lead.name, lead.phone, lead.source, lead.status, lead.notes]
        );
      }
      console.log(`✅ Inserted ${sampleData.length} sample leads!\n`);
      client.release();
    }
  } catch (err) {
    console.error('❌ Error inserting data:', err.message);
    dbPool.end();
    process.exit(1);
  }

  // Verify
  try {
    const client = await dbPool.connect();
    const res = await client.query(
      `SELECT COUNT(*) as count FROM leads;
       SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public'`
    );
    console.log('✅ Database Setup Complete!');
    console.log(`   Tables: ${res[1].rows[0].table_count}`);
    console.log(`   Leads: ${res[0].rows[0].count}`);
    client.release();
  } catch (err) {
    console.error('❌ Verification error:', err.message);
  }

  dbPool.end();
}

setupDatabase().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});

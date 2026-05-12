-- Lead Management System - Database Setup
-- Run this script to initialize your PostgreSQL database

-- Create database (run this separately if needed)
-- CREATE DATABASE lead_management;

-- Connect to the database and run the following:

-- Create leads table
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO leads (name, phone, source, status, notes) VALUES
  ('Ravi Kumar', '+91-9876543210', 'Call', 'Interested', 'Interested in premium plan'),
  ('Priya Sharma', '+91-9123456789', 'WhatsApp', 'Converted', 'Signed up for 1 year'),
  ('Amit Singh', '+91-9988776655', 'Field', 'Not Interested', 'Budget constraints'),
  ('Neha Gupta', '+91-9871234567', 'WhatsApp', 'Interested', 'Follow up next week'),
  ('Suresh Patel', '+91-9345678901', 'Call', 'Converted', 'Enterprise customer')
ON CONFLICT (phone) DO NOTHING;

-- Verify setup
SELECT 'Database setup complete! Total leads: ' || COUNT(*) as status FROM leads;

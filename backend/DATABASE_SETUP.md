# Database Setup Instructions

## Quick Start

**Prerequisites:**
1. PostgreSQL 12 or higher must be installed on your system
2. PostgreSQL service must be running
3. Node.js and npm must be installed

## Automatic Setup

Run this command in the backend directory:

```bash
npm run setup-db
```

This will:
- Connect to PostgreSQL
- Create the `lead_management` database (if it doesn't exist)
- Create the `leads` table with proper schema
- Create indexes for faster queries
- Insert sample data

## Manual Setup

If automatic setup fails, follow these steps:

### 1. Start PostgreSQL Service

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Find and start the PostgreSQL service
- Or use PostgreSQL's pgAdmin or Stack Builder

**Mac/Linux:**
```bash
# Mac
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql
```

### 2. Connect to PostgreSQL

```bash
# Test connection
npm run test-db
```

### 3. Create Database Manually

If automatic setup fails, use psql:

```bash
psql -U postgres -h localhost
```

Then run these commands:

```sql
CREATE DATABASE lead_management;
\c lead_management

CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('Call', 'WhatsApp', 'Field')),
  status VARCHAR(20) NOT NULL DEFAULT 'Interested' CHECK (status IN ('Interested', 'Not Interested', 'Converted')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at);

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO leads (name, phone, source, status, notes) VALUES
  ('Ravi Kumar', '+91-9876543210', 'Call', 'Interested', 'Interested in premium plan'),
  ('Priya Sharma', '+91-9123456789', 'WhatsApp', 'Converted', 'Signed up for 1 year'),
  ('Amit Singh', '+91-9988776655', 'Field', 'Not Interested', 'Budget constraints'),
  ('Neha Gupta', '+91-9871234567', 'WhatsApp', 'Interested', 'Follow up next week'),
  ('Suresh Patel', '+91-9345678901', 'Call', 'Converted', 'Enterprise customer');
```

## Environment Configuration

Make sure your `.env` file has the correct database settings:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lead_management
DB_USER=postgres
DB_PASSWORD=postgres
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running
- Check if port 5432 is not blocked by firewall
- Verify connection details in `.env`

### Authentication Failed
- Check if PostgreSQL username/password are correct
- Verify pg_hba.conf allows connections from localhost

### Database Already Exists
- This is fine! The setup script will skip creation and just verify tables exist

## Next Steps

Once the database is set up, you can:

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. The API will be available at `http://localhost:5000`

3. Check the [API documentation](./API.md) for available endpoints

# PostgreSQL Database Setup - Status Report

## Current Status: ⚠️ PostgreSQL Installation Issue Detected

### Problem
PostgreSQL is installed on your system but cannot start. The error code `-1073741515` (0xC0000135) indicates a missing system dependency, typically a **Visual C++ Runtime library**.

### What We've Done
✅ Located PostgreSQL installation at: `C:\Program Files\PostgreSQL\18`  
✅ Updated authentication configuration for local connections  
✅ Created database setup and test scripts  
✅ Verified Node.js PostgreSQL client (pg) is installed  

❌ PostgreSQL service cannot start due to missing dependency  
❌ Docker daemon is not running  

### Solution Options

#### Option 1: Fix Visual C++ Runtime (Recommended)
1. Download Visual C++ Redistributable from Microsoft:
   https://support.microsoft.com/en-us/help/2977003
   
2. Install the appropriate version for your system (likely "Visual C++ Redistributable 2015-2022")
   
3. Restart your computer
   
4. Try starting PostgreSQL again:
   ```bash
   npm run test-db
   npm run setup-db
   ```

#### Option 2: Reinstall PostgreSQL
1. Download the PostgreSQL installer from: https://www.postgresql.org/download/windows/
2. Uninstall the current version (Control Panel > Programs > Programs and Features)
3. Install a fresh copy, making sure to:
   - Choose the correct architecture (64-bit recommended)
   - Remember the postgres password you set
   - Ensure "Run as a Service" is checked

#### Option 3: Use Docker (if available)
1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Start Docker Desktop
3. Run this command in the backend directory:
   ```bash
   docker run --name lead-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lead_management -p 5432:5432 -d postgres:18
   ```
4. Then run: `npm run setup-db`

#### Option 4: Use a Cloud PostgreSQL Service
1. Create a free database at:
   - **Neon**: https://neon.tech/
   - **Railway**: https://railway.app/
   - **AWS RDS Free Tier**: https://aws.amazon.com/rds/

2. Update your `.env` file with the cloud database credentials

## How to Run Database Setup

Once PostgreSQL is running (using any option above), run:

```bash
# Test connection
npm run test-db

# Setup database (create tables, indexes, sample data)
npm run setup-db
```

## Available Commands

```bash
# Test PostgreSQL connection
npm run test-db

# Initialize database schema and sample data
npm run setup-db

# Start the development server (requires database)
npm run dev

# Start production server (requires database)
npm run start
```

## Environment Configuration (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lead_management
DB_USER=postgres
DB_PASSWORD=postgres

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Next Steps

1. Fix the PostgreSQL installation using one of the options above
2. Once PostgreSQL is running, run: `npm run setup-db`
3. Start your backend server: `npm run dev`
4. The API will be available at `http://localhost:5000`

## Need Help?

If you still can't get PostgreSQL running after trying Option 1 (Visual C++ Runtime), I recommend:
- Using **Option 2** (Fresh reinstall) for the most reliable setup
- Or **Option 3/4** (Docker or Cloud) for easier management

Feel free to ask if you need more specific instructions for any of these options!

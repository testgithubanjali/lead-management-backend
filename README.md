# 🎯 Lead Management System — Mini CRM

A full-stack Lead Management System built with **React**, **Node.js (Express)**, and **PostgreSQL**.

---

## 📁 Project Structure

```
lead-management/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js         # PostgreSQL connection (pg Pool)
│   │   │   └── init.sql      # Database schema + seed data
│   │   ├── controllers/
│   │   │   └── leadController.js   # All business logic
│   │   ├── middleware/
│   │   │   └── validate.js   # express-validator middleware
│   │   ├── routes/
│   │   │   └── leadRoutes.js # API route definitions
│   │   └── server.js         # Express app entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
│
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddLeadForm.js    # Form to add new leads
│   │   │   ├── LeadsList.js      # Table with search/filter
│   │   │   ├── Dashboard.js      # Stats & charts
│   │   │   └── DeleteModal.js    # Delete confirmation modal
│   │   ├── context/
│   │   │   └── LeadContext.js    # Global state (useReducer)
│   │   ├── utils/
│   │   │   └── api.js            # Axios API service
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css             # Full design system
│   └── package.json
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Context API, Axios      |
| Backend   | Node.js, Express 4, express-validator |
| Database  | PostgreSQL (via `pg` Pool)        |
| Styling   | Custom CSS (dark theme design system) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

---

### 1. Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE lead_management;

# Connect and run the init script
\c lead_management
\i backend/src/config/init.sql
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lead_management
DB_USER=postgres
DB_PASSWORD=your_password_here
FRONTEND_URL=http://localhost:3000
```

```bash
# Start backend (development)
npm run dev

# Start backend (production)
npm start
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in `package.json` handles API calls automatically in dev mode.

---

## 📋 API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/leads`              | Get all leads (+ filters) |
| GET    | `/api/leads/stats`        | Dashboard statistics     |
| GET    | `/api/leads/:id`          | Get single lead          |
| POST   | `/api/leads`              | Add new lead             |
| PATCH  | `/api/leads/:id/status`   | Update lead status       |
| PUT    | `/api/leads/:id`          | Update full lead         |
| DELETE | `/api/leads/:id`          | Delete lead              |

### Query Parameters (GET /api/leads)

| Param    | Values                              |
|----------|-------------------------------------|
| `search` | Name or phone substring             |
| `status` | `Interested`, `Not Interested`, `Converted` |
| `source` | `Call`, `WhatsApp`, `Field`         |
| `sort`   | `name`, `created_at`, `status`, etc.|
| `order`  | `ASC` or `DESC`                     |

### Example: Add Lead (POST /api/leads)

```json
{
  "name": "Ravi Kumar",
  "phone": "+91-9876543210",
  "source": "Call",
  "status": "Interested",
  "notes": "Interested in premium plan"
}
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE leads (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  phone      VARCHAR(20)   NOT NULL UNIQUE,
  source     VARCHAR(20)   NOT NULL CHECK (source IN ('Call', 'WhatsApp', 'Field')),
  status     VARCHAR(20)   NOT NULL DEFAULT 'Interested'
                           CHECK (status IN ('Interested', 'Not Interested', 'Converted')),
  notes      TEXT,
  created_at TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
);
```

Indexes on `status`, `source`, and `created_at` for fast filtering.
Auto-updating `updated_at` via PostgreSQL trigger.

---

## ✨ Features

### Core
- ✅ Add leads (Name, Phone, Source, Status, Notes)
- ✅ List all leads in a sortable table
- ✅ Update lead status inline (dropdown in table)
- ✅ Delete leads with confirmation modal
- ✅ Form validation (frontend + backend)

### Bonus
- ✅ Search by name or phone
- ✅ Filter by status and source
- ✅ Dashboard: total leads, converted, conversion rate
- ✅ Source breakdown bar chart
- ✅ This week / this month stats
- ✅ Duplicate phone detection

---

## 🛡️ Validation Rules

**Frontend:**
- Name: required, 2–100 chars
- Phone: required, valid format
- Source: required (Call / WhatsApp / Field)

**Backend (express-validator):**
- All of the above, server-side
- Status: must be one of the 3 valid values
- Notes: max 500 characters

---

## 🎨 UI Design

- Dark theme with blue accent color
- Responsive layout (mobile-friendly)
- Sticky add-lead form for quick entry
- Real-time search with debouncing
- Toast notifications for all actions
- Loading spinners and empty states

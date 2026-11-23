# Intelligent Market Price Discovery Platform – Craftsman Automation

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/Enterprise-Craftsman%20Automation-0052CC)]()

A centralized enterprise web application engineered for **Craftsman Automation** to automate industrial supplier product discovery, price collection, specification verification, and comparative analytics across **7 distinct supplier portals**.

Procurement engineers and buyers enter an item description or part number (e.g. `RL-123_Z462H1712106`, industrial induction motors, stainless steel sheets, CNC tool holders, hydraulic valves) and initiate parallel research across 7 supplier portals to retrieve real-time matching products, specifications, verified prices, and direct verification URLs.

---

## 1. Key Capabilities & System Features

- **7 Configurable Supplier Portals:**
  - **Portal 1:** IndiaMART Industrial (B2B Marketplace)
  - **Portal 2:** Moglix Industrial MRO
  - **Portal 3:** Industrybuying
  - **Portal 4:** RS Components (Industrial Automation & Electronics)
  - **Portal 5:** Misumi Precision (Mechanical Components)
  - **Portal 6:** Grainger Industrial Supply (MRO & US/Global sourcing)
  - **Portal 7:** Craftsman Direct OEM Portal (OEM Manufacturing & Direct Sourcing)
- **Minimum 5-Supplier Guarantee:** High-resilience asynchronous dispatch with adaptive timeouts guaranteeing minimum 5-supplier discovery whenever matching items exist.
- **AI Matching & Confidence Engine:** Weighted multi-factor matching (Part Code, Technical Specs, Brand, Description) classifying results into *Exact Match ($\ge 90\%$)*, *High Similarity ($70-89\%$)*, and *Partial Match ($50-69\%$)*.
- **Specification Conflict Detection:** Automatically differentiates critical manufacturing metrics (e.g., 5 HP single-phase vs 3-phase, SS 304 vs SS 316, 350 bar vs 200 bar).
- **Currency Normalization:** Converts foreign currencies (USD, EUR, GBP, JPY) to INR equivalents using configurable exchange rates.
- **Direct Supplier Verification Links:** Every item row includes a direct "Open Website" button opening the original product catalog page in a new tab.
- **Historical Price Trend Tracking:** Records timestamped price points across research runs, calculating price increase/decrease percentages and rendering time-series charts.
- **Executive Reports & Exports:** Downloadable styled Excel workbooks (`.xlsx` with lowest price highlights) and formal PDF reports (`.pdf`).
- **Role-Based Access Control (RBAC):** Admin (portal configuration, user management) and Procurement Buyer roles.
- **Enterprise UI/UX:** Bloomberg-inspired dark and light theme options, interactive Recharts price bars, and live step-by-step progress tracking.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Bootstrap 5 with custom Enterprise Industrial Procurement theme (Dark/Light modes)
- **Data Visualizations:** Recharts (Interactive bar charts, price spreads, historical trend lines)
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request interceptors

### Backend
- **Framework:** Python FastAPI (Asynchronous, High-Performance)
- **Server:** Uvicorn ASGI
- **Data Persistence:** SQLAlchemy 2.0 with PostgreSQL in production and automatic SQLite fallback for immediate local execution
- **Security:** Bcrypt password hashing, JWT (JSON Web Tokens), OAuth2 bearer authentication
- **Reporting Engine:** OpenPyXL (Excel `.xlsx`) and ReportLab (PDF)
- **Scraping & Integration:** Httpx (Async HTTP), BeautifulSoup4

---

## 3. Directory Structure

```text
TNPL/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, search, suppliers, comparison, reports, dashboard)
│   │   ├── connectors/      # 7 Independent Supplier Connectors implementing BaseSupplierConnector
│   │   ├── core/            # Config, Database, Security (Bcrypt/JWT)
│   │   ├── db/              # Migrations and database seed runner
│   │   ├── models/          # SQLAlchemy ORM models (10 normalized tables)
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   └── services/        # Orchestrator, Matching Engine, Currency, Report Generator
│   ├── .env.example         # Sample environment configurations
│   ├── main.py              # FastAPI application entry point
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, SearchForm, SearchProgress, ComparisonTable, PriceCharts
│   │   ├── context/         # AuthContext (JWT & roles), ThemeContext (Dark/Light)
│   │   ├── pages/           # Dashboard, Discovery, History, Comparison, Reports, Suppliers, Users, Settings, Login
│   │   ├── services/        # Axios API client
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Router configuration
│   │   └── index.css        # Enterprise procurement theme styles
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts       # Vite proxy to backend port 8000
└── docs/
    └── SYSTEM_ARCHITECTURE.md # System Architecture & Technical Specifications
```

---

## 4. Quick Start & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Step 1: Start the Backend Service

```bash
# Navigate to backend directory
cd backend

# (Optional) Activate a virtual environment
# python -m venv venv
# venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Start the FastAPI backend server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend server will automatically:
1. Initialize the database (`craftsman_price_discovery.db` or configured PostgreSQL).
2. Seed default users and 7 supplier portal connectors.
3. Seed baseline search records for test part `RL-123_Z462H1712106`.
4. Host interactive Swagger documentation at: `http://localhost:8000/docs`

---

### Step 2: Start the Frontend Application

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install node dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

The frontend will run at: **`http://localhost:5173`**

---

## 5. Default Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@craftsman.com` | `CraftsmanAdmin#2026` | Full access: Portal configuration, API keys, user management, price discovery |
| **Procurement Buyer** | `procurement@craftsman.com` | `Procurement#2026` | Price discovery, comparison matrix, search history, Excel/PDF exports |

*(1-click credential buttons are available on the login page for instant access)*

---

## 6. How to Use the Application

1. **Dashboard:** Displays overall procurement KPIs, connection reliability for all 7 portals, and recent search activity.
2. **Price Discovery (`/discovery`):**
   - Enter an item description (e.g. `Hydraulic Pressure Relief Valve 350 Bar`) or part number (`RL-123_Z462H1712106`).
   - Click **"Discover Market Prices Across 7 Portals"**.
   - Watch the **live 8-stage progress tracker** as the engine queries IndiaMART, Moglix, Industrybuying, RS Components, Misumi, Grainger, and Craftsman Direct OEM.
   - Inspect the comparison table: lowest price is highlighted with a green badge, and each row has an **"Open Website"** button opening the original supplier listing in a new browser tab.
3. **Price Comparison (`/comparison`):** Detailed side-by-side benchmarking matrix with supplier filtering and price sorting.
4. **Research Reports (`/reports`):** Download audit-ready **Excel (`.xlsx`)** workbooks or executive **PDF (`.pdf`)** reports.
5. **Supplier Portals (`/suppliers`):** Test live connection latency, enable/disable connectors, or edit endpoint paths.
6. **Price History:** View historical price fluctuations over time for tracked parts.

---

## 7. Sample Queries for Testing

- **Part 1:** `RL-123_Z462H1712106` (Hydraulic Pressure Relief Valve 350 Bar)
- **Part 2:** `1LE7501-1DB23-4AA4` (Siemens 5 HP 3-Phase Induction Motor 1440 RPM)
- **Part 3:** `SS-304-2MM-CR` (Stainless Steel Sheet 304 Grade 2mm)
- **Part 4:** `BT40-ER32-70` (CNC Tool Holder BT40 Collet Chuck)
- **Part 5:** `REX-4WE6D6X` (Rexroth Directional Control Valve)

---

## 8. License & Confidentiality

Proprietary procurement software developed for **Craftsman Automation**. All rights reserved.


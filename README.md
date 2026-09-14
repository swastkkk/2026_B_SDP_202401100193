# 🧘 PockIT — Intelligent Personal Expense & Budget Tracker

<div align="center">
  <img src="src/frontend/public/logo.png" alt="PockIT Zen Balance Logo" width="120" height="120" />
  <br />
  <strong>Financial Equilibrium for Students & Young Professionals</strong>
  <p>Software Development Project — <code>2026_B_SDP_202401100193</code></p>
</div>

---

## 📌 Project Overview
**PockIT** is a full-stack personal finance web application tailored for college students and young professionals. It empowers users to record daily income and expenses, organize spending into hierarchical parent-child categories, establish monthly budget limits with automated breach alert triggers, and track financial runways through an interactive **frosted glass neo-fintech dashboard**.

---

## ✨ Key Features

### 1. 🗂️ Multi-User Persona Isolation & Quick-Switch
* Support for multi-user authentication with isolated financial records, categories, and balances.
* Instant one-click persona switching (e.g., test personas *Swastik Gupta* vs *Priya Patel*) for rapid evaluation and grading.
* Seamless user registration and JWT-based session security with bcrypt password hashing.

### 2. 🌲 Hierarchical Category Architecture
* Two-tier category structure supporting parent categories (e.g., *Food*, *Transport*, *Academic*) and child subcategories (e.g., *Canteen*, *Metro*, *Stationery*, *Chai Tapri*).
* Scoped by transaction type (`EXPENSE` or `INCOME`).

### 3. 🎯 Budget Threshold Monitoring & Automated Alerts
* Set monthly spending caps globally or per specific category.
* Configurable alert trigger percentages (e.g., alert at 80% utilization).
* Automated status calculation: `SAFE`, `WARNING`, or `BREACHED`.
* Real-time bell notification badge and persistent warnings for active budget breaches.

### 4. 🧭 Daily Safe-to-Spend Advisor
* Algorithmic runway calculator calculating the user's **Safe Daily Allowance** based on days remaining in the billing cycle and unallocated savings.
* Dynamic pace status indicators: `SAFE` (Comfortable), `WARNING` (Conserve Cash), or `SURVIVAL` (Emergency).

### 5. ⚡ One-Tap Student Quick Spends
* One-click quick logging for routine campus expenses:
  * **Chai Tapri** (`₹15`)
  * **Canteen** (`₹80`)
  * **Metro Transit** (`₹40`)
  * **Auto Rickshaw** (`₹60`)
  * **Xerox & Printout** (`₹25`)
  * **Stationery** (`₹50`)

### 6. 💎 Modern Glass Finished UI & Curated Typography
* **Glassmorphic Aesthetic:** Multi-layered frosted acrylic cards (`backdrop-filter: blur(24px)`), ambient subsurface aurora lighting mesh, and glowing interactive hover states.
* **Typography:** **Outfit** for display headings, **Plus Jakarta Sans** for body text, and **JetBrains Mono** with tabular numerals for financial currency alignment.
* **Data Visualization:** Interactive Recharts charts for **Category Expense Breakdown** and **6-Month Financial Trend** (Income vs Expenses).

### 7. 📄 Export & Reporting
* Instant RFC-4180 compliant CSV statement exporter for offline spreadsheet auditing and financial reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | React 18, Vite 6, TypeScript 5, Tailwind CSS 3.4, Recharts, Lucide React |
| **Styling & Theme** | Custom Glassmorphism System, Aurora Ambient Glow, Outfit & Plus Jakarta Sans |
| **Backend API** | Node.js, Express 4, TypeScript 5, Zod Schema Validation |
| **Database & ORM** | SQLite, Prisma ORM 6 |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Testing & Quality** | Node.js Native Test Runner (`node --test`), 9 Automated Endpoint Tests |

---

## 👥 SDP Team Roles & Architecture Division

| Member | Module / Responsibility | Core Deliverables |
| :--- | :--- | :--- |
| **Student 1** | **Backend & Architecture** | REST API routing, Prisma database models, SQLite setup, JWT auth, and hierarchical category tree engine. |
| **Student 2** | **Engine & Logic** | Budget threshold monitoring, automated breach alert calculation, and Student Safe-to-Spend runway algorithms. |
| **Student 3** | **Frontend & Reporting** | Modern glass dashboard UI, Recharts analytics, quick-spend shortcuts, transactions ledger, and CSV exporter. |

---

## 📂 Project Structure

```text
personal-expense-tracker/
├── docs/
│   ├── SRS.md                    # Software Requirements Specification
│   └── VIVA_PREP.md              # Viva presentation & technical Q&A guide
├── prisma/
│   ├── dev.db                    # Pre-seeded SQLite database
│   ├── schema.prisma             # Database schema (User, Category, Transaction, Budget)
│   └── seed.ts                   # Persona seed data (Swastik & Priya)
├── src/
│   ├── backend/                  # Express & TypeScript Backend
│   │   ├── src/
│   │   │   ├── middleware/       # Auth & validation middlewares
│   │   │   ├── routes/           # Auth, Categories, Transactions, Budgets, Analytics, Export
│   │   │   └── server.ts         # Server entry point (Port 5000)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/                 # React & Vite Frontend
│       ├── public/
│       │   └── logo.png          # Zen balance cairn logo
│       ├── src/
│       │   ├── components/       # Layout, Auth, Transactions, Budgets, Common modals
│       │   ├── context/          # AuthContext & state provider
│       │   ├── services/         # API client & fetch interceptors
│       │   ├── views/            # DashboardView, TransactionsView, BudgetsView, CategoriesView, ReportsView
│       │   ├── App.tsx           # Application shell & layout
│       │   ├── index.css         # Modern frosted glass styling tokens
│       │   └── main.tsx          # React root mount
│       ├── tailwind.config.js    # Custom fonts & glass shadow tokens
│       └── vite.config.ts        # Vite configuration & /api proxy to backend
├── test/
│   └── verify_endpoints.js       # 9-step automated API verification test suite
├── package.json                  # Root runner scripts (concurrent dev, setup, test)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** v18.0.0 or higher
* **npm** v9.0.0 or higher

### 1. One-Step Setup
Clone the repository and install all dependencies (backend, frontend, and seed database):
```bash
cd personal-expense-tracker
npm run setup
```
*(This installs root, backend, and frontend dependencies, runs Prisma migrations, and seeds student accounts.)*

### 2. Start Development Servers
Run both backend and frontend concurrently with live reloading:
```bash
npm run dev
```

* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** [http://localhost:5000](http://localhost:5000)
* **API Health Status:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Run Automated Tests
Execute the automated test suite verifying all 9 core API specifications:
```bash
npm test
```

Expected test output:
```text
✔ 1. Health check endpoint returns status OK
✔ 2. Multi-user authentication & user personas exist
✔ 3. Login endpoint returns valid JWT token and user profile
✔ 4. Data isolation: User 1 vs User 2 have independent balances
✔ 5. Category endpoint returns hierarchical tree scoped to active user
✔ 6. Budget threshold monitoring calculates spent, remaining, and alert statuses
✔ 7. Analytics summary computes student Safe-to-Spend runway
✔ 8. Transaction lifecycle: create, verify, and delete for active user
✔ 9. CSV Export returns valid text/csv format
ℹ pass 9
ℹ fail 0
```

### 4. Build for Production
```bash
npm run build
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning server status |
| `POST` | `/api/auth/login` | User login returning JWT auth token |
| `POST` | `/api/auth/register` | Register new student profile with default categories |
| `GET` | `/api/auth/users` | List available student personas |
| `POST` | `/api/auth/switch` | Switch active user profile |
| `GET` | `/api/categories` | Retrieve flat or hierarchical (`?tree=true`) category tree |
| `POST` | `/api/categories` | Create custom parent or child category |
| `DELETE`| `/api/categories/:id` | Remove category (with cascade safeguards) |
| `GET` | `/api/transactions` | Search, filter, and paginate user ledger |
| `POST` | `/api/transactions` | Log new expense or income |
| `PUT` | `/api/transactions/:id`| Update transaction |
| `DELETE`| `/api/transactions/:id`| Delete transaction |
| `GET` | `/api/budgets` | Fetch monthly category budget limits and spent totals |
| `POST` | `/api/budgets` | Upsert monthly budget limit and threshold alert % |
| `GET` | `/api/budgets/alerts` | Get real-time list of breached or warning budget alerts |
| `GET` | `/api/analytics/summary` | Retrieve KPI totals and Student Advisor Safe-to-Spend data |
| `GET` | `/api/analytics/category-breakdown` | Category-wise spending distribution |
| `GET` | `/api/analytics/monthly-trend` | 6-month historical income vs expense trends |
| `GET` | `/api/export/csv` | Download RFC-compliant CSV statement |

---

## 📜 Academic Integrity & Attribution
This software has been developed as an academic project submission for **Software Development Project (2026_B_SDP_202401100193)**.
* **License:** MIT License
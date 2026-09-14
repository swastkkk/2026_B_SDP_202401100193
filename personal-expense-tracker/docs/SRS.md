# Software Requirements Specification (SRS)
## Personal Expense & Budget Tracker (CampusSpend)
**Course:** Software Development Project (SDP)  
**Project ID:** `2026_B_SDP_202401100193`  
**Target Domain:** Student Personal Finance Management  

---

### 1. Introduction

#### 1.1 Purpose
This document specifies the software requirements for **CampusSpend**, a full-stack web application developed to empower college students in tracking day-to-day expenditures, organizing spending into hierarchical categories, configuring category and global monthly spending limits, receiving automated threshold breach alerts, and visualizing financial cash flow.

#### 1.2 Scope of the System
* Record income (allowances, stipends, freelance earnings) and expenses (mess, canteen, books, metro, rent, entertainment).
* Support parent-child category trees (e.g. *Food & Canteen* ➔ *Canteen & Mess*, *Chai & Coffee*).
* Real-time calculation of remaining monthly budget and student daily safe-to-spend allowance.
* Automated budget breach detection (Safe `< 80%`, Warning `80-100%`, Breached `> 100%`).
* Interactive analytics charts (Cashflow trends, category spending distribution) and CSV report generation.

---

### 2. Team Member Module Allocation

| Student | Assigned Role | Modules & Responsibilities |
| :--- | :--- | :--- |
| **Student 1** | **Backend Architecture & Category Hierarchy** | Database schema design (Prisma ORM, SQLite), RESTful API routes, Category tree management, Transaction CRUD operations, Data integrity constraints. |
| **Student 2** | **Budget Engine & Alert Logic** | Monthly budget calculation engine, Threshold warning triggers, Real-time breach detection, In-app notification alert center. |
| **Student 3** | **Frontend UI, Analytics & Reporting** | Responsive React/Vite dashboard, Recharts visualization components, Student Safe-to-Spend calculator, Filterable transaction table, CSV report export. |

---

### 3. System Architecture & Tech Stack

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
* **Backend:** Node.js, Express.js, TypeScript, Zod Schema Validation, Prisma ORM.
* **Database:** SQLite (embedded local relational database, zero-configuration setup).
* **Architecture Pattern:** Model-View-Controller (MVC) API layer with decoupled Single-Page Application (SPA) client communicating over RESTful JSON endpoints.

---

### 4. Functional Requirements

#### FR-1: Transaction Management
* **FR-1.1:** The user shall record expenses and incomes with amount, type, payment method (UPI, Cash, Card, Net Banking), category, date, and optional description notes.
* **FR-1.2:** The system shall support one-tap quick-add shortcuts for frequent student expenses (e.g., Canteen, Chai, Auto, Xerox).
* **FR-1.3:** The user shall search transactions by keyword and filter by transaction type, category, and payment method.
* **FR-1.4:** The user shall edit or delete existing transaction records.

#### FR-2: Hierarchical Category Management
* **FR-2.1:** The system shall support parent categories and subcategories.
* **FR-2.2:** Deleting a parent category shall cascade to its subcategories or prevent orphaned transactions.
* **FR-2.3:** Each category shall have a custom accent color and icon for visual charts.

#### FR-3: Budget & Automated Alert Engine
* **FR-3.1:** The user shall define global monthly budgets and category-specific spending caps.
* **FR-3.2:** The system shall calculate real-time spending percentage as transactions are recorded.
* **FR-3.3:** The system shall classify budget health into three discrete states:
  * **SAFE:** Spending `< threshold%` (default `< 80%`).
  * **WARNING:** Spending `≥ threshold%` and `< 100%`.
  * **BREACHED:** Spending `≥ 100%`.
* **FR-3.4:** The system shall display active threshold notifications in the top navigation bell dropdown.

#### FR-4: Analytics & Reporting
* **FR-4.1:** The system shall compute a **Safe-to-Spend Daily Allowance**:
  $$\text{Daily Allowance} = \frac{\text{Remaining Monthly Budget}}{\text{Days Remaining in Month}}$$
* **FR-4.2:** The system shall display comparative cash flow bar charts (Income vs. Expense) and category donut charts.
* **FR-4.3:** The system shall generate downloadable CSV spreadsheets for financial auditing.

---

### 5. Non-Functional Requirements
* **Usability:** High-contrast dark-mode interface with responsive layout for both mobile and desktop screens.
* **Portability:** Embedded SQLite storage enables immediate startup on any host machine running Node.js without database server installation.
* **Type Safety:** End-to-end TypeScript types prevent runtime type errors.
* **Performance:** Sub-100ms API response times on local queries.

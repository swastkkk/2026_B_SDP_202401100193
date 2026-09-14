# Project Defense & Viva Preparation Guide
## CampusSpend - Personal Expense & Budget Tracker
**Target Project:** `2026_B_SDP_202401100193`  

This guide provides answers to common technical questions asked by evaluators and professors during SDP vivas.

---

### General Architecture Questions (For Entire Team)

#### Q1: Why choose React + Vite + Express + SQLite instead of traditional vanilla HTML/CSS?
* **Answer:**  
  * **Vite + React:** Provides modular, component-driven UI architecture, instant hot-reloading, and responsive reactive re-rendering (e.g. updating metric cards instantly when a transaction is logged).
  * **TypeScript:** Eliminates runtime `undefined` errors by enforcing strict compile-time types across data models.
  * **Prisma ORM + SQLite:** Eliminates server configuration hurdles (zero credential or Docker setup for evaluators). SQLite stores the relational data in an embedded `dev.db` file, while Prisma makes it trivial to switch to PostgreSQL for production by simply altering the datasource URL.

#### Q2: What software development lifecycle model (SDLC) was followed?
* **Answer:**  
  * We followed an **Agile/Iterative development model**:
    1. Iteration 1: Data modeling, SQLite schema, and REST API foundation.
    2. Iteration 2: Core calculation engine (budget thresholds & spending aggregations).
    3. Iteration 3: Frontend component design and chart integration.
    4. Iteration 4: Testing, seed population, and documentation.

---

### Student 1: Backend Architecture & Category Hierarchy

#### Q1: How is the category hierarchy represented in the database?
* **Answer:**  
  * The `Category` model uses a **self-referential adjacency list pattern**. Each category has an optional `parentId` foreign key pointing back to `Category.id`.
  * Top-level categories have `parentId = null`.
  * Subcategories store their parent's ID in `parentId`. In Prisma:
    ```prisma
    model Category {
      id        Int        @id @default(autoincrement())
      name      String
      parentId  Int?
      parent    Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
      children  Category[] @relation("CategoryHierarchy")
    }
    ```

#### Q2: How do you handle subcategories when querying transactions or calculating category expenses?
* **Answer:**  
  * When filtering by a parent category, the system queries all subcategory IDs under that parent (`parentId = targetId`), creating an array `[targetId, ...subCategoryIds]`. Transactions matching any of these IDs via Prisma's `where: { categoryId: { in: categoryIds } }` are aggregated together.

---

### Student 2: Budget Engine & Alert Logic

#### Q1: How does the threshold monitoring engine calculate alerts?
* **Answer:**  
  * The engine aggregates all `EXPENSE` transactions for the specified category and calendar month:
    $$\text{Percentage Spent} = \left(\frac{\text{Actual Spent}}{\text{Monthly Limit}}\right) \times 100$$
  * Three states are computed:
    1. **SAFE:** $\text{Percentage} < \text{Threshold}$ (default 80%).
    2. **WARNING:** $\text{Threshold} \le \text{Percentage} < 100\%$.
    3. **BREACHED:** $\text{Percentage} \ge 100\%$.
  * The `/api/budgets/alerts` endpoint filters for all active warnings and breaches, sending an alert payload to the frontend notification badge.

#### Q2: Can a user set both an overall budget and individual category budgets?
* **Answer:**  
  * Yes. A `Budget` record with `categoryId: null` represents the global spending cap for the month, while records with a specific `categoryId` define category-specific caps (e.g. ₹3,000 for Food & Canteen).

---

### Student 3: Frontend UI, Analytics & Reporting

#### Q1: How does the "Safe-to-Spend" daily allowance calculation work?
* **Answer:**  
  * It divides the remaining monthly budget (or remaining cash surplus) by the remaining days in the calendar month:
    $$\text{Safe Daily Spend} = \frac{\max(0, \text{Budget Limit} - \text{Total Spent})}{\max(1, \text{Days in Month} - \text{Current Day} + 1)}$$
  * This provides actionable financial feedback to help college students pace their spending across the month.

#### Q2: How does the CSV export work?
* **Answer:**  
  * The backend `/api/export/csv` endpoint fetches transactions, formats each record into standardized CSV rows (ID, Date, Type, Parent Category, Category, Amount in INR, Payment Method, Notes), sets the HTTP headers:
    `Content-Type: text/csv` and `Content-Disposition: attachment; filename="expenses.csv"`,
    and streams the CSV directly into the client's browser for immediate download.

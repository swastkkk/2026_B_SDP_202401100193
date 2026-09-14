/**
 * Automated API Verification Test Suite for Pockit v2
 * Uses Node.js built-in test & assert modules (Node 18+)
 * Run with: npm test (or node --test test/verify_endpoints.js)
 */

const test = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:5000/api';

test('1. Health check endpoint returns status OK', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'OK');
});

test('2. Multi-user authentication & user personas exist', async () => {
  const res = await fetch(`${BASE_URL}/auth/users`);
  assert.strictEqual(res.status, 200);
  const users = await res.json();
  assert.ok(Array.isArray(users));
  assert.ok(users.length >= 2, 'Should have at least 2 seeded personas');

  const swastik = users.find((u) => u.email === 'swastik@college.edu');
  const priya = users.find((u) => u.email === 'priya@college.edu');
  assert.ok(swastik, 'Swastik persona exists');
  assert.ok(priya, 'Priya persona exists');
});

test('3. Login endpoint returns valid JWT token and user profile', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'swastik@college.edu',
      password: 'password123',
    }),
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.token, 'Should return JWT token');
  assert.strictEqual(data.user.email, 'swastik@college.edu');
});

test('4. Data isolation: User 1 (Swastik) vs User 2 (Priya) have independent balances', async () => {
  const [res1, res2] = await Promise.all([
    fetch(`${BASE_URL}/analytics/summary`, { headers: { 'x-user-id': '1' } }),
    fetch(`${BASE_URL}/analytics/summary`, { headers: { 'x-user-id': '2' } }),
  ]);
  assert.strictEqual(res1.status, 200);
  assert.strictEqual(res2.status, 200);

  const summary1 = await res1.json();
  const summary2 = await res2.json();

  assert.notStrictEqual(summary1.totalExpense, summary2.totalExpense, 'Users should have isolated expenses');
  assert.notStrictEqual(summary1.totalIncome, summary2.totalIncome, 'Users should have isolated incomes');
});

test('5. Category endpoint returns hierarchical tree scoped to active user', async () => {
  const res = await fetch(`${BASE_URL}/categories?tree=true`, {
    headers: { 'x-user-id': '1' },
  });
  assert.strictEqual(res.status, 200);
  const categories = await res.json();
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length > 0);
  const parentWithChildren = categories.find((c) => Array.isArray(c.children) && c.children.length > 0);
  assert.ok(parentWithChildren, 'Should have at least one parent category with subcategories');
});

test('6. Budget threshold monitoring calculates spent, remaining, and alert statuses', async () => {
  const res = await fetch(`${BASE_URL}/budgets`, {
    headers: { 'x-user-id': '1' },
  });
  assert.strictEqual(res.status, 200);
  const budgets = await res.json();
  assert.ok(Array.isArray(budgets));
  assert.ok(budgets.length > 0);

  budgets.forEach((b) => {
    assert.ok(typeof b.spent === 'number');
    assert.ok(typeof b.percentage === 'number');
    assert.ok(['SAFE', 'WARNING', 'BREACHED'].includes(b.status));
  });
});

test('7. Analytics summary computes student Safe-to-Spend runway', async () => {
  const res = await fetch(`${BASE_URL}/analytics/summary`, {
    headers: { 'x-user-id': '1' },
  });
  assert.strictEqual(res.status, 200);
  const summary = await res.json();

  assert.ok(typeof summary.totalIncome === 'number');
  assert.ok(typeof summary.totalExpense === 'number');
  assert.ok(typeof summary.netSavings === 'number');
  assert.ok(summary.studentAdvisor, 'Must include studentAdvisor object');
  assert.ok(typeof summary.studentAdvisor.safeDailyAllowance === 'number');
  assert.ok(summary.studentAdvisor.headline.length > 0);
});

test('8. Transaction lifecycle: create, verify, and delete for active user', async () => {
  const catRes = await fetch(`${BASE_URL}/categories?type=EXPENSE`, {
    headers: { 'x-user-id': '1' },
  });
  const categories = await catRes.json();
  const targetCategory = categories[0];
  assert.ok(targetCategory);

  const createRes = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': '1' },
    body: JSON.stringify({
      amount: 65,
      type: 'EXPENSE',
      categoryId: targetCategory.id,
      paymentMethod: 'UPI',
      notes: 'Automated test sandwich transaction',
    }),
  });
  assert.strictEqual(createRes.status, 201);
  const created = await createRes.json();
  assert.strictEqual(created.amount, 65);

  const deleteRes = await fetch(`${BASE_URL}/transactions/${created.id}`, {
    method: 'DELETE',
    headers: { 'x-user-id': '1' },
  });
  assert.strictEqual(deleteRes.status, 200);
});

test('9. CSV Export returns valid text/csv format', async () => {
  const res = await fetch(`${BASE_URL}/export/csv`, {
    headers: { 'x-user-id': '1' },
  });
  assert.strictEqual(res.status, 200);
  assert.ok(res.headers.get('content-type').includes('text/csv'));
  const csv = await res.text();
  assert.ok(csv.includes('Transaction ID,Date,Type,Parent Category,Category'));
});

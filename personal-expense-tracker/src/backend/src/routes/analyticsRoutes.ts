import { Router, Response } from 'express';
import prisma from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET summary metrics including student "Safe-to-Spend" daily allowance
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const userCurrency = req.user?.currency || '₹';
    const now = new Date();
    const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [incomeAggregate, expenseAggregate, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: { userId, date: { gte: start, lte: end } },
      }),
    ]);

    const totalIncome = incomeAggregate._sum.amount || 0;
    const totalExpense = expenseAggregate._sum.amount || 0;
    const netSavings = totalIncome - totalExpense;

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
    });

    const overallBudget = budgets.find((b) => b.categoryId === null);
    const totalBudgetLimit = overallBudget
      ? overallBudget.monthlyLimit
      : budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);

    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = (now.getFullYear() === year && now.getMonth() + 1 === month)
      ? now.getDate()
      : 1;
    const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

    const remainingBudget = totalBudgetLimit > 0
      ? Math.max(0, totalBudgetLimit - totalExpense)
      : Math.max(0, netSavings);

    const safeDailyAllowance = Math.round((remainingBudget / daysRemaining) * 100) / 100;

    let paceStatus: 'SAFE' | 'WARNING' | 'SURVIVAL' = 'SAFE';
    if (totalBudgetLimit > 0 && totalExpense >= totalBudgetLimit) {
      paceStatus = 'SURVIVAL';
    } else if (totalBudgetLimit > 0 && (totalExpense / totalBudgetLimit) >= 0.8) {
      paceStatus = 'WARNING';
    }

    return res.json({
      period: { month, year },
      currency: userCurrency,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      transactionCount,
      budget: {
        totalLimit: totalBudgetLimit,
        totalSpent: totalExpense,
        remaining: Math.round(remainingBudget * 100) / 100,
        percentageUsed: totalBudgetLimit > 0
          ? Math.round((totalExpense / totalBudgetLimit) * 1000) / 10
          : 0,
      },
      studentAdvisor: {
        daysInMonth,
        currentDay,
        daysRemaining,
        safeDailyAllowance,
        currency: userCurrency,
        paceStatus,
        headline: safeDailyAllowance > 0
          ? `${userCurrency}${safeDailyAllowance.toLocaleString()}/day safe to spend for the remaining ${daysRemaining} days`
          : '⚠️ Budget exhausted for this month! Switch to survival mode.',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch summary' });
  }
});

// GET category breakdown for pie / donut chart
router.get('/category-breakdown', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: start, lte: end },
      },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
      },
    });

    const categoryMap: { [key: string]: { id: number; name: string; color: string; amount: number; count: number } } = {};
    let totalSpent = 0;

    for (const t of transactions) {
      const groupCategory = t.category.parent || t.category;
      const key = groupCategory.name;

      if (!categoryMap[key]) {
        categoryMap[key] = {
          id: groupCategory.id,
          name: groupCategory.name,
          color: groupCategory.color || '#6366F1',
          amount: 0,
          count: 0,
        };
      }

      categoryMap[key].amount += t.amount;
      categoryMap[key].count += 1;
      totalSpent += t.amount;
    }

    const result = Object.values(categoryMap).map((item) => ({
      ...item,
      amount: Math.round(item.amount * 100) / 100,
      percentage: totalSpent > 0 ? Math.round((item.amount / totalSpent) * 1000) / 10 : 0,
    })).sort((a, b) => b.amount - a.amount);

    return res.json({
      totalSpent: Math.round(totalSpent * 100) / 100,
      breakdown: result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch breakdown' });
  }
});

// GET 6-month monthly trends for line/bar chart
router.get('/monthly-trend', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const monthsData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);

      const [inc, exp] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: 'INCOME', date: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        }),
      ]);

      const income = inc._sum.amount || 0;
      const expense = exp._sum.amount || 0;

      const monthName = d.toLocaleString('default', { month: 'short' });

      monthsData.push({
        month: `${monthName} ${y}`,
        monthNum: m,
        year: y,
        income: Math.round(income),
        expense: Math.round(expense),
        savings: Math.round(income - expense),
      });
    }

    return res.json(monthsData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch trend' });
  }
});

// GET payment method distribution
router.get('/payment-methods', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const methods = await prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const result = methods.map((m) => ({
      method: m.paymentMethod,
      totalAmount: Math.round((m._sum.amount || 0) * 100) / 100,
      count: m._count.id,
    }));

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch payment methods' });
  }
});

export default router;

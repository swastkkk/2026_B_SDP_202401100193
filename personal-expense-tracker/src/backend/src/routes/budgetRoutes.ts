import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all budget routes
router.use(authMiddleware);

const budgetSchema = z.object({
  monthlyLimit: z.number().positive('Monthly limit must be greater than zero'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  alertThreshold: z.number().min(1).max(100).default(80),
  categoryId: z.number().nullable().optional(),
});

// Helper function to calculate budget status and spending for a specific user
async function computeBudgetDetails(budget: any, userId: number, month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  let categoryIds: number[] = [];

  if (budget.categoryId) {
    const subCategories = await prisma.category.findMany({
      where: { parentId: budget.categoryId, userId },
      select: { id: true },
    });
    categoryIds = [budget.categoryId, ...subCategories.map((c) => c.id)];
  }

  const whereClause: any = {
    userId,
    type: 'EXPENSE',
    date: { gte: start, lte: end },
  };

  if (categoryIds.length > 0) {
    whereClause.categoryId = { in: categoryIds };
  }

  const aggregate = await prisma.transaction.aggregate({
    where: whereClause,
    _sum: { amount: true },
  });

  const spent = aggregate._sum.amount || 0;
  const percentage = (spent / budget.monthlyLimit) * 100;
  const remaining = budget.monthlyLimit - spent;

  let status: 'SAFE' | 'WARNING' | 'BREACHED' = 'SAFE';
  if (percentage >= 100) {
    status = 'BREACHED';
  } else if (percentage >= budget.alertThreshold) {
    status = 'WARNING';
  }

  return {
    ...budget,
    spent,
    percentage: Math.round(percentage * 10) / 10,
    remaining: Math.round(remaining * 100) / 100,
    status,
    isBreached: percentage >= 100,
    isWarning: percentage >= budget.alertThreshold && percentage < 100,
  };
}

// GET all budgets with live status and spending calculations
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedBudgets = await Promise.all(
      budgets.map((b) => computeBudgetDetails(b, userId, month, year))
    );

    return res.json(enrichedBudgets);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch budgets' });
  }
});

// GET active alerts (breached or warning) for notification bell
router.get('/alerts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    });

    const enrichedBudgets = await Promise.all(
      budgets.map((b) => computeBudgetDetails(b, userId, month, year))
    );

    const activeAlerts = enrichedBudgets.filter(
      (b) => b.status === 'WARNING' || b.status === 'BREACHED'
    );

    return res.json({
      count: activeAlerts.length,
      alerts: activeAlerts,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch alerts' });
  }
});

// POST create or upsert budget
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validatedData = budgetSchema.parse(req.body);

    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: validatedData.categoryId, userId },
      });
      if (!category) {
        return res.status(400).json({ error: 'Category does not exist for this user' });
      }
    }

    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: validatedData.categoryId ?? null,
        month: validatedData.month,
        year: validatedData.year,
      },
    });

    let budget;
    if (existing) {
      budget = await prisma.budget.update({
        where: { id: existing.id },
        data: {
          monthlyLimit: validatedData.monthlyLimit,
          alertThreshold: validatedData.alertThreshold,
        },
        include: { category: true },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId,
          monthlyLimit: validatedData.monthlyLimit,
          month: validatedData.month,
          year: validatedData.year,
          alertThreshold: validatedData.alertThreshold,
          categoryId: validatedData.categoryId ?? null,
        },
        include: { category: true },
      });
    }

    const enriched = await computeBudgetDetails(budget, userId, validatedData.month, validatedData.year);
    return res.status(201).json(enriched);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to set budget' });
  }
});

// PUT update budget
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const validatedData = budgetSchema.partial().parse(req.body);

    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) return res.status(404).json({ error: 'Budget not found' });

    const budget = await prisma.budget.update({
      where: { id },
      data: validatedData,
      include: { category: true },
    });

    const enriched = await computeBudgetDetails(budget, userId, budget.month, budget.year);
    return res.json(enriched);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update budget' });
  }
});

// DELETE budget
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) return res.status(404).json({ error: 'Budget not found' });

    await prisma.budget.delete({
      where: { id },
    });

    return res.json({ message: 'Budget deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete budget' });
  }
});

export default router;

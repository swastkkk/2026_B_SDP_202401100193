import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all transaction routes
router.use(authMiddleware);

// Zod schema for transaction
const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
  date: z.string().optional().default(() => new Date().toISOString()),
  paymentMethod: z.enum(['UPI', 'CASH', 'CARD', 'NET_BANKING']).default('UPI'),
  notes: z.string().optional(),
  categoryId: z.number({ required_error: 'Category is required' }),
});

// GET transactions with search, filter, and pagination
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      type,
      categoryId,
      paymentMethod,
      search,
      startDate,
      endDate,
      month,
      year,
      page = '1',
      limit = '20',
    } = req.query;

    const where: any = { userId };

    if (type && typeof type === 'string') {
      where.type = type.toUpperCase();
    }

    if (categoryId) {
      const catId = parseInt(categoryId as string, 10);
      if (!isNaN(catId)) {
        const subCategories = await prisma.category.findMany({
          where: { parentId: catId, userId },
          select: { id: true },
        });
        const categoryIds = [catId, ...subCategories.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    }

    if (paymentMethod && typeof paymentMethod === 'string') {
      where.paymentMethod = paymentMethod.toUpperCase();
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { notes: { contains: search } },
        { category: { name: { contains: search } } },
      ];
    }

    // Date filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    } else if (month && year) {
      const m = parseInt(month as string, 10);
      const y = parseInt(year as string, 10);
      if (!isNaN(m) && !isNaN(y)) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        where.date = { gte: start, lte: end };
      }
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNum - 1) * take;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, color: true, icon: true, parentId: true },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.json({
      data: transactions,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
});

// GET transaction by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch transaction' });
  }
});

// POST create transaction
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validatedData = transactionSchema.parse(req.body);

    const category = await prisma.category.findFirst({
      where: { id: validatedData.categoryId, userId },
    });

    if (!category) {
      return res.status(400).json({ error: 'Selected category does not exist for this user' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: validatedData.amount,
        type: validatedData.type,
        date: new Date(validatedData.date),
        paymentMethod: validatedData.paymentMethod,
        notes: validatedData.notes,
        categoryId: validatedData.categoryId,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json(transaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create transaction' });
  }
});

// PUT update transaction
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const validatedData = transactionSchema.partial().parse(req.body);
    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: validatedData.categoryId, userId },
      });
      if (!category) {
        return res.status(400).json({ error: 'Category does not exist for this user' });
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return res.json(transaction);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update transaction' });
  }
});

// DELETE transaction
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    await prisma.transaction.delete({
      where: { id },
    });

    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete transaction' });
  }
});

export default router;

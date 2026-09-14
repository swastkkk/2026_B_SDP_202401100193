import { Router, Response } from 'express';
import prisma from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/csv', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const userCurrency = req.user?.currency || 'INR';
    const { startDate, endDate, month, year, type, categoryId } = req.query;

    const where: any = { userId };
    if (type && typeof type === 'string') {
      where.type = type.toUpperCase();
    }
    if (categoryId) {
      const catId = parseInt(categoryId as string, 10);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      }
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    } else if (month && year) {
      const m = parseInt(month as string, 10);
      const y = parseInt(year as string, 10);
      if (!isNaN(m) && !isNaN(y)) {
        where.date = {
          gte: new Date(y, m - 1, 1),
          lte: new Date(y, m, 0, 23, 59, 59, 999),
        };
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Parent Category',
      'Category',
      `Amount (${userCurrency})`,
      'Payment Method',
      'Notes',
    ];

    const rows = transactions.map((t) => {
      const dateFormatted = t.date.toISOString().split('T')[0];
      const parentCat = t.category.parent ? t.category.parent.name : t.category.name;
      const subCat = t.category.parent ? t.category.name : '-';
      return [
        t.id,
        dateFormatted,
        t.type,
        escapeCsv(parentCat),
        escapeCsv(subCat),
        t.amount.toFixed(2),
        t.paymentMethod,
        escapeCsv(t.notes),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    const filename = `pockit_statement_${year || 'all'}_${month || 'all'}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to export CSV' });
  }
});

export default router;

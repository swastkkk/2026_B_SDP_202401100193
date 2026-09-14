import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all category routes
router.use(authMiddleware);

// Zod schemas
const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
  parentId: z.number().nullable().optional(),
});

// GET all categories for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { tree, type } = req.query;
    const where: any = { userId };
    if (type && typeof type === 'string') {
      where.type = type.toUpperCase();
    }

    if (tree === 'true') {
      const categories = await prisma.category.findMany({
        where: {
          ...where,
          parentId: null,
        },
        include: {
          children: {
            where: { userId },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });
      return res.json(categories);
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch categories' });
  }
});

// GET category by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        children: { where: { userId } },
        parent: true,
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json(category);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch category' });
  }
});

// POST create category
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const validatedData = categorySchema.parse(req.body);

    if (validatedData.parentId) {
      const parent = await prisma.category.findFirst({
        where: { id: validatedData.parentId, userId },
      });
      if (!parent) {
        return res.status(400).json({ error: 'Parent category does not exist for this user' });
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        ...validatedData,
        userId,
      },
      include: {
        parent: true,
      },
    });

    return res.status(201).json(newCategory);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create category' });
  }
});

// PUT update category
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const validatedData = categorySchema.partial().parse(req.body);

    if (validatedData.parentId === id) {
      return res.status(400).json({ error: 'A category cannot be its own parent' });
    }

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData,
      include: {
        parent: true,
        children: true,
      },
    });

    return res.json(updatedCategory);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update category' });
  }
});

// DELETE category
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const existing = await prisma.category.findFirst({
      where: { id, userId },
    });
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    await prisma.category.delete({
      where: { id },
    });

    return res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete category' });
  }
});

export default router;

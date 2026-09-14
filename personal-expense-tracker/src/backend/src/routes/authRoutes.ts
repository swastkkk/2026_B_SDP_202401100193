import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../db';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  currency: z.string().default('₹'),
  avatar: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper: Seed fresh categories and budget template for newly registered users
export async function seedStarterUserData(userId: number) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Create starter categories
  const food = await prisma.category.create({
    data: {
      userId,
      name: 'Food & Canteen',
      icon: 'Utensils',
      color: '#F59E0B',
      type: 'EXPENSE',
      children: {
        create: [
          { userId, name: 'Canteen & Mess', icon: 'Sandwich', color: '#F59E0B', type: 'EXPENSE' },
          { userId, name: 'Chai & Tapri', icon: 'Coffee', color: '#D97706', type: 'EXPENSE' },
          { userId, name: 'Food Delivery', icon: 'Pizza', color: '#EF4444', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const academic = await prisma.category.create({
    data: {
      userId,
      name: 'College & Academics',
      icon: 'GraduationCap',
      color: '#3B82F6',
      type: 'EXPENSE',
      children: {
        create: [
          { userId, name: 'Books & Stationery', icon: 'BookOpen', color: '#3B82F6', type: 'EXPENSE' },
          { userId, name: 'Xerox & Printing', icon: 'Printer', color: '#60A5FA', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const travel = await prisma.category.create({
    data: {
      userId,
      name: 'Travel & Commute',
      icon: 'Bus',
      color: '#10B981',
      type: 'EXPENSE',
      children: {
        create: [
          { userId, name: 'Metro Recharge', icon: 'Train', color: '#10B981', type: 'EXPENSE' },
          { userId, name: 'Shared Auto & Cab', icon: 'Car', color: '#34D399', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const entertainment = await prisma.category.create({
    data: {
      userId,
      name: 'Entertainment & Fun',
      icon: 'Film',
      color: '#EC4899',
      type: 'EXPENSE',
      children: {
        create: [
          { userId, name: 'Movies & Outings', icon: 'Ticket', color: '#EC4899', type: 'EXPENSE' },
          { userId, name: 'OTT & Music', icon: 'Tv', color: '#F472B6', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const income = await prisma.category.create({
    data: {
      userId,
      name: 'Income & Allowance',
      icon: 'Wallet',
      color: '#22C55E',
      type: 'INCOME',
      children: {
        create: [
          { userId, name: 'Monthly Allowance (Parents)', icon: 'HeartHandshake', color: '#22C55E', type: 'INCOME' },
          { userId, name: 'Internship / Stipend', icon: 'Briefcase', color: '#16A34A', type: 'INCOME' },
        ],
      },
    },
    include: { children: true },
  });

  // Setup starter budgets
  await prisma.budget.create({
    data: {
      userId,
      monthlyLimit: 10000,
      month: currentMonth,
      year: currentYear,
      alertThreshold: 80,
      categoryId: null, // Global overall budget
    },
  });

  await prisma.budget.create({
    data: {
      userId,
      monthlyLimit: 3000,
      month: currentMonth,
      year: currentYear,
      alertThreshold: 75,
      categoryId: food.id,
    },
  });

  // Add initial allowance transaction so the new user has a positive balance
  const allowanceSubcat = income.children[0];
  if (allowanceSubcat) {
    await prisma.transaction.create({
      data: {
        userId,
        amount: 8000,
        type: 'INCOME',
        date: new Date(),
        paymentMethod: 'UPI',
        notes: 'Initial monthly pocket money allowance',
        categoryId: allowanceSubcat.id,
      },
    });
  }
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const avatar = validatedData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(validatedData.name)}`;

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        currency: validatedData.currency,
        avatar,
      },
      select: { id: true, name: true, email: true, currency: true, avatar: true },
    });

    // Auto-seed starter categories & budget
    await seedStarterUserData(user.id);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return res.status(201).json({ user, token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to register' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to log in' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// GET /api/auth/users (for Quick Profile Switcher in demo)
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        avatar: true,
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { id: 'asc' },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// POST /api/auth/switch (switch active profile without re-entering password for evaluations)
router.post('/switch', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, name: true, email: true, currency: true, avatar: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ user, token });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to switch user' });
  }
});

export default router;

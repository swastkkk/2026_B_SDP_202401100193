import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Pockit v2 database seeding with multi-user personas...');

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create User Persona 1: Swastik (CS & Tech Student)
  const userSwastik = await prisma.user.create({
    data: {
      name: 'Swastik Gupta',
      email: 'swastik@college.edu',
      password: defaultPassword,
      currency: '₹',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Swastik',
    },
  });

  // 2. Create User Persona 2: Priya (Hostel & Medical Student)
  const userPriya = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@college.edu',
      password: defaultPassword,
      currency: '₹',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya',
    },
  });

  console.log(`✅ Created 2 user personas: ${userSwastik.name} & ${userPriya.name}`);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const makeDate = (day: number) => new Date(currentYear, currentMonth - 1, day, 14, 0, 0);

  // ==========================================
  // SEED FOR SWASTIK (CS Student)
  // ==========================================
  const foodS = await prisma.category.create({
    data: {
      userId: userSwastik.id,
      name: 'Food & Canteen',
      icon: 'Utensils',
      color: '#F59E0B',
      type: 'EXPENSE',
      children: {
        create: [
          { userId: userSwastik.id, name: 'Canteen & Mess', icon: 'Sandwich', color: '#F59E0B', type: 'EXPENSE' },
          { userId: userSwastik.id, name: 'Chai & Tapri', icon: 'Coffee', color: '#D97706', type: 'EXPENSE' },
          { userId: userSwastik.id, name: 'Food Delivery (Swiggy)', icon: 'Pizza', color: '#EF4444', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const acadS = await prisma.category.create({
    data: {
      userId: userSwastik.id,
      name: 'Academics & Tech',
      icon: 'GraduationCap',
      color: '#3B82F6',
      type: 'EXPENSE',
      children: {
        create: [
          { userId: userSwastik.id, name: 'Books & Stationery', icon: 'BookOpen', color: '#3B82F6', type: 'EXPENSE' },
          { userId: userSwastik.id, name: 'Cloud & Tech Tools', icon: 'Laptop', color: '#2563EB', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const travelS = await prisma.category.create({
    data: {
      userId: userSwastik.id,
      name: 'Travel & Commute',
      icon: 'Bus',
      color: '#10B981',
      type: 'EXPENSE',
      children: {
        create: [
          { userId: userSwastik.id, name: 'Metro Recharge', icon: 'Train', color: '#10B981', type: 'EXPENSE' },
          { userId: userSwastik.id, name: 'Shared Auto', icon: 'Car', color: '#34D399', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const entS = await prisma.category.create({
    data: {
      userId: userSwastik.id,
      name: 'Entertainment & Fun',
      icon: 'Film',
      color: '#EC4899',
      type: 'EXPENSE',
      children: {
        create: [
          { userId: userSwastik.id, name: 'Movies & Fest', icon: 'Ticket', color: '#EC4899', type: 'EXPENSE' },
          { userId: userSwastik.id, name: 'Spotify & Prime', icon: 'Tv', color: '#F472B6', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const incS = await prisma.category.create({
    data: {
      userId: userSwastik.id,
      name: 'Income & Allowance',
      icon: 'Wallet',
      color: '#22C55E',
      type: 'INCOME',
      children: {
        create: [
          { userId: userSwastik.id, name: 'Monthly Allowance (Parents)', icon: 'HeartHandshake', color: '#22C55E', type: 'INCOME' },
          { userId: userSwastik.id, name: 'Web Dev Internship Stipend', icon: 'Briefcase', color: '#16A34A', type: 'INCOME' },
        ],
      },
    },
    include: { children: true },
  });

  // Swastik's Transactions
  const canteenCatS = foodS.children[0];
  const chaiCatS = foodS.children[1];
  const swiggyCatS = foodS.children[2];
  const booksCatS = acadS.children[0];
  const metroCatS = travelS.children[0];
  const autoCatS = travelS.children[1];
  const moviesCatS = entS.children[0];
  const ottCatS = entS.children[1];
  const allowanceCatS = incS.children[0];
  const stipendCatS = incS.children[1];

  const transactionsSwastik = [
    { userId: userSwastik.id, amount: 10000, type: 'INCOME', date: makeDate(1), paymentMethod: 'UPI', notes: 'Monthly pocket money from parents', categoryId: allowanceCatS.id },
    { userId: userSwastik.id, amount: 6000, type: 'INCOME', date: makeDate(5), paymentMethod: 'NET_BANKING', notes: 'React/Node internship stipend', categoryId: stipendCatS.id },
    { userId: userSwastik.id, amount: 500, type: 'EXPENSE', date: makeDate(2), paymentMethod: 'UPI', notes: 'Metro Smart Card Recharge', categoryId: metroCatS.id },
    { userId: userSwastik.id, amount: 499, type: 'EXPENSE', date: makeDate(3), paymentMethod: 'CARD', notes: 'Spotify & Prime student subscription', categoryId: ottCatS.id },
    { userId: userSwastik.id, amount: 85, type: 'EXPENSE', date: makeDate(6), paymentMethod: 'UPI', notes: 'Canteen Thali lunch', categoryId: canteenCatS.id },
    { userId: userSwastik.id, amount: 30, type: 'EXPENSE', date: makeDate(7), paymentMethod: 'UPI', notes: 'Chai & Bun Maska at tapri', categoryId: chaiCatS.id },
    { userId: userSwastik.id, amount: 350, type: 'EXPENSE', date: makeDate(9), paymentMethod: 'UPI', notes: 'Late night Biryani order on Swiggy', categoryId: swiggyCatS.id },
    { userId: userSwastik.id, amount: 40, type: 'EXPENSE', date: makeDate(10), paymentMethod: 'UPI', notes: 'Shared Auto to college campus', categoryId: autoCatS.id },
    { userId: userSwastik.id, amount: 450, type: 'EXPENSE', date: makeDate(11), paymentMethod: 'UPI', notes: 'Algorithms reference book', categoryId: booksCatS.id },
    { userId: userSwastik.id, amount: 750, type: 'EXPENSE', date: makeDate(12), paymentMethod: 'UPI', notes: 'Weekend movie ticket + snacks with friends', categoryId: moviesCatS.id },
  ];

  for (const t of transactionsSwastik) {
    await prisma.transaction.create({ data: t });
  }

  // Swastik's Budgets
  await prisma.budget.create({
    data: {
      userId: userSwastik.id,
      monthlyLimit: 12000,
      month: currentMonth,
      year: currentYear,
      alertThreshold: 80,
      categoryId: null,
    },
  });

  await prisma.budget.create({
    data: {
      userId: userSwastik.id,
      monthlyLimit: 3000,
      month: currentMonth,
      year: currentYear,
      alertThreshold: 75,
      categoryId: foodS.id,
    },
  });

  await prisma.budget.create({
    data: {
      userId: userSwastik.id,
      monthlyLimit: 1000,
      month: currentMonth,
      year: currentYear,
      alertThreshold: 70,
      categoryId: entS.id,
    },
  });

  // ==========================================
  // SEED FOR PRIYA (Hostel & Medical Student)
  // ==========================================
  const messP = await prisma.category.create({
    data: {
      userId: userPriya.id,
      name: 'Hostel & Mess',
      icon: 'Home',
      color: '#8B5CF6',
      type: 'EXPENSE',
      children: {
        create: [
          { userId: userPriya.id, name: 'Monthly Mess Bill', icon: 'Utensils', color: '#8B5CF6', type: 'EXPENSE' },
          { userId: userPriya.id, name: 'Laundry & Toiletries', icon: 'Sparkles', color: '#A78BFA', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const studyP = await prisma.category.create({
    data: {
      userId: userPriya.id,
      name: 'Medical Studies',
      icon: 'BookOpen',
      color: '#06B6D4',
      type: 'EXPENSE',
      children: {
        create: [
          { userId: userPriya.id, name: 'Anatomy Lab Notes & Xerox', icon: 'Printer', color: '#06B6D4', type: 'EXPENSE' },
          { userId: userPriya.id, name: 'Clinical Instruments', icon: 'GraduationCap', color: '#0891B2', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const snacksP = await prisma.category.create({
    data: {
      userId: userPriya.id,
      name: 'Snacks & Cafe',
      icon: 'Coffee',
      color: '#F59E0B',
      type: 'EXPENSE',
      children: {
        create: [
          { userId: userPriya.id, name: 'Hostel Night Canteen', icon: 'Sandwich', color: '#F59E0B', type: 'EXPENSE' },
          { userId: userPriya.id, name: 'Coffee & Juices', icon: 'Coffee', color: '#D97706', type: 'EXPENSE' },
        ],
      },
    },
    include: { children: true },
  });

  const incP = await prisma.category.create({
    data: {
      userId: userPriya.id,
      name: 'Income & Allowance',
      icon: 'Wallet',
      color: '#22C55E',
      type: 'INCOME',
      children: {
        create: [
          { userId: userPriya.id, name: 'Monthly Hostel Allowance', icon: 'HeartHandshake', color: '#22C55E', type: 'INCOME' },
        ],
      },
    },
    include: { children: true },
  });

  const messBillCatP = messP.children[0];
  const laundryCatP = messP.children[1];
  const labNotesCatP = studyP.children[0];
  const nightCanteenCatP = snacksP.children[0];
  const coffeeCatP = snacksP.children[1];
  const allowCatP = incP.children[0];

  const transactionsPriya = [
    { userId: userPriya.id, amount: 9000, type: 'INCOME', date: makeDate(1), paymentMethod: 'UPI', notes: 'Monthly hostel allowance from family', categoryId: allowCatP.id },
    { userId: userPriya.id, amount: 3200, type: 'EXPENSE', date: makeDate(2), paymentMethod: 'UPI', notes: 'Mess dues for current month', categoryId: messBillCatP.id },
    { userId: userPriya.id, amount: 250, type: 'EXPENSE', date: makeDate(4), paymentMethod: 'CASH', notes: 'Hostel laundry service', categoryId: laundryCatP.id },
    { userId: userPriya.id, amount: 480, type: 'EXPENSE', date: makeDate(6), paymentMethod: 'UPI', notes: 'Anatomy atlas color printouts & spiral binding', categoryId: labNotesCatP.id },
    { userId: userPriya.id, amount: 65, type: 'EXPENSE', date: makeDate(8), paymentMethod: 'UPI', notes: 'Late night Maggi at hostel canteen', categoryId: nightCanteenCatP.id },
    { userId: userPriya.id, amount: 45, type: 'EXPENSE', date: makeDate(10), paymentMethod: 'UPI', notes: 'Cold coffee after pathology exam', categoryId: coffeeCatP.id },
  ];

  for (const t of transactionsPriya) {
    await prisma.transaction.create({ data: t });
  }

  // Priya's Budgets
  await prisma.budget.create({
    data: {
      userId: userPriya.id,
      monthlyLimit: 8500,
      month: currentMonth,
      year: currentYear,
      alertThreshold: 80,
      categoryId: null,
    },
  });

  await prisma.budget.create({
    data: {
      userId: userPriya.id,
      monthlyLimit: 3500,
      month: currentMonth,
      year: currentYear,
      alertThreshold: 90,
      categoryId: messP.id,
    },
  });

  console.log(`✅ Seeded transactions and budgets for Swastik (${transactionsSwastik.length} txns) and Priya (${transactionsPriya.length} txns)`);
  console.log('🎉 Pockit v2 Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

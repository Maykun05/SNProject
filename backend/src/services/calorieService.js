import prisma from '../config/prisma.js';

export const addCalorieLog = async (userId, name, calories, amount) => {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end   = new Date(now); end.setHours(23, 59, 59, 999);

  return await prisma.calorieLog.create({
    data: { userId, name, calories: Number(calories), amount: Number(amount), date: now },
  });
};

export const fetchTodayCalories = async (userId) => {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end   = new Date(now); end.setHours(23, 59, 59, 999);

  const logs = await prisma.calorieLog.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: { date: 'desc' },
  });

  const total = logs.reduce((sum, l) => sum + l.calories, 0);
  return { logs, total };
};
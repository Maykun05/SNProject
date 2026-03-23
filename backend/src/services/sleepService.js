import prisma from "../config/prisma.js";

export const saveSleep = async (userId, hours) => {
  const today = new Date();
  const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return prisma.sleep.upsert({
    where: {
      userId_date: { userId, date: dateOnly }
    },
    update: { hours },
    create: { userId, date: dateOnly, hours }
  });
};

export const getSleepByUser = async (userId) => {
  return prisma.sleep.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });
};


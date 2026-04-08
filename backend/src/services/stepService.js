import prisma from '../config/prisma.js';

export const createStepSession = async (userId, data) => {
  return prisma.stepSession.create({
    data: { userId, ...data },
  });
};

export const getUserStepHistory = async (userId) => {
  return prisma.stepSession.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 20,
  });
};
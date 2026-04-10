import prisma from '../config/prisma.js';

export const createActivitySession = async (userId, data) => {
  return prisma.activitySession.create({
    data: { userId, ...data },
  });
};

export const getUserActivitySessionHistory = async (userId) => {
  return prisma.activitySession.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 20,
  });
};

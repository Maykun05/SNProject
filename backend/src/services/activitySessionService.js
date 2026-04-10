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

/**
 * รายการล่าสุดของ instance เดียวกันในวันแผน (ใช้กรอง custom goal ที่ฝั่ง controller)
 */
export const listActivitySessionsForPlanInstance = async (
  userId,
  planDateKey,
  instanceId,
  activityKey,
  take = 25
) => {
  return prisma.activitySession.findMany({
    where: {
      userId,
      planDateKey,
      instanceId,
      activityKey,
    },
    orderBy: { createdAt: 'desc' },
    take,
  });
};

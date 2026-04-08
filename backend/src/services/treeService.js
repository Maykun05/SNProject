import prisma from "../config/prisma.js";

export const updateTreeProgress = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mood = await prisma.moodLog.findFirst({
    where: { userId, date: today },
  });

  const completed = mood ? 1 : 0;
  const total = 1;

  await prisma.dailyProgress.upsert({
    where: {
      userId_date: { userId, date: today },
    },
    update: {
      completed,
      total,
    },
    create: {
      userId,
      date: today,
      completed,
      total,
      treeLevel: completed === total ? 1 : 0,
    },
  });
};
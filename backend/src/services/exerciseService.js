import prisma from "../config/prisma.js";

export const startOfDayFromDateKey = (dateKey) => {
  const m = String(dateKey).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

export const getExerciseDayForUser = async (userId, dateKey) => {
  const date = startOfDayFromDateKey(dateKey);
  if (!date) return null;
  return prisma.exerciseDay.findUnique({
    where: { userId_date: { userId, date } },
  });
};

export const upsertExerciseDayForUser = async (userId, dateKey, planJson, progressJson) => {
  const date = startOfDayFromDateKey(dateKey);
  if (!date) {
    const err = new Error("invalid_date");
    throw err;
  }
  return prisma.exerciseDay.upsert({
    where: { userId_date: { userId, date } },
    update: { planJson, progressJson },
    create: { userId, date, planJson, progressJson },
  });
};

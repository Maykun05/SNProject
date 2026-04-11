import prisma from "../config/prisma.js";

/** Canonical keys — ตรงกับ seed Feature.name */
const CANONICAL_FEATURES = ["water", "food", "mood", "sleep", "exercise"];

/** รองรับ client / log เก่า */
const LEGACY_FEATURE_ALIASES = {
  calorie: "food",
  step: "exercise",
};

export const VALID_FEATURES = CANONICAL_FEATURES;

export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const normalizeFeatureKey = (name = "") => {
  let k = String(name).replace(/feature$/i, "").trim().toLowerCase();
  k = LEGACY_FEATURE_ALIASES[k] ?? k;
  return k;
};

/**
 * @param {import("@prisma/client").Prisma.TransactionClient | typeof prisma} db
 */
export const getSelectedFeatureKeys = async (userId, db = prisma) => {
  const selected = await db.userFeature.findMany({
    where: { userId },
    include: { feature: true },
  });

  const keys = selected
    .map((row) => normalizeFeatureKey(row.feature?.name))
    .filter(Boolean);

  return keys.length > 0 ? Array.from(new Set(keys)) : VALID_FEATURES;
};

/**
 * @param {import("@prisma/client").Prisma.TransactionClient | typeof prisma} db
 */
export const getCompletedFeatureKeys = async (userId, date = new Date(), db = prisma) => {
  const logDate = startOfDay(date);
  const rows = await db.dailyFeatureLog.findMany({
    where: { userId, logDate },
    include: { feature: true },
  });
  return Array.from(
    new Set(rows.map((row) => normalizeFeatureKey(row.feature?.name)).filter(Boolean)),
  );
};

/**
 * Upsert DailyProgress from DailyFeatureLog + current UserFeature set for that calendar day.
 * @param {number} userId
 * @param {Date} logDate - any instant on that day (normalized to start of day)
 * @param {import("@prisma/client").Prisma.TransactionClient | typeof prisma} [db]
 * @returns {Promise<{ targetFeatures: string[], completedToday: string[], allCompleted: boolean }>}
 */
export async function recomputeDailyProgress(userId, logDate = new Date(), db = prisma) {
  const day = startOfDay(logDate);
  const targetFeatures = await getSelectedFeatureKeys(userId, db);
  const completedKeys = await getCompletedFeatureKeys(userId, day, db);
  const completedToday = targetFeatures.filter((k) => completedKeys.includes(k));
  const allCompleted = completedToday.length >= targetFeatures.length;

  await db.dailyProgress.upsert({
    where: { userId_date: { userId, date: day } },
    update: {
      completed: completedToday.length,
      total: targetFeatures.length,
      treeLevel: allCompleted ? 1 : 0,
    },
    create: {
      userId,
      date: day,
      completed: completedToday.length,
      total: targetFeatures.length,
      treeLevel: allCompleted ? 1 : 0,
    },
  });

  return { targetFeatures, completedToday, allCompleted };
}

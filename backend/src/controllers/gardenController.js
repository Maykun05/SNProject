import prisma from "../config/prisma.js";

const VALID_FEATURES = ["calorie", "mood", "sleep", "water", "step"];

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const normalizeFeatureKey = (name = "") =>
  String(name).replace(/feature$/i, "").trim().toLowerCase();

const getSelectedFeatureKeys = async (userId) => {
  const selected = await prisma.userFeature.findMany({
    where: { userId },
    include: { feature: true },
  });

  const keys = selected
    .map((row) => normalizeFeatureKey(row.feature?.name))
    .filter(Boolean);

  return keys.length > 0 ? Array.from(new Set(keys)) : VALID_FEATURES;
};

const getCompletedFeatureKeys = async (userId, date = new Date()) => {
  const logDate = startOfDay(date);
  const rows = await prisma.dailyFeatureLog.findMany({
    where: { userId, logDate },
    select: { featureKey: true },
  });
  return Array.from(new Set(rows.map((row) => normalizeFeatureKey(row.featureKey)).filter(Boolean)));
};

const countMonthEarnedDays = async (userId, year, month) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const completedDays = await prisma.dailyProgress.findMany({
    where: {
      userId,
      date: { gte: monthStart, lt: monthEnd },
      total: { gt: 0 },
    },
    orderBy: { date: "asc" },
  });

  return completedDays.filter((row) => row.completed >= row.total);
};

export const getGardenMonth = async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const [selectedFeatures, earnedRows] = await Promise.all([
      getSelectedFeatureKeys(userId),
      countMonthEarnedDays(userId, year, month),
    ]);

    return res.json({
      success: true,
      data: {
        year,
        month,
        treeCount: earnedRows.length,
        earnedDays: earnedRows.map((d) => ({ date: d.date, features: [] })),
        selectedFeatures,
        todayCompletedFeatures: await getCompletedFeatureKeys(userId),
      },
    });
  } catch (err) {
    console.error("getGardenMonth error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logFeature = async (req, res) => {
  try {
    const userId = req.user.id;
    const featureKey = normalizeFeatureKey(req.body?.featureKey);
    if (!VALID_FEATURES.includes(featureKey)) {
      return res.status(400).json({ success: false, message: "Invalid feature key" });
    }

    const today = startOfDay();
    await prisma.dailyFeatureLog.upsert({
      where: {
        userId_featureKey_logDate: { userId, featureKey, logDate: today },
      },
      update: {},
      create: { userId, featureKey, logDate: today },
    });

    const targetFeatures = await getSelectedFeatureKeys(userId);
    const completedKeys = await getCompletedFeatureKeys(userId, today);
    const completedToday = targetFeatures.filter((k) => completedKeys.includes(k));
    const allCompleted = completedToday.length >= targetFeatures.length;

    await prisma.dailyProgress.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        completed: completedToday.length,
        total: targetFeatures.length,
        treeLevel: allCompleted ? 1 : 0,
      },
      create: {
        userId,
        date: today,
        completed: completedToday.length,
        total: targetFeatures.length,
        treeLevel: allCompleted ? 1 : 0,
      },
    });

    const monthEarned = await countMonthEarnedDays(userId, today.getFullYear(), today.getMonth() + 1);

    return res.json({
      success: true,
      data: {
        featureKey,
        completedToday,
        targetFeatures,
        allCompleted,
        treeGrown: allCompleted,
        treeCount: monthEarned.length,
      },
    });
  } catch (err) {
    console.error("logFeature error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTodayProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = startOfDay();
    const targetFeatures = await getSelectedFeatureKeys(userId);
    const completedKeys = await getCompletedFeatureKeys(userId, today);
    const completedFeatures = targetFeatures.filter((k) => completedKeys.includes(k));
    const daily = await prisma.dailyProgress.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    const treeEarnedToday = daily ? daily.completed >= daily.total && daily.total > 0 : false;

    return res.json({
      success: true,
      data: {
        targetFeatures,
        completedFeatures,
        completedCount: completedFeatures.length,
        totalCount: targetFeatures.length,
        treeEarnedToday,
      },
    });
  } catch (err) {
    console.error("getTodayProgress error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const selectFeatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const featureKeys = Array.isArray(req.body?.featureKeys) ? req.body.featureKeys : [];
    if (featureKeys.length === 0) {
      return res.status(400).json({ success: false, message: "featureKeys must be a non-empty array" });
    }

    const normalized = Array.from(new Set(featureKeys.map(normalizeFeatureKey).filter(Boolean)));
    const features = await prisma.feature.findMany();
    const keyToId = new Map(features.map((f) => [normalizeFeatureKey(f.name), f.id]));
    const invalid = normalized.filter((k) => !keyToId.has(k));
    if (invalid.length > 0) {
      return res.status(400).json({ success: false, message: `Invalid features: ${invalid.join(", ")}` });
    }

    await prisma.$transaction([
      prisma.userFeature.deleteMany({ where: { userId } }),
      prisma.userFeature.createMany({
        data: normalized.map((k) => ({ userId, featureId: keyToId.get(k) })),
      }),
    ]);

    return res.json({ success: true, data: { selectedFeatures: normalized } });
  } catch (err) {
    console.error("selectFeatures error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getGardenSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await prisma.dailyProgress.findMany({
      where: { userId, total: { gt: 0 } },
      orderBy: { date: "desc" },
    });
    const grouped = new Map();

    rows.forEach((row) => {
      const d = new Date(row.date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${month}`;
      const prev = grouped.get(key) || { year, month, treeCount: 0 };
      if (row.completed >= row.total) prev.treeCount += 1;
      grouped.set(key, prev);
    });

    return res.json({ success: true, data: { months: Array.from(grouped.values()) } });
  } catch (err) {
    console.error("getGardenSummary error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

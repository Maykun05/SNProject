import prisma from "../config/prisma.js";

const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, deltaDays) => {
  const d = new Date(date);
  d.setDate(d.getDate() + deltaDays);
  return d;
};

const formatLocalDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getFeatureStats7d = async (req, res) => {
  try {
    const userId = req.user.id;
    const endDate = startOfDay();
    const startDate = addDays(endDate, -6);

    const [logs, selectedFeatures] = await Promise.all([
      prisma.dailyFeatureLog.findMany({
        where: {
          userId,
          logDate: { gte: startDate, lte: endDate },
        },
        include: { feature: true },
        orderBy: [{ logDate: "asc" }, { createdAt: "asc" }],
      }),
      prisma.userFeature.findMany({
        where: { userId },
        include: { feature: true },
      }),
    ]);

    const dateKeys = Array.from({ length: 7 }, (_, i) => formatLocalDate(addDays(startDate, i)));
    const dailyTotalMap = new Map(dateKeys.map((key) => [key, 0]));
    const featureMap = new Map();

    for (const row of logs) {
      const dayKey = formatLocalDate(row.logDate);
      dailyTotalMap.set(dayKey, (dailyTotalMap.get(dayKey) ?? 0) + 1);

      if (!featureMap.has(row.featureId)) {
        featureMap.set(row.featureId, {
          featureId: row.featureId,
          name: row.feature?.name ?? "Unknown",
          totalCount7d: 0,
          lastUsedAt: null,
          dailyCountMap: new Map(dateKeys.map((key) => [key, 0])),
        });
      }

      const item = featureMap.get(row.featureId);
      item.totalCount7d += 1;
      item.dailyCountMap.set(dayKey, (item.dailyCountMap.get(dayKey) ?? 0) + 1);

      if (!item.lastUsedAt || new Date(row.logDate) > new Date(item.lastUsedAt)) {
        item.lastUsedAt = row.logDate;
      }
    }

    const fallbackFeatures = selectedFeatures
      .map((row) => row.feature)
      .filter(Boolean)
      .map((feature) => ({
        featureId: feature.id,
        name: feature.name,
        totalCount7d: 0,
        lastUsedAt: null,
        dailyCountMap: new Map(dateKeys.map((key) => [key, 0])),
      }));

    for (const feature of fallbackFeatures) {
      if (!featureMap.has(feature.featureId)) {
        featureMap.set(feature.featureId, feature);
      }
    }

    const dailyTotals = dateKeys.map((date) => ({
      date,
      count: dailyTotalMap.get(date) ?? 0,
    }));

    const featureBreakdown = Array.from(featureMap.values())
      .map((item) => ({
        featureId: item.featureId,
        name: item.name,
        totalCount7d: item.totalCount7d,
        lastUsedAt: item.lastUsedAt,
        dailyCounts: dateKeys.map((date) => ({
          date,
          count: item.dailyCountMap.get(date) ?? 0,
        })),
      }))
      .sort((a, b) => b.totalCount7d - a.totalCount7d || a.name.localeCompare(b.name));

    const totalLogs7d = dailyTotals.reduce((sum, day) => sum + day.count, 0);
    const activeDays7d = dailyTotals.filter((day) => day.count > 0).length;

    let currentStreak = 0;
    for (let i = dailyTotals.length - 1; i >= 0; i -= 1) {
      if (dailyTotals[i].count > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    const topFeatureItem = featureBreakdown.find((item) => item.totalCount7d > 0) ?? null;
    const topFeature = topFeatureItem
      ? {
          featureId: topFeatureItem.featureId,
          name: topFeatureItem.name,
          count: topFeatureItem.totalCount7d,
        }
      : null;

    return res.json({
      success: true,
      data: {
        dateRange: {
          startDate: formatLocalDate(startDate),
          endDate: formatLocalDate(endDate),
        },
        totalLogs7d,
        activeDays7d,
        currentStreak,
        topFeature,
        dailyTotals,
        featureBreakdown,
      },
    });
  } catch (err) {
    console.error("getFeatureStats7d error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

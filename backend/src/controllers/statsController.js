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

const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const buildDateKeys = (startDate, endDate) => {
  const keys = [];
  const cursor = startOfDay(startDate);
  const end = startOfDay(endDate);
  while (cursor <= end) {
    keys.push(formatLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
};

const parseRange = (range) => {
  const now = new Date();
  const endDate = startOfDay(now);
  if (range === "30d") {
    return { key: "30d", startDate: addDays(endDate, -29), endDate };
  }
  if (range === "month") {
    return {
      key: "month",
      startDate: new Date(endDate.getFullYear(), endDate.getMonth(), 1),
      endDate,
    };
  }
  return { key: "7d", startDate: addDays(endDate, -6), endDate };
};

const parseDateOnly = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return null;
  return startOfDay(date);
};

const toSummary = (series) => {
  const total = series.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const activeDays = series.filter((item) => (Number(item.value) || 0) > 0).length;
  const average = series.length ? Number((total / series.length).toFixed(2)) : 0;
  const peak = series.reduce(
    (max, item) => ((item.value ?? 0) > max.value ? item : max),
    { date: null, value: 0 }
  );
  return {
    total,
    activeDays,
    average,
    peakValue: peak.value ?? 0,
    peakDate: peak.date,
  };
};

const moodToScore = (mood) => {
  if (typeof mood === "number") return mood;
  const key = String(mood || "").toLowerCase();
  const map = {
    awful: 1,
    very_sad: 1,
    meh: 3,
    good: 4,
    rad: 5,
    sad: 2,
    neutral: 3,
    happy: 4,
    very_happy: 5,
  };
  return map[key] ?? 0;
};

const buildWaterSeries = async (userId, startDate, endDate, dateKeys) => {
  const rows = await prisma.waterLog.findMany({
    where: { userId, logDate: { gte: startDate, lte: endOfDay(endDate) } },
    select: { logDate: true, amountMl: true },
    orderBy: { logDate: "asc" },
  });
  const map = new Map(dateKeys.map((d) => [d, 0]));
  for (const row of rows) {
    const key = formatLocalDate(row.logDate);
    map.set(key, (map.get(key) ?? 0) + (Number(row.amountMl) || 0));
  }
  return dateKeys.map((date) => ({ date, value: map.get(date) ?? 0 }));
};

const buildMoodSeries = async (userId, startDate, endDate, dateKeys) => {
  const rows = await prisma.moodLog.findMany({
    where: { userId, date: { gte: startDate, lte: endOfDay(endDate) } },
    select: { date: true, mood: true },
    orderBy: { date: "asc" },
  });
  const daily = new Map(dateKeys.map((d) => [d, { sum: 0, count: 0 }]));
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    const score = moodToScore(row.mood);
    const prev = daily.get(key) ?? { sum: 0, count: 0 };
    prev.sum += score;
    prev.count += 1;
    daily.set(key, prev);
  }
  return dateKeys.map((date) => {
    const entry = daily.get(date) ?? { sum: 0, count: 0 };
    const value = entry.count ? Number((entry.sum / entry.count).toFixed(2)) : 0;
    return { date, value };
  });
};

const buildSleepSeries = async (userId, startDate, endDate, dateKeys) => {
  const rows = await prisma.sleep.findMany({
    where: { userId, date: { gte: startDate, lte: endOfDay(endDate) } },
    select: { date: true, hours: true },
    orderBy: { date: "asc" },
  });
  const map = new Map(dateKeys.map((d) => [d, 0]));
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    map.set(key, (map.get(key) ?? 0) + (Number(row.hours) || 0));
  }
  return dateKeys.map((date) => ({ date, value: Number((map.get(date) ?? 0).toFixed(2)) }));
};

const buildStepsSeries = async (userId, startDate, endDate, dateKeys) => {
  const rows = await prisma.activitySession.findMany({
    where: { userId, date: { gte: startDate, lte: endOfDay(endDate) } },
    select: { date: true, steps: true },
    orderBy: { date: "asc" },
  });
  const map = new Map(dateKeys.map((d) => [d, 0]));
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    map.set(key, (map.get(key) ?? 0) + (Number(row.steps) || 0));
  }
  return dateKeys.map((date) => ({ date, value: map.get(date) ?? 0 }));
};

const emptyExerciseDay = (date) => ({
  date,
  sessions: 0,
  steps: 0,
  durationSec: 0,
  calories: 0,
  distance: 0,
});

const buildExerciseSeries = async (userId, startDate, endDate, dateKeys) => {
  const rows = await prisma.activitySession.findMany({
    where: { userId, date: { gte: startDate, lte: endOfDay(endDate) } },
    select: { date: true, steps: true, distance: true, calories: true, duration: true },
    orderBy: { date: "asc" },
  });
  const map = new Map(dateKeys.map((d) => [d, { ...emptyExerciseDay(d) }]));
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    const cur = map.get(key);
    if (!cur) continue;
    cur.sessions += 1;
    cur.steps += Number(row.steps) || 0;
    cur.durationSec += Number(row.duration) || 0;
    cur.calories += Number(row.calories) || 0;
    cur.distance += Number(row.distance) || 0;
  }
  return dateKeys.map((date) => map.get(date));
};

const toExerciseSummary = (series) => {
  const totals = series.reduce(
    (acc, d) => ({
      sessions: acc.sessions + (Number(d.sessions) || 0),
      steps: acc.steps + (Number(d.steps) || 0),
      durationSec: acc.durationSec + (Number(d.durationSec) || 0),
      calories: acc.calories + (Number(d.calories) || 0),
      distance: acc.distance + (Number(d.distance) || 0),
    }),
    { sessions: 0, steps: 0, durationSec: 0, calories: 0, distance: 0 },
  );
  const activeDays = series.filter((d) => (Number(d.sessions) || 0) > 0).length;
  return { activeDays, totals };
};

const buildFoodSeries = async (userId, startDate, endDate, dateKeys) => {
  const rows = await prisma.foodLog.findMany({
    where: { userId, date: { gte: startDate, lte: endOfDay(endDate) } },
    select: { date: true, calories: true },
    orderBy: { date: "asc" },
  });
  const map = new Map(dateKeys.map((d) => [d, 0]));
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    map.set(key, (map.get(key) ?? 0) + (Number(row.calories) || 0));
  }
  return dateKeys.map((date) => ({ date, value: map.get(date) ?? 0 }));
};

const buildFeatureLogs7dPayload = async (userId, startDate, endDate) => {
  const dateKeys = buildDateKeys(startDate, endDate);
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
    if (dailyTotals[i].count > 0) currentStreak += 1;
    else break;
  }

  const topFeatureItem = featureBreakdown.find((item) => item.totalCount7d > 0) ?? null;
  const topFeature = topFeatureItem
    ? {
        featureId: topFeatureItem.featureId,
        name: topFeatureItem.name,
        count: topFeatureItem.totalCount7d,
      }
    : null;

  return {
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
  };
};

export const getFeatureStats7d = async (req, res) => {
  try {
    const userId = req.user.id;
    const endDate = startOfDay();
    const startDate = addDays(endDate, -6);
    const data = await buildFeatureLogs7dPayload(userId, startDate, endDate);

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("getFeatureStats7d error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFeatureStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const feature = String(req.query.feature || "water").toLowerCase();
    const queryStartDate = parseDateOnly(req.query.startDate);
    const queryEndDate = parseDateOnly(req.query.endDate);
    let rangeMeta = parseRange(String(req.query.range || "7d"));
    if (queryStartDate && queryEndDate) {
      if (queryStartDate > queryEndDate) {
        return res.status(400).json({ success: false, message: "startDate must be before endDate" });
      }
      const maxSpanDays = 366;
      const spanDays = Math.floor((queryEndDate - queryStartDate) / (24 * 60 * 60 * 1000)) + 1;
      if (spanDays > maxSpanDays) {
        return res.status(400).json({ success: false, message: "Date range is too large (max 366 days)" });
      }
      rangeMeta = { key: "custom", startDate: queryStartDate, endDate: queryEndDate };
    }
    const { key: range, startDate, endDate } = rangeMeta;
    const dateKeys = buildDateKeys(startDate, endDate);

    let unit = "count";
    let series = [];

    if (feature === "water") {
      unit = "ml";
      series = await buildWaterSeries(userId, startDate, endDate, dateKeys);
    } else if (feature === "mood") {
      unit = "score";
      series = await buildMoodSeries(userId, startDate, endDate, dateKeys);
    } else if (feature === "sleep") {
      unit = "hours";
      series = await buildSleepSeries(userId, startDate, endDate, dateKeys);
    } else if (feature === "steps") {
      unit = "steps";
      series = await buildStepsSeries(userId, startDate, endDate, dateKeys);
    } else if (feature === "exercise") {
      unit = "exercise";
      series = await buildExerciseSeries(userId, startDate, endDate, dateKeys);
    } else if (feature === "food") {
      unit = "kcal";
      series = await buildFoodSeries(userId, startDate, endDate, dateKeys);
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported feature. Use one of: water, mood, sleep, steps, exercise, food",
      });
    }

    const summary =
      feature === "exercise"
        ? {
            ...toExerciseSummary(series),
            total: 0,
            average: 0,
            peakValue: 0,
            peakDate: null,
          }
        : toSummary(series);

    return res.json({
      success: true,
      data: {
        dateRange: {
          startDate: formatLocalDate(startDate),
          endDate: formatLocalDate(endDate),
        },
        feature,
        range,
        granularity: "day",
        unit,
        summary,
        series,
      },
    });
  } catch (err) {
    console.error("getFeatureStats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

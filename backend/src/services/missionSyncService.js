import { MISSION_CATALOG, XP_BASE } from "./missionDefinitions.js";
import { applyXpInTransaction } from "./userXpService.js";

const DEFAULT_WATER_GOAL_ML = 2000;

export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const addDays = (date, deltaDays) => {
  const d = new Date(date);
  d.setDate(d.getDate() + deltaDays);
  return d;
};

export const formatLocalDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const startOfWeekMonday = (date = new Date()) => {
  const s = startOfDay(date);
  const day = s.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  s.setDate(s.getDate() + diff);
  return s;
};

export const startOfMonth = (date = new Date()) => {
  const d = startOfDay(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const monthPeriodKey = (date = new Date()) => {
  const d = startOfDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

/** Monday-based week id: week-{YYYY-MM-DD of Monday} */
export const weekPeriodKey = (date = new Date()) => `week-${formatLocalDate(startOfWeekMonday(date))}`;

export const moodToScore = (mood) => {
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

function buildDailyMapFromWater(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = formatLocalDate(row.logDate);
    map.set(key, (map.get(key) ?? 0) + (Number(row.amountMl) || 0));
  }
  return map;
}

function buildDailyCountMapFood(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function buildDailySteps(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    map.set(key, (map.get(key) ?? 0) + (Number(row.steps) || 0));
  }
  return map;
}

function buildMoodByDay(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    map.set(key, row.mood);
  }
  return map;
}

function buildSleepByDay(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = formatLocalDate(row.date);
    map.set(key, Number(row.hours) || 0);
  }
  return map;
}

function sumStepsInRange(dailySteps, dateKeys) {
  let t = 0;
  for (const k of dateKeys) t += dailySteps.get(k) ?? 0;
  return t;
}

function buildDateKeysInclusive(startDate, endDate) {
  const keys = [];
  const cursor = startOfDay(startDate);
  const end = startOfDay(endDate);
  while (cursor <= end) {
    keys.push(formatLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function countWaterGoalStreakEndingToday(waterMlByDay, todayKey, waterGoalMl) {
  let streak = 0;
  let cursor = startOfDay(new Date());
  for (let i = 0; i < 120; i += 1) {
    const key = formatLocalDate(cursor);
    const ml = waterMlByDay.get(key) ?? 0;
    if (ml >= waterGoalMl) streak += 1;
    else break;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function activityStreakDays(waterMlByDay, foodCountByDay, dailySteps, moodByDay, todayStart) {
  let streak = 0;
  let cursor = startOfDay(todayStart);
  for (let i = 0; i < 366; i += 1) {
    const key = formatLocalDate(cursor);
    const water = waterMlByDay.get(key) ?? 0;
    const foods = foodCountByDay.get(key) ?? 0;
    const steps = dailySteps.get(key) ?? 0;
    const mood = moodByDay.has(key);
    if (water > 0 || foods > 0 || steps > 0 || mood) streak += 1;
    else break;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * @param {object} ctx
 * @param {string} ctx.todayKey
 * @param {string[]} ctx.weekDayKeys
 * @param {string[]} ctx.monthDayKeys
 * @param {Map<string, number>} ctx.waterMlByDay
 * @param {Map<string, number>} ctx.foodCountByDay
 * @param {Map<string, number>} ctx.dailySteps
 * @param {Map<string, any>} ctx.moodByDay
 * @param {Map<string, number>} ctx.sleepByDay
 * @param {number} ctx.waterGoalMl
 * @param {string} ctx.weekStartKey
 * @param {string} ctx.satKey
 * @param {string} ctx.sunKey
 */
export function computeMetricProgress(metric, ctx) {
  const {
    todayKey,
    weekDayKeys,
    monthDayKeys,
    waterMlByDay,
    foodCountByDay,
    dailySteps,
    moodByDay,
    sleepByDay,
    waterGoalMl,
    satKey,
    sunKey,
  } = ctx;

  switch (metric) {
    case "water_logs_today":
      return (waterMlByDay.get(todayKey) ?? 0) > 0 ? 1 : 0;
    case "food_logs_today":
      return Math.min(foodCountByDay.get(todayKey) ?? 0, 99);
    case "steps_today":
      return dailySteps.get(todayKey) ?? 0;
    case "mood_logged_today":
      return moodByDay.has(todayKey) ? 1 : 0;
    case "sleep_7h_days_week": {
      let c = 0;
      for (const k of weekDayKeys) {
        const h = sleepByDay.get(k) ?? 0;
        if (h >= 7) c += 1;
      }
      return c;
    }
    case "weekend_steps_week": {
      const sat = dailySteps.get(satKey) ?? 0;
      const sun = dailySteps.get(sunKey) ?? 0;
      return sat + sun;
    }
    case "food_distinct_days_week": {
      let best = 0;
      let cur = 0;
      for (const k of weekDayKeys) {
        if ((foodCountByDay.get(k) ?? 0) > 0) {
          cur += 1;
          best = Math.max(best, cur);
        } else {
          cur = 0;
        }
      }
      return best;
    }
    case "water_goal_streak":
      return countWaterGoalStreakEndingToday(waterMlByDay, todayKey, waterGoalMl);
    case "steps_sum_week":
      return sumStepsInRange(dailySteps, weekDayKeys);
    case "steps_sum_month":
      return sumStepsInRange(dailySteps, monthDayKeys);
    case "happy_mood_days_month": {
      let c = 0;
      for (const k of monthDayKeys) {
        if (!moodByDay.has(k)) continue;
        if (moodToScore(moodByDay.get(k)) >= 4) c += 1;
      }
      return c;
    }
    case "sleep_7_8_days_month": {
      let c = 0;
      for (const k of monthDayKeys) {
        const h = sleepByDay.get(k) ?? 0;
        if (h >= 7 && h <= 8) c += 1;
      }
      return c;
    }
    case "mood_days_month": {
      let best = 0;
      let cur = 0;
      for (const k of monthDayKeys) {
        if (moodByDay.has(k)) {
          cur += 1;
          best = Math.max(best, cur);
        } else {
          cur = 0;
        }
      }
      return best;
    }
    case "food_distinct_days_month": {
      let c = 0;
      for (const k of monthDayKeys) {
        if ((foodCountByDay.get(k) ?? 0) > 0) c += 1;
      }
      return c;
    }
    default:
      return 0;
  }
}

function weekendSatSunKeys(weekStartMondayDate) {
  const sat = addDays(weekStartMondayDate, 5);
  const sun = addDays(weekStartMondayDate, 6);
  return { satKey: formatLocalDate(sat), sunKey: formatLocalDate(sun) };
}

export async function syncMissionsForUser(prisma, userId, now = new Date()) {
  const today = startOfDay(now);
  const todayKey = formatLocalDate(today);
  const weekStart = startOfWeekMonday(today);
  const weekEndDay = startOfDay(addDays(weekStart, 6));
  const monthStart = startOfMonth(today);
  const dataStart = addDays(today, -120);

  const weekDayKeys = buildDateKeysInclusive(weekStart, weekEndDay);
  const monthDayKeys = buildDateKeysInclusive(monthStart, today);
  const { satKey, sunKey } = weekendSatSunKeys(weekStart);

  const rewardsApplied = [];

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { coins: true, profile: { select: { waterGoal: true } } },
    });
    if (!user) throw new Error("USER_NOT_FOUND");

    const waterGoalMl = user.profile?.waterGoal ?? DEFAULT_WATER_GOAL_ML;

    const [waterRows, foodRows, sessionRows, moodRows, sleepRows] = await Promise.all([
      tx.waterLog.findMany({
        where: { userId, logDate: { gte: dataStart, lte: endOfDay(today) } },
        select: { logDate: true, amountMl: true },
      }),
      tx.foodLog.findMany({
        where: { userId, date: { gte: dataStart, lte: endOfDay(today) } },
        select: { date: true },
      }),
      tx.activitySession.findMany({
        where: { userId, date: { gte: dataStart, lte: endOfDay(today) } },
        select: { date: true, steps: true },
      }),
      tx.moodLog.findMany({
        where: { userId, date: { gte: dataStart, lte: endOfDay(today) } },
        select: { date: true, mood: true },
      }),
      tx.sleep.findMany({
        where: { userId, date: { gte: dataStart, lte: endOfDay(today) } },
        select: { date: true, hours: true },
      }),
    ]);

    const waterMlByDay = buildDailyMapFromWater(waterRows);
    const foodCountByDay = buildDailyCountMapFood(foodRows);
    const dailySteps = buildDailySteps(sessionRows);
    const moodByDay = buildMoodByDay(moodRows);
    const sleepByDay = buildSleepByDay(sleepRows);

    const ctx = {
      todayKey,
      weekDayKeys,
      monthDayKeys,
      waterMlByDay,
      foodCountByDay,
      dailySteps,
      moodByDay,
      sleepByDay,
      waterGoalMl,
      weekStartKey: formatLocalDate(weekStart),
      satKey,
      sunKey,
    };

    const streak = activityStreakDays(waterMlByDay, foodCountByDay, dailySteps, moodByDay, today);

    const periodKeys = {
      daily: todayKey,
      weekly: weekPeriodKey(today),
      monthly: monthPeriodKey(today),
    };

    const processPeriod = async (periodName) => {
      const missions = MISSION_CATALOG[periodName];
      const periodKey = periodKeys[periodName];
      const xpBase = XP_BASE[periodName];
      const out = [];

      for (const def of missions) {
        const progress = computeMetricProgress(def.metric, ctx);
        const goal = def.goal;
        const p = Number(progress) || 0;
        const g = Number(goal) || 0;
        const meetsGoal = g > 0 && p >= g;

        await tx.missionProgress.upsert({
          where: {
            userId_missionId_periodKey: {
              userId,
              missionId: def.id,
              periodKey,
            },
          },
          create: {
            userId,
            missionId: def.id,
            periodKey,
            type: periodName,
            progress: p,
            goal: g,
            isCompleted: false,
          },
          update: {
            progress: p,
            goal: g,
            type: periodName,
          },
        });

        let activated = { count: 0 };
        if (meetsGoal) {
          activated = await tx.missionProgress.updateMany({
            where: {
              userId,
              missionId: def.id,
              periodKey,
              isCompleted: false,
              progress: { gte: g },
            },
            data: {
              isCompleted: true,
              completedAt: new Date(),
            },
          });
        }

        if (activated.count === 1 && meetsGoal) {
          const coinAmount = def.reward;
          const xpAmount = xpBase + def.reward;
          const source = `mission_reward:${periodName}:${def.id}:${periodKey}`;

          await tx.user.update({
            where: { id: userId },
            data: { coins: { increment: coinAmount } },
          });
          await tx.coinTransaction.create({
            data: {
              userId,
              amount: coinAmount,
              source,
            },
          });
          await applyXpInTransaction(tx, userId, xpAmount);
          rewardsApplied.push({
            missionId: def.id,
            period: periodName,
            coins: coinAmount,
            xp: xpAmount,
            source,
          });
        }

        const row = await tx.missionProgress.findUnique({
          where: {
            userId_missionId_periodKey: {
              userId,
              missionId: def.id,
              periodKey,
            },
          },
          select: { isCompleted: true },
        });
        const completed = Boolean(row?.isCompleted);
        const progressPercent =
          g > 0 ? Math.min(100, Math.round((Math.min(p, g) / g) * 100)) : 0;

        out.push({
          id: def.id,
          title: def.title,
          period: periodName,
          periodKey,
          goal: g,
          unit: def.unit,
          reward: def.reward,
          xpReward: xpBase + def.reward,
          progress: p,
          completed,
          progressPercent,
        });
      }
      return out;
    };

    const daily = await processPeriod("daily");
    const weekly = await processPeriod("weekly");
    const monthly = await processPeriod("monthly");

    const endUser = await tx.user.findUnique({
      where: { id: userId },
      select: { coins: true, xp: true, level: true, totalXp: true },
    });

    return {
      missions: { daily, weekly, monthly },
      periodKeys,
      activityStreakDays: streak,
      coins: endUser?.coins ?? 0,
      xp: endUser?.xp ?? 0,
      level: endUser?.level ?? 1,
      totalXp: endUser?.totalXp ?? 0,
    };
  });

  return { ...result, rewardsApplied };
}

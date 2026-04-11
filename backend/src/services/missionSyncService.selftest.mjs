/**
 * Smoke checks for mission metrics (run: npm run test:missions)
 */
import assert from "node:assert/strict";
import { computeMetricProgress, formatLocalDate, startOfDay } from "./missionSyncService.js";

const today = startOfDay(new Date());
const todayKey = formatLocalDate(today);
const weekDayKeys = [todayKey];
const monthDayKeys = [todayKey];

const baseCtx = {
  todayKey,
  weekDayKeys,
  monthDayKeys,
  waterMlByDay: new Map([[todayKey, 100]]),
  foodCountByDay: new Map([[todayKey, 3]]),
  dailySteps: new Map([[todayKey, 6000]]),
  moodByDay: new Map([[todayKey, "happy"]]),
  sleepByDay: new Map([[todayKey, 7.5]]),
  waterGoalMl: 2000,
  weekStartKey: todayKey,
  satKey: todayKey,
  sunKey: todayKey,
};

assert.equal(computeMetricProgress("water_logs_today", baseCtx), 1);
assert.equal(computeMetricProgress("food_logs_today", baseCtx), 3);
assert.equal(computeMetricProgress("steps_today", baseCtx), 6000);
assert.equal(computeMetricProgress("mood_logged_today", baseCtx), 1);

assert.equal(computeMetricProgress("exercise_session_days_today", baseCtx), 0);
assert.equal(
  computeMetricProgress("exercise_session_days_today", {
    ...baseCtx,
    exerciseDayKeys: new Set([todayKey]),
  }),
  1
);

assert.equal(computeMetricProgress("water_logs_today", { ...baseCtx, waterMlByDay: new Map() }), 0);

// Consecutive food: Mon Wed Fri in week → best streak 1
const mon = "2026-04-06";
const tue = "2026-04-07";
const wed = "2026-04-08";
const foodStreakCtx = {
  ...baseCtx,
  weekDayKeys: [mon, tue, wed],
  foodCountByDay: new Map([
    [mon, 1],
    [tue, 1],
    [wed, 1],
  ]),
};
assert.equal(computeMetricProgress("food_distinct_days_week", foodStreakCtx), 3);
assert.equal(
  computeMetricProgress("exercise_distinct_days_week", {
    ...foodStreakCtx,
    exerciseDayKeys: new Set([mon, wed]),
  }),
  2
);

console.log("missionSyncService selftest: OK");

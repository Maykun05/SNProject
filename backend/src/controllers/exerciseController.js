import {
  getExerciseDayForUser,
  upsertExerciseDayForUser,
} from "../services/exerciseService.js";

export const getExerciseDayController = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateKey = req.query.date;
    if (!dateKey || typeof dateKey !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query date required (YYYY-MM-DD)",
      });
    }

    const row = await getExerciseDayForUser(userId, dateKey);
    if (!row) {
      return res.json({ success: true, data: null });
    }

    return res.json({
      success: true,
      data: {
        date: dateKey,
        plan: row.planJson,
        progress: row.progressJson,
        updatedAt: row.updatedAt,
      },
    });
  } catch (err) {
    console.error("getExerciseDay error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const putExerciseDayController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, plan, progress } = req.body || {};

    if (!date || typeof date !== "string") {
      return res.status(400).json({ success: false, message: "date required" });
    }
    const hasLegacyActivities = Array.isArray(plan.selectedActivities);
    const hasInstancePlan = Array.isArray(plan.activityInstances);
    if (!plan || typeof plan !== "object" || (!hasLegacyActivities && !hasInstancePlan)) {
      return res.status(400).json({
        success: false,
        message: "plan with activityInstances or selectedActivities array required",
      });
    }
    if (!progress || typeof progress !== "object") {
      return res.status(400).json({ success: false, message: "progress object required" });
    }

    const row = await upsertExerciseDayForUser(userId, date, plan, progress);
    return res.json({
      success: true,
      data: {
        date,
        plan: row.planJson,
        progress: row.progressJson,
        updatedAt: row.updatedAt,
      },
    });
  } catch (err) {
    if (err.message === "invalid_date") {
      return res.status(400).json({ success: false, message: "Invalid date (use YYYY-MM-DD)" });
    }
    console.error("putExerciseDay error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

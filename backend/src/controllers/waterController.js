import * as waterService from "../services/waterService.js";

export const getWaterToday = async (req, res) => {
  try {
    const userId = req.user.id;
    const day = req.query.day;
    if (!day || typeof day !== "string") {
      return res.status(400).json({ message: "Query ?day=YYYY-MM-DD is required" });
    }
    const summary = await waterService.getWaterSummaryForDay(userId, day);
    res.json(summary);
  } catch (err) {
    console.error("getWaterToday:", err);
    res.status(400).json({ message: err.message || "Bad request" });
  }
};

export const postWaterLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amountMl, day } = req.body || {};
    if (!day) {
      return res.status(400).json({ message: "day (YYYY-MM-DD) is required" });
    }
    const summary = await waterService.addWaterLogEntry(userId, amountMl, day);
    res.json(summary);
  } catch (err) {
    console.error("postWaterLog:", err);
    res.status(400).json({ message: err.message || "Bad request" });
  }
};

export const deleteWaterLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logId = parseInt(req.params.id, 10);
    if (!Number.isFinite(logId)) {
      return res.status(400).json({ message: "Invalid log id" });
    }
    const summary = await waterService.deleteWaterLogEntry(userId, logId);
    res.json(summary);
  } catch (err) {
    console.error("deleteWaterLog:", err);
    if (err.message === "Log not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(400).json({ message: err.message || "Bad request" });
  }
};

/** GET ?year=2026&month=4 → { "2026-04-01": 500, ... } ยอดรวม ml ต่อวัน */
export const getWaterMonth = async (req, res) => {
  try {
    const userId = req.user.id;
    const year = req.query.year;
    const month = req.query.month;
    if (year === undefined || month === undefined) {
      return res.status(400).json({ message: "Query ?year=&month= (1–12) is required" });
    }
    const totals = await waterService.getWaterTotalsForMonth(userId, year, month);
    res.json(totals);
  } catch (err) {
    console.error("getWaterMonth:", err);
    res.status(400).json({ message: err.message || "Bad request" });
  }
};

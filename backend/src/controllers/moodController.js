// 
import {
  fetchMoodsByMonth,
  fetchTodayMood,
  upsertMood,
} from "../services/moodService.js";

// GET /month
export const getMoodsByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    const moods = await fetchMoodsByMonth(userId, month, year);

    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch moods" });
  }
};

// GET /today
export const getTodayMood = async (req, res) => {
  try {
    const userId = req.user.id;

    const mood = await fetchTodayMood(userId);

    res.json(mood || null);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch today mood" });
  }
};

// POST /
export const createOrUpdateMood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mood, date } = req.body;

    const result = await upsertMood(userId, date, mood);

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to save mood" });
  }
};
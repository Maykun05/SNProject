import {setMoodService, getMoodByMonthService, getTodayMoodService } from "../services/moodService.js";

export const setMood = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user); 
    const userId = req.user.id;
    const { mood, date } = req.body;

    const result = await setMoodService(userId, mood, date);

    res.json(result);
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMoodByMonth = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const result = await getMoodByMonthService(
      userId,
      Number(month),
      Number(year)
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTodayMood = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getTodayMoodService(userId);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
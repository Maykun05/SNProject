import { addCalorieLog, fetchTodayCalories } from '../services/calorieService.js';

export const logCalorie = async (req, res) => {
  try {
    const { name, calories, amount } = req.body;
    const result = await addCalorieLog(req.userId, name, calories, amount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTodayCalories = async (req, res) => {
  try {
    const result = await fetchTodayCalories(req.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const db = require('../db');

exports.addFoodLog = async (req, res) => {
  const { user_id, food_name, kcal, quantity } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO food_logs (user_id, food_name, kcal, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, food_name, kcal, quantity]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFoodToday = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM food_logs WHERE user_id = $1 AND DATE(log_time) = CURRENT_DATE`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
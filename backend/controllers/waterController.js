const db = require('../db');

exports.addWaterLog = async (req, res) => {
  const { user_id, amount } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO water_logs (user_id, amount) VALUES ($1, $2) RETURNING *',
      [user_id, amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWaterToday = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(
      `SELECT SUM(amount) as total FROM water_logs WHERE user_id = $1 AND DATE(log_time) = CURRENT_DATE`,
      [userId]
    );
    res.json({ total: result.rows[0].total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
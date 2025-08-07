const db = require('../db');

exports.addStepLog = async (req, res) => {
  const { user_id, steps } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO step_logs (user_id, steps) VALUES ($1, $2) RETURNING *',
      [user_id, steps]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStepToday = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM step_logs WHERE user_id = $1 AND DATE(log_time) = CURRENT_DATE`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
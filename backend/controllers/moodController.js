const db = require('../db');

exports.addMoodLog = async (req, res) => {
  const { user_id, mood, note } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO mood_logs (user_id, mood, note) VALUES ($1, $2, $3) RETURNING *',
      [user_id, mood, note]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMoodToday = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM mood_logs WHERE user_id = $1 AND DATE(log_time) = CURRENT_DATE`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
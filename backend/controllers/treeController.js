const db = require('../db');

exports.getTreeStatus = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM tree_growth WHERE user_id = $1',
      [req.params.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTreeExp = async (req, res) => {
  const { userId } = req.params;
  const { expGain } = req.body; // ส่ง exp ที่จะเพิ่มมา

  try {
    const current = await db.query('SELECT * FROM tree_growth WHERE user_id = $1', [userId]);
    const currentExp = current.rows[0].exp + expGain;
    const newLevel = Math.min(Math.floor(currentExp / 5), 4); // เติบโตทุก 5 EXP, สูงสุด LV 4

    const result = await db.query(
      'UPDATE tree_growth SET exp = $1, level = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 RETURNING *',
      [currentExp, newLevel, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
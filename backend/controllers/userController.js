const db = require('../db');

exports.createUser = async (req, res) => {
  const { email, password, name, weight } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO users (email, password, name, weight) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, password, name, weight]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    // ตรวจสอบว่ามี user จริงหรือไม่
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    // แยก error กรณี connection issue
    if (err.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Database unavailable' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
  
};
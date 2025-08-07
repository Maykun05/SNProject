const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/user');
const waterRoutes = require('./routes/water');
const moodRoutes = require('./routes/mood');
const foodRoutes = require('./routes/food');
const stepRoutes = require('./routes/step');
const treeRoutes = require('./routes/tree');

const app = express();
app.use(cors());
app.use(express.json());

// เพิ่มหลังจากประกาศ app
app.get('/api/health', async (req, res) => {
  try {
    // ทดสอบ query ง่ายๆ
    const result = await pool.query('SELECT 1 AS status');
    res.json({
      status: 'healthy',
      database: 'connected',
      testQuery: result.rows[0].status
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});
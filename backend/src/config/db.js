const { Pool } = require('pg');
require('dotenv').config();

// แสดงค่า environment สำหรับ debug
console.log('[ENV] DB_HOST:', process.env.DB_HOST);
console.log('[ENV] DB_PORT:', process.env.DB_PORT);
console.log('[ENV] DB_USER:', process.env.DB_USER);
console.log('[ENV] DB_NAME:', process.env.DB_NAME);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432', 10)
});

// วิธีที่ปลอดภัยกว่าในการทดสอบ connection
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    const res = await client.query('SELECT NOW()');
    console.log('📅 PostgreSQL time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Connection error:', err.stack);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
};

testConnection();

module.exports = pool;
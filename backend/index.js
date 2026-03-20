const express = require('express');
const cors = require('cors');
require('dotenv').config(); // ตรวจสอบว่ามีบรรทัดนี้เพื่อดึงค่าจาก .env

const app = express();
const apiRoutes = require('./routes/api');

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api', apiRoutes); 

app.get('/', (req, res) => {
    res.send('Health Tracking API is running...');
});

// --- Server Setup ---
// เปลี่ยนจาก process.env.PORT เป็นชื่อที่ตรงกับใน .env ของคุณ (ใน .env คุณใช้ PORT=4000)
const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
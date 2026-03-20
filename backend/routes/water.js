const express = require('express');
const router = express.Router();
// เปลี่ยนชื่อจาก controller เป็น waterController ให้ตรงกับด้านล่าง
const waterController = require('../controllers/waterController'); 

router.post('/log', waterController.addWaterLog); // เพิ่ม /log เพื่อให้ตรงกับ API Path
router.get('/:userId', waterController.getWaterToday); 

module.exports = router;
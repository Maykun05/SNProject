const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// เปลี่ยนจาก createUser เป็น register ให้ตรงกับ controller
router.post('/register', userController.register); 

// เปลี่ยนจาก getUser เป็น getUserProfile ให้ตรงกับ controller
router.get('/:id', userController.getUserProfile); 

module.exports = router;
const express = require('express');
const router = express.Router();

// นำเข้า Router ย่อยที่คุณมีอยู่แล้ว
const userRouter = require('./user');
const waterRouter = require('./water');
const foodRouter = require('./food');
const stepRouter = require('./step');
const moodRouter = require('./mood');
const treeRouter = require('./tree');

// กำหนด Path สำหรับแต่ละฟีเจอร์
router.use('/users', userRouter);
router.use('/water', waterRouter);
router.use('/food', foodRouter);
router.use('/steps', stepRouter);
router.use('/mood', moodRouter);
router.use('/tree', treeRouter);

module.exports = router;
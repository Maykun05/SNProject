const express = require('express');
const router = express.Router();
const controller = require('../controllers/waterController');

router.post('/', controller.addWaterLog);
router.get('/:userId', controller.getWaterToday);

module.exports = router;
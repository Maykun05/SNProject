const express = require('express');
const router = express.Router();
const controller = require('../controllers/waterController');

router.post('/', waterController.addWaterLog);
router.get('/:userId', controller.getWaterToday);

module.exports = router;
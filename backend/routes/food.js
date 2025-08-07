const express = require('express');
const router = express.Router();
const controller = require('../controllers/foodController');

router.post('/', controller.addFoodLog);
router.get('/:userId', controller.getFoodToday);

module.exports = router;
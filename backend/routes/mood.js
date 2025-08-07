const express = require('express');
const router = express.Router();
const controller = require('../controllers/moodController');

router.post('/', controller.addMoodLog);
router.get('/:userId', controller.getMoodToday);

module.exports = router;
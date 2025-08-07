const express = require('express');
const router = express.Router();
const controller = require('../controllers/stepController');

router.post('/', controller.addStepLog);
router.get('/:userId', controller.getStepToday);

module.exports = router;
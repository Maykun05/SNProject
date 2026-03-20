const express = require('express');
const router = express.Router();
// แนะนำให้เปลี่ยนชื่อตัวแปรให้ชัดเจนเพื่อป้องกันสับสน
const stepController = require('../controllers/stepController'); 

router.post('/', stepController.addStepLog); 
router.get('/:userId', stepController.getStepToday); 

module.exports = router;
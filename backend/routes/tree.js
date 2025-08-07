const express = require('express');
const router = express.Router();
const controller = require('../controllers/treeController');

router.get('/:userId', controller.getTreeStatus);
router.patch('/:userId', controller.updateTreeExp);

module.exports = router;
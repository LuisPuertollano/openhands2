const express = require('express');
const ChangeLogController = require('../controllers/change_log_controller');

const router = express.Router();

router.get('/', ChangeLogController.getAll);
router.get('/date-range', ChangeLogController.getByDateRange);
router.get('/:entityType/:entityId', ChangeLogController.getByEntity);

module.exports = router;

const express = require('express');
const ReportController = require('../controllers/report_controller');

const router = express.Router();

router.get('/capacity/excel', ReportController.exportCapacityExcel);
router.get('/capacity/pdf', ReportController.exportCapacityPDF);
router.get('/budget/excel', ReportController.exportBudgetExcel);
router.get('/budget/pdf', ReportController.exportBudgetPDF);
router.get('/rams-distribution/excel', ReportController.exportRAMSDistributionExcel);

module.exports = router;

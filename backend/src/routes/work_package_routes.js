const express = require('express');
const WorkPackageController = require('../controllers/work_package_controller');

const router = express.Router();

router.get('/', WorkPackageController.getAll);
router.get('/budget-status', WorkPackageController.getAllBudgetStatus);
router.get('/project/:projectId', WorkPackageController.getByProject);
router.get('/:id', WorkPackageController.getById);
router.get('/:id/budget-status', WorkPackageController.getBudgetStatus);
router.post('/', WorkPackageController.create);
router.put('/:id', WorkPackageController.update);
router.delete('/:id', WorkPackageController.delete);

module.exports = router;

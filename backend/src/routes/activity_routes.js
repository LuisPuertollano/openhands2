const express = require('express');
const ActivityController = require('../controllers/activity_controller');

const router = express.Router();

router.get('/', ActivityController.getAll);
router.get('/resource/:resourceId', ActivityController.getByResource);
router.get('/work-package/:workPackageId', ActivityController.getByWorkPackage);
router.get('/:id', ActivityController.getById);
router.post('/', ActivityController.create);
router.put('/:id', ActivityController.update);
router.delete('/:id', ActivityController.delete);

module.exports = router;

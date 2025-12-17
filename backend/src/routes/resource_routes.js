const express = require('express');
const ResourceController = require('../controllers/resource_controller');

const router = express.Router();

router.get('/', ResourceController.getAll);
router.get('/capacity', ResourceController.getAllCapacity);
router.get('/:id', ResourceController.getById);
router.get('/:id/capacity', ResourceController.getCapacity);
router.post('/', ResourceController.create);
router.put('/:id', ResourceController.update);
router.delete('/:id', ResourceController.delete);

module.exports = router;

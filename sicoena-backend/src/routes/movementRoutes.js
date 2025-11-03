const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const movementController = require('../controllers/movementController');

router.get('/', authMiddleware, movementController.getAllMovements);
router.get('/:id', authMiddleware, movementController.getMovementById);
router.post('/', authMiddleware, movementController.createMovement);
router.put('/:id', authMiddleware, movementController.updateMovement);
router.delete('/:id', authMiddleware, movementController.deleteMovement);

module.exports = router;
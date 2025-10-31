const express = require('express');
const movementController = require('../controllers/movementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/hoy', protect, movementController.getMovementsToday);

// Otras rutas...
router.get('/', protect, movementController.getMovementHistory);
router.post('/', protect, movementController.createMovement);

module.exports = router;
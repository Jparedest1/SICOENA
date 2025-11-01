// src/routes/movementRoutes.js

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const movementController = require('../controllers/movementController');

router.get('/', authMiddleware, movementController.getAllMovements);

// Obtener movimiento por ID
router.get('/:id', authMiddleware, movementController.getMovementById);

// Crear movimiento
router.post('/', authMiddleware, movementController.createMovement);

// Actualizar movimiento
router.put('/:id', authMiddleware, movementController.updateMovement);

// Eliminar movimiento
router.delete('/:id', authMiddleware, movementController.deleteMovement);

module.exports = router;
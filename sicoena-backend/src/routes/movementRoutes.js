// sicoena-backend/src/routes/movementRoutes.js
const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// --- Rutas Públicas (con autenticación) ---

// Obtener movimientos del día
router.get('/hoy', protect, movementController.getMovementsToday);

// Obtener historial de movimientos
router.get('/historial', protect, movementController.getMovementHistory);

// --- Rutas de Escritura ---

// Crear nuevo movimiento (entrada o salida)
router.post('/', protect, movementController.createMovement);

module.exports = router;
// src/routes/ordenRoutes.js
const express = require('express');
const ordenController = require('../controllers/ordenController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Crear nueva orden (sin protección para que funcione desde el modal)
router.post('/', ordenController.createOrder);

// Obtener todas las órdenes (protegido)
router.get('/', protect, ordenController.getAllOrders);

// Obtener orden específica (protegido)
router.get('/:id', protect, ordenController.getOrderById);

// Actualizar estado de orden (protegido)
router.put('/:id/status', protect, restrictTo('Administrador'), ordenController.updateOrderStatus);

module.exports = router;
// sicoena-backend/src/routes/bodegaRoutes.js
const express = require('express');
const router = express.Router();
const bodegaController = require('../controllers/bodegaController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// GET - Obtener todas las bodegas
router.get('/', protect, bodegaController.getAllBodegas);

// POST - Crear nueva bodega
router.post('/', protect, restrictTo('Administrador'), bodegaController.createBodega);

module.exports = router;
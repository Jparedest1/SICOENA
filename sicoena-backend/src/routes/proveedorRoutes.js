// sicoena-backend/src/routes/proveedorRoutes.js
const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// GET - Obtener todos los proveedores
router.get('/', protect, proveedorController.getAllProveedores);

// POST - Crear nuevo proveedor
router.post('/', protect, restrictTo('Administrador'), proveedorController.createProveedor);

module.exports = router;
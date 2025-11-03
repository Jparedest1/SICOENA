const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, proveedorController.getAllProveedores);
router.post('/', protect, restrictTo('Administrador'), proveedorController.createProveedor);

module.exports = router;
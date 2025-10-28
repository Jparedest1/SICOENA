// src/routes/productRoutes.js
const express = require('express');
const productController = require('../controllers/productController'); // Asegúrate de crear este archivo
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Middleware de seguridad

const router = express.Router();

router.get('/categorias', protect, productController.getProductCategories);
// GET /api/producto - Obtener todos los productos (con filtros)
router.get('/', protect, productController.getAllProducts);

// POST /api/producto - Crear un nuevo producto
router.post('/', protect, restrictTo('Administrador'), productController.createProduct);

// PUT /api/producto/:id - Actualizar un producto existente
router.put('/:id', protect, restrictTo('Administrador'), productController.updateProduct);

// PUT /api/producto/:id/status - Cambiar el estado (ACTIVO/INACTIVO)
router.put('/:id/status', protect, restrictTo('Administrador'), productController.updateProductStatus);

// GET /api/producto/:id - (Opcional) Obtener un producto específico por ID
// router.get('/:id', protect, productController.getProductById);

module.exports = router;
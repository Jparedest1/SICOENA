const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/active-menus', productController.getActiveMenus);
router.get('/menu/:menuId', productController.getMenuProducts);
router.get('/categorias', protect, productController.getProductCategories);
router.get('/', protect, productController.getAllProducts);
router.post('/', protect, restrictTo('Administrador'), productController.createProduct);
router.put('/:id', protect, restrictTo('Administrador'), productController.updateProduct);
router.put('/:id/status', protect, restrictTo('Administrador'), productController.updateProductStatus);

module.exports = router;
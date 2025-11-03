const express = require('express');
const ordenController = require('../controllers/ordenController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', ordenController.createOrder);
router.put('/:id', ordenController.updateOrder);
router.patch('/:id/status', ordenController.updateOrderStatus);
router.get('/', protect, ordenController.getAllOrders);
router.get('/:id', protect, ordenController.getOrderById);
router.put('/:id/status', protect, restrictTo('Administrador'), ordenController.updateOrderStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const bodegaController = require('../controllers/bodegaController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, bodegaController.getAllBodegas);
router.post('/', protect, restrictTo('Administrador'), bodegaController.createBodega);

module.exports = router;
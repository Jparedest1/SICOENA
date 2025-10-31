const express = require('express');
const userRoutes = require('./userRoutes');
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const institutionRoutes = require('./institutionRoutes');
const productRoutes = require('./productRoutes');
const movementRoutes = require('./movementRoutes');
const authRoutes = require('./authRoutes');
const proveedorRoutes = require('./proveedorRoutes');
const bodegaRoutes = require('./bodegaRoutes');
const settingsRoutes = require('./settingsRoutes');
const ordenRoutes = require('./ordenRoutes');

const router = express.Router();

router.use('/usuario', userRoutes);
router.use('/auth', authRoutes);
router.use('/institucion', institutionRoutes);
router.use('/producto', productRoutes);
router.use('/movimientos', movementRoutes);
router.use('/proveedor', proveedorRoutes);
router.use('/bodega', bodegaRoutes);
router.use('/settings', settingsRoutes);
router.use('/orden', ordenRoutes);
router.get('/dashboard/stats', protect, dashboardController.getStats);

module.exports = router;
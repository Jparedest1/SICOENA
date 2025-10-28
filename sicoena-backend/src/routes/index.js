// sicoena-backend/src/routes/index.js
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

const router = express.Router();

router.use('/usuario', userRoutes);
router.use('/auth', authRoutes);
router.use('/institucion', institutionRoutes);
router.use('/producto', productRoutes);
router.use('/movimientos', movementRoutes);
router.use('/proveedor', proveedorRoutes);
router.use('/bodega', bodegaRoutes);
router.get('/dashboard/stats', protect, dashboardController.getStats);

module.exports = router;
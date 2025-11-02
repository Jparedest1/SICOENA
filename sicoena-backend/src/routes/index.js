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
const notificationRoutes = require('./notificationRoutes');

// 1. Importa las nuevas rutas de respaldos
const backupRoutes = require('./backupRoutes'); 

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
router.use('/notificaciones', notificationRoutes);
router.use('/reportes', require('./reportesRoutes'));

// 2. Añade las nuevas rutas para la gestión de respaldos
// Monta las operaciones principales (listar, crear, borrar, etc.) en /respaldos
router.use('/respaldos', backupRoutes);
// Monta solo las operaciones de configuración en /settings/respaldos para que coincida con el frontend
router.use('/settings/respaldos', backupRoutes);


module.exports = router;
// src/routes/index.js
const express = require('express');
const userRoutes = require('./userRoutes');
const dashboardController = require('../controllers/dashboardController'); // Crea este archivo
const { protect } = require('../middleware/authMiddleware'); // Proteger la ruta
const institutionRoutes = require('./institutionRoutes'); // Importa otras rutas aquí
const productRoutes = require('./productRoutes');
// const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes'); // Rutas para login

const router = express.Router();

router.use('/usuario', userRoutes);
router.use('/auth', authRoutes); // Monta las rutas de autenticación en /api/auth
router.use('/institucion', institutionRoutes);
router.use('/producto', productRoutes);
// router.use('/ordenes', orderRoutes);
router.get('/dashboard/stats', protect, dashboardController.getStats);

module.exports = router;
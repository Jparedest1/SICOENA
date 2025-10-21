// src/routes/index.js
const express = require('express');
const userRoutes = require('./userRoutes');
// const institutionRoutes = require('./institutionRoutes'); // Importa otras rutas aquí
// const productRoutes = require('./productRoutes');
// const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes'); // Rutas para login

const router = express.Router();

router.use('/usuarios', userRoutes);
router.use('/auth', authRoutes); // Monta las rutas de autenticación en /api/auth
// router.use('/instituciones', institutionRoutes);
// router.use('/productos', productRoutes);
// router.use('/ordenes', orderRoutes);

module.exports = router;
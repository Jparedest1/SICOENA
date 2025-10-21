// src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Ruta para login (POST /api/auth/login)
router.post('/login', authController.login);

// --- AÑADE ESTA LÍNEA ---
// Ruta para verificar el token de Google (POST /api/auth/google/verify)
router.post('/google/verify', authController.googleVerify); // Asegúrate de crear esta función en el controlador

// Aquí podrías añadir rutas para /register, /forgot-password, etc.

module.exports = router;
// src/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Ruta para login (POST /api/auth/login)
router.post('/login', authController.login);

// Aquí podrías añadir rutas para /register, /forgot-password, etc.
// Y la ruta para el callback de Google OAuth

module.exports = router;
// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Importa los middlewares

const router = express.Router();

// Ahora, para acceder a GET /api/usuarios, se requiere un token válido
router.get('/', protect, userController.getAllUsers);

// Para crear un usuario, requiere token Y ser Administrador
router.post('/', protect, restrictTo('Administrador'), userController.createUser);

// Añade protect (y restrictTo si es necesario) a las demás rutas

module.exports = router;
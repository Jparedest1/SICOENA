// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ PRIMERO - Ruta específica SIN protección (para el formulario de órdenes)
router.get('/active', userController.getActiveUsers);

// ✅ DESPUÉS - Rutas genéricas CON protección
router.get('/', protect, userController.getAllUsers);

// Ruta POST para crear un usuario
router.post('/', protect, restrictTo('Administrador'), userController.createUser);

// Ruta PUT para actualizar (editar) usuario
router.put('/:id', protect, restrictTo('Administrador'), userController.updateUser); 

// Ruta PUT para actualizar solo el estado (soft delete)
router.put('/:userId/status', protect, restrictTo('Administrador'), userController.updateUserStatus);

module.exports = router;
// src/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Ruta GET para obtener todos los usuarios
router.get('/', protect, userController.getAllUsers);

// Ruta POST para crear un usuario
router.post('/', protect, restrictTo('Administrador'), userController.createUser);

// --- AÑADE ESTA RUTA PARA ACTUALIZAR (EDITAR) ---
// El ':id' en la ruta captura el ID del usuario desde la URL (req.params.id)
router.put('/:id', protect, restrictTo('Administrador'), userController.updateUser); 
//                                                        ^^^^^^^^^^^^^^ Asegúrate de tener esta función

// Ruta PUT para actualizar solo el estado (soft delete)
router.put('/:userId/status', protect, restrictTo('Administrador'), userController.updateUserStatus);

// (Puedes añadir GET /:id para obtener un usuario específico si lo necesitas)

module.exports = router;
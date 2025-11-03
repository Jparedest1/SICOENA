// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

console.log('📋 Cargando userRoutes');
console.log('📋 userController funciones:', Object.keys(userController));

// ✅ Obtener todos los usuarios (Autenticado + Admin)
router.get('/', 
  authMiddleware, 
  roleMiddleware(['ADMINISTRADOR']),  // ✅ EN MAYÚSCULAS
  userController.getAllUsers
);

// ✅ Obtener usuario por ID (Autenticado)
router.get('/:id', 
  authMiddleware, 
  userController.getUserById
);

// ✅ Crear usuario (Autenticado + Admin)
router.post('/', 
  authMiddleware, 
  roleMiddleware(['ADMINISTRADOR']),
  userController.createUser
);

// ✅ Actualizar usuario (Autenticado)
router.put('/:id', 
  authMiddleware, 
  userController.updateUser
);

// ✅ Actualizar estado (Autenticado + Admin)
router.put('/:id/status', 
  authMiddleware, 
  roleMiddleware(['ADMINISTRADOR']),
  userController.updateUserStatus
);

// ✅ Eliminar usuario (Autenticado + Admin)
router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['ADMINISTRADOR']),
  userController.deleteUser
);

//router.patch('/change-password', authMiddleware, userController.changePassword);
module.exports = router;
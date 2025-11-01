const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// ✅ Obtener todos los usuarios (Solo ADMINISTRADOR)
router.get('/', authMiddleware, roleMiddleware(['ADMINISTRADOR']), userController.getAllUsers);

// ✅ Obtener usuario por ID
router.get('/:id', authMiddleware, userController.getUserById);

// ✅ Crear usuario (Solo ADMINISTRADOR)
router.post('/', authMiddleware, roleMiddleware(['ADMINISTRADOR']), userController.createUser);

// ✅ Actualizar usuario
router.put('/:id', authMiddleware, userController.updateUser);

// ✅ Eliminar usuario (Solo ADMINISTRADOR)
router.delete('/:id', authMiddleware, roleMiddleware(['ADMINISTRADOR']), userController.deleteUser);

module.exports = router;
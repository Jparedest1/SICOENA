const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

console.log('Cargando userRoutes');
console.log('userController funciones:', Object.keys(userController));

router.get('/', 
  authMiddleware, 
  roleMiddleware(['ADMINISTRADOR']),  
  userController.getAllUsers
);

router.get('/:id', 
  authMiddleware, 
  userController.getUserById
);

router.post('/', 
  authMiddleware, 
  roleMiddleware(['ADMINISTRADOR']),
  userController.createUser
);

router.put('/:id', 
  authMiddleware, 
  userController.updateUser
);

router.put('/:id/status', 
  authMiddleware, 
  roleMiddleware(['ADMINISTRADOR']),
  userController.updateUserStatus
);

router.delete('/:id', 
  authMiddleware, 
  roleMiddleware(['ADMINISTRADOR']),
  userController.deleteUser
);

module.exports = router;
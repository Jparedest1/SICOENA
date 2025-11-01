// src/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// ✅ Obtener notificaciones del usuario autenticado
router.get('/', authMiddleware, notificationController.getNotifications);

// ✅ Marcar una notificación como leída
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

// ✅ Marcar todas como leídas
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

module.exports = router;
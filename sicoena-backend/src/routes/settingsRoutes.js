// sicoena-backend/src/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// GET - Obtener todas las configuraciones
router.get('/', protect, settingsController.getAllSettings);

// GET - Obtener configuraciones por sección
router.get('/seccion/:section', protect, settingsController.getSettingsBySection);

// GET - Obtener configuración individual
router.get('/clave/:key', protect, settingsController.getSingleSetting);

// PUT - Actualizar configuraciones por sección (solo Administrador)
router.put('/seccion/:section', protect, restrictTo('Administrador'), settingsController.updateSettings);

// PUT - Actualizar configuración individual (solo Administrador)
router.put('/clave/:key', protect, restrictTo('Administrador'), settingsController.updateSingleSetting);

module.exports = router;
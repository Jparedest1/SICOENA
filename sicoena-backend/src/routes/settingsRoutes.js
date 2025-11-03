const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, settingsController.getAllSettings);
router.get('/seccion/:section', protect, settingsController.getSettingsBySection);
router.get('/clave/:key', protect, settingsController.getSingleSetting);
router.put('/seccion/:section', protect, restrictTo('Administrador'), settingsController.updateSettings);
router.put('/clave/:key', protect, restrictTo('Administrador'), settingsController.updateSingleSetting);

module.exports = router;
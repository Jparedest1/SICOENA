// sicoena-backend/src/routes/backupRoutes.js
const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { protect } = require('../middleware/authMiddleware'); // 1. Importa el middleware 'protect'

// --- Rutas para /api/respaldos y /api/settings/respaldos ---

router.get('/', (req, res, next) => {
    if (req.originalUrl.includes('/settings')) {
        return backupController.getBackupSettings(req, res, next);
    }
    return backupController.getBackups(req, res, next);
});

router.post('/', (req, res, next) => {
    if (req.originalUrl.includes('/settings')) {
        // 2. Protege la ruta para guardar la configuración
        return protect(req, res, () => backupController.saveBackupSettings(req, res, next));
    }
    // 3. Protege la ruta para crear un respaldo
    return protect(req, res, () => backupController.createBackup(req, res, next));
});


// --- Rutas para un Respaldo Específico ---

// 4. Protege el resto de las acciones
router.post('/:id/restore', protect, backupController.restoreBackup);
router.get('/:id/download', protect, backupController.downloadBackup);
router.delete('/:id', protect, backupController.deleteBackup);


module.exports = router;
const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { protect } = require('../middleware/authMiddleware'); 

router.get('/', (req, res, next) => {
    if (req.originalUrl.includes('/settings')) {
        return backupController.getBackupSettings(req, res, next);
    }
    return backupController.getBackups(req, res, next);
});

router.post('/', (req, res, next) => {
    if (req.originalUrl.includes('/settings')) {
        
        return protect(req, res, () => backupController.saveBackupSettings(req, res, next));
    }
    
    return protect(req, res, () => backupController.createBackup(req, res, next));
});

router.post('/:id/restore', protect, backupController.restoreBackup);
router.get('/:id/download', protect, backupController.downloadBackup);
router.delete('/:id', protect, backupController.deleteBackup);


module.exports = router;
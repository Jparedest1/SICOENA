const express = require('express');
const institutionController = require('../controllers/institutionController');
const { authMiddleware, roleMiddleware, protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/active', institutionController.getActiveSchools);
router.get('/', authMiddleware, institutionController.getAllSchools);
router.post('/', authMiddleware, roleMiddleware(['Administrador']), institutionController.createSchool);
router.put('/:id', authMiddleware, roleMiddleware(['Administrador']), institutionController.updateSchool);
router.put('/:id/status', authMiddleware, roleMiddleware(['Administrador']), institutionController.updateSchoolStatus);

module.exports = router;
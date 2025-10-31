const express = require('express');
const schoolController = require('../controllers/institutionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/active', schoolController.getActiveSchools);
router.get('/', protect, schoolController.getAllSchools);
router.post('/', protect, restrictTo('Administrador'), schoolController.createSchool);
router.put('/:id', protect, restrictTo('Administrador'), schoolController.updateSchool);
router.put('/:id/status', protect, restrictTo('Administrador'), schoolController.updateSchoolStatus);

module.exports = router;
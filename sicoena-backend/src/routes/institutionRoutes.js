const express = require('express');
const institutionController = require('../controllers/institutionController');
const { authMiddleware, roleMiddleware, protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Obtener escuelas activas (SIN protección)
router.get('/active', institutionController.getActiveSchools);

// ✅ Obtener todas las escuelas (CON protección)
router.get('/', authMiddleware, institutionController.getAllSchools);

// ✅ Crear escuela (CON protección - Solo Admin)
router.post('/', authMiddleware, roleMiddleware(['Administrador']), institutionController.createSchool);

// ✅ Actualizar escuela (CON protección - Solo Admin)
router.put('/:id', authMiddleware, roleMiddleware(['Administrador']), institutionController.updateSchool);

// ✅ Actualizar estado de escuela (CON protección - Solo Admin)
router.put('/:id/status', authMiddleware, roleMiddleware(['Administrador']), institutionController.updateSchoolStatus);

module.exports = router;
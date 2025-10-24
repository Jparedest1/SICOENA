// src/routes/institutionRoutes.js
const express = require('express');
const schoolController = require('../controllers/institutionController'); // Crea este controlador
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/escuela (con filtros: search, tipo, ubicacion, estado)
router.get('/', protect, schoolController.getAllSchools);

// POST /api/escuela (para crear)
router.post('/', protect, restrictTo('Administrador'), schoolController.createSchool);

// PUT /api/escuela/:id (para editar)
router.put('/:id', protect, restrictTo('Administrador'), schoolController.updateSchool);

// PUT /api/escuela/:id/status (para cambiar estado ACTIVO/INACTIVO)
router.put('/:id/status', protect, restrictTo('Administrador'), schoolController.updateSchoolStatus);

// GET /api/escuela/:id (Opcional: para obtener una sola escuela)
// router.get('/:id', protect, schoolController.getSchoolById);

module.exports = router;
const express = require('express');
const router = express.Router();
const { generarReporte } = require('../controllers/reportesController');
const authMiddleware = require('../middleware/authMiddleware');

// La ruta ahora usará la función 'generarReporte' que hemos extraído.
// Esto garantiza que no sea 'undefined'.
router.get('/:modulo', generarReporte);

module.exports = router;
const express = require('express');
const router = express.Router();
const { generarReporte } = require('../controllers/reportesController');

// --- CAMBIO CLAVE: Usa desestructuración { } para obtener la función ---
const { authMiddleware } = require('../middleware/authMiddleware');

// Ahora 'authMiddleware' es la función correcta y Express no dará error.
// Esta línea ya debería funcionar sin problemas.
router.get('/:modulo', authMiddleware, generarReporte);

module.exports = router;
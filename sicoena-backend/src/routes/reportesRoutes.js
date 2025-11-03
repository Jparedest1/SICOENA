const express = require('express');
const router = express.Router();
const { generarReporte } = require('../controllers/reportesController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/:modulo/:id', authMiddleware, generarReporte);
router.get('/:modulo', authMiddleware, generarReporte);

module.exports = router;
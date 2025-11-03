const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/logController');

const { protect, restrictTo } = require('../middleware/authMiddleware'); 

router.get('/', protect, restrictTo('Administrador'), getLogs);

module.exports = router;
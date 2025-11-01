// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// ✅ MIDDLEWARE 1: Autenticación (verificar token)
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// ✅ MIDDLEWARE 2: Protección por rol
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Rol insuficiente.',
        userRole: req.user.rol,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

// ✅ MIDDLEWARE 3: Versión antigua (si algunos archivos la usan)
const protect = authMiddleware;

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: 'Acceso denegado.',
        userRole: req.user.rol,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

// ✅ EXPORTAR TODOS LOS MIDDLEWARES
module.exports = {
  authMiddleware,
  roleMiddleware,
  protect,
  restrictTo
};
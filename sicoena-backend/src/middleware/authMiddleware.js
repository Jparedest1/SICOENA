// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// ✅ MIDDLEWARE 1: Verificar que el usuario esté autenticado
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    console.log('✅ Token verificado:', {
      userId: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      rolNormalizado: (decoded.rol || '').toUpperCase()
    });
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Error en authMiddleware:', error.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// ✅ MIDDLEWARE 2: Verificar que el usuario tenga el rol requerido
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // ✅ Normalizar el rol del usuario a mayúsculas
    const userRole = (req.user.rol || '').toUpperCase().trim();
    const normalizedAllowedRoles = (allowedRoles || []).map(role => 
      (role || '').toUpperCase().trim()
    );

    console.log('🔐 Verificación de rol:', {
      userRole: req.user.rol,
      userRoleNormalizado: userRole,
      allowedRoles: allowedRoles,
      normalizedAllowedRoles: normalizedAllowedRoles,
      hasAccess: normalizedAllowedRoles.includes(userRole)
    });

    if (!normalizedAllowedRoles.includes(userRole)) {
      console.log(`❌ Acceso denegado: rol ${userRole} no está en ${normalizedAllowedRoles}`);
      return res.status(403).json({ 
        message: 'Acceso denegado. Rol insuficiente.',
        userRole: req.user.rol,
        requiredRoles: allowedRoles
      });
    }

    console.log('✅ Acceso permitido');
    next();
  };
};

// ✅ MIDDLEWARE 3: Versiones antiguas (para compatibilidad)
const protect = authMiddleware;

const restrictTo = (...allowedRoles) => {
  return roleMiddleware(allowedRoles);
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  protect,
  restrictTo
};
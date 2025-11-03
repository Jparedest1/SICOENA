const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    console.log('Token recibido:', token.substring(0, 30) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

    console.log('Token verificado:', {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    });
        
    req.user = {
      id: decoded.id,           
      email: decoded.email,
      rol: decoded.rol,
      nombres: decoded.nombres,
      apellidos: decoded.apellidos
    };

    console.log('req.user asignado:', req.user);

    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('No user in request');
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const userRole = (req.user.rol || '').toUpperCase().trim();
    const normalizedAllowedRoles = (allowedRoles || []).map(role => 
      (role || '').toUpperCase().trim()
    );

    console.log('Verificación de rol:', {
      userRole: userRole,
      allowedRoles: normalizedAllowedRoles,
      hasAccess: normalizedAllowedRoles.includes(userRole)
    });

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Acceso denegado. Rol insuficiente.'
      });
    }

    next();
  };
};

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
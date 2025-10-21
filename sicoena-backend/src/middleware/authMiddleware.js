// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
  let token;

  // 1. Revisa si el token existe en el header 'Authorization'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Opcional: Podrías revisar también en cookies si usas ese método

  if (!token) {
    return res.status(401).json({ message: 'No autorizado. Token no encontrado.' });
  }

  try {
    // 2. Verifica el token usando el secreto
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. (Opcional pero recomendado) Verifica que el usuario del token aún existe y está activo
    const [users] = await db.query('SELECT id, rol, estado FROM usuarios WHERE id = ?', [decoded.userId]);

    if (users.length === 0 || users[0].estado !== 'ACTIVO') {
      return res.status(401).json({ message: 'No autorizado. Usuario no encontrado o inactivo.' });
    }

    // 4. Añade la información del usuario al objeto 'req' para usarla en los controladores
    req.user = { id: users[0].id, rol: users[0].rol };
    next(); // Pasa al siguiente middleware o al controlador

  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ message: 'No autorizado. Token inválido.' });
  }
};

// Middleware para restringir acceso por rol (ejemplo)
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
        }
        next();
    };
};
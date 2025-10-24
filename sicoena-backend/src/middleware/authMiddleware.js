// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado. Token no encontrado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- CORRECCIÓN AQUÍ ---
    // Usa 'id_usuario' en lugar de 'id' en la consulta y en la condición WHERE
    const [users] = await db.query(
      'SELECT id_usuario, rol, estado FROM usuario WHERE id_usuario = ?', // Selecciona y filtra por id_usuario
      [decoded.userId] // Asegúrate que el payload del JWT contenga el ID correcto
    );

    if (users.length === 0 || users[0].estado !== 'ACTIVO') {
      return res.status(401).json({ message: 'No autorizado. Usuario no encontrado o inactivo.' });
    }

    // --- CORRECCIÓN AQUÍ ---
    // Asigna el id_usuario al objeto req.user
    req.user = { id: users[0].id_usuario, rol: users[0].rol };
    next();

  } catch (error) {
    console.error('Error de autenticación:', error); // Muestra el error completo en consola
    // Si el error es específico de JWT (como expirado), da un mensaje más claro
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'No autorizado. Token inválido o expirado.' });
    }
    // Error genérico
    res.status(500).json({ message: 'Error interno del servidor durante la autenticación.' });
  }
};

// Middleware para restringir acceso por rol (sin cambios)
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.rol)) { // Añade chequeo de req.user por si acaso
            return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
        }
        next();
    };
};
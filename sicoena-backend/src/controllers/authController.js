// src/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    // 1. Buscar usuario por email
    const [users] = await db.query('SELECT * FROM usuario WHERE correo = ? AND estado = "ACTIVO"', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
    }

    const user = users[0];

    // 2. Comparar la contraseña enviada con el hash almacenado
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Si las credenciales son válidas, generar un token JWT
    const payload = {
      userId: user.id,
      rol: user.rol,
      // Puedes añadir más información no sensible si lo necesitas
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Actualizar última conexión (opcional, buena práctica)
    await db.query('UPDATE usuario SET ultima_conexion = NOW() WHERE id = ?', [user.id]);

    // 4. Enviar el token al cliente
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token: token,
      user: { // Envía información básica del usuario (sin contraseña)
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
      }
    });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: 'Error interno del servidor durante el login.' });
  }
};
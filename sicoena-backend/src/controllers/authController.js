// src/controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { createNotification } = require('./notificationController');

// ✅ LOGIN LOCAL
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    console.log('🔍 Intentando login con email:', email);

    // Buscar usuario en la BD
    const [users] = await db.query(
      `SELECT 
        id_usuario, 
        nombres, 
        apellidos,
        correo, 
        contraseña, 
        rol,
        estado 
      FROM usuario 
      WHERE correo = ?`,
      [email]
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const user = users[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.contraseña);

    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    if (user.estado !== 'ACTIVO') {
      console.log('❌ Usuario inactivo');
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    // ✅ NORMALIZAR ROL A MAYÚSCULAS
    const normalizedRole = (user.rol || 'USUARIO').toUpperCase().trim();

    console.log('👤 Usuario encontrado:', {
      id: user.id_usuario,
      email: user.correo,
      nombre: user.nombres,
      rolOriginal: user.rol,
      rolNormalizado: normalizedRole
    });

    // ✅ Generar token JWT CON EL ID CORRECTO
    const token = jwt.sign(
      {
        id: user.id_usuario,        // ✅ IMPORTANTE: id_usuario
        email: user.correo,
        rol: normalizedRole,
        nombres: user.nombres,
        apellidos: user.apellidos
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    console.log('✅ Token generado exitosamente');

    // Actualizar última conexión
    await db.query(
      'UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = ?',
      [user.id_usuario]
    );

    // ✅ Crear notificación de bienvenida (opcional)
    try {
      await createNotification(
        user.id_usuario,
        'Bienvenida',
        `Hola ${user.nombres}, has iniciado sesión exitosamente`,
        'login'
      );
    } catch (error) {
      console.log('⚠️ No se pudo crear notificación de bienvenida');
    }

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id_usuario,
        email: user.correo,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: normalizedRole
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ✅ GOOGLE VERIFY
const googleVerify = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token de Google es requerido' });
    }

    console.log('🔐 Verificando token de Google...');

    // Aquí verificarías el token con Google
    // Por ahora, asumimos que ya está verificado por el frontend

    // Buscar o crear usuario
    // Este es un ejemplo simplificado
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.email) {
      return res.status(401).json({ message: 'Token de Google inválido' });
    }

    // Buscar usuario existente
    const [users] = await db.query(
      'SELECT id_usuario, nombres, apellidos, correo, rol, estado FROM usuario WHERE correo = ?',
      [decoded.email]
    );

    let user;
    if (users.length === 0) {
      // Crear nuevo usuario
      console.log('📝 Creando nuevo usuario desde Google...');
      const nombres = decoded.name || decoded.email.split('@')[0];
      
      const [result] = await db.query(
        `INSERT INTO usuario (nombres, correo, rol, estado) 
         VALUES (?, ?, ?, 'ACTIVO')`,
        [nombres, decoded.email, 'USUARIO']
      );

      user = {
        id_usuario: result.insertId,
        nombres: nombres,
        apellidos: '',
        correo: decoded.email,
        rol: 'USUARIO',
        estado: 'ACTIVO'
      };

      console.log('✅ Usuario creado:', user.id_usuario);
    } else {
      user = users[0];
      console.log('✅ Usuario encontrado:', user.id_usuario);
    }

    if (user.estado !== 'ACTIVO') {
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    const normalizedRole = (user.rol || 'USUARIO').toUpperCase().trim();

    // Generar token JWT
    const appToken = jwt.sign(
      {
        id: user.id_usuario,
        email: user.correo,
        rol: normalizedRole,
        nombres: user.nombres,
        apellidos: user.apellidos
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    // Actualizar última conexión
    await db.query(
      'UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = ?',
      [user.id_usuario]
    );

    res.status(200).json({
      message: 'Login con Google exitoso',
      token: appToken,
      user: {
        id: user.id_usuario,
        email: user.correo,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: normalizedRole
      }
    });

  } catch (error) {
    console.error('❌ Error en googleVerify:', error);
    res.status(500).json({ message: 'Error en la autenticación con Google' });
  }
};

module.exports = {
  login,
  googleVerify
};
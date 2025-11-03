// src/controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { createNotification } = require('./notificationController');
const { createLog } = require('./logController');

// ✅ LOGIN LOCAL
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress; // Obtener la IP del solicitante

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const [users] = await db.query(
      `SELECT id_usuario, nombres, apellidos, correo, contraseña, rol, estado 
       FROM usuario WHERE correo = ?`,
      [email]
    );

    if (users.length === 0) {
      // 🪵 2. LOG: Usuario no encontrado
      await createLog('WARN', `Intento de login fallido: Usuario no encontrado`, { email, ip });
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.contraseña);

    if (!isPasswordValid) {
      // 🪵 3. LOG: Contraseña incorrecta
      await createLog('WARN', `Intento de login fallido: Contraseña incorrecta`, { userId: user.id_usuario, email, ip });
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    if (user.estado !== 'ACTIVO') {
      // 🪵 4. LOG: Usuario inactivo
      await createLog('WARN', `Intento de login bloqueado: Usuario inactivo`, { userId: user.id_usuario, email, ip });
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    const normalizedRole = (user.rol || 'USUARIO').toUpperCase().trim();

    const token = jwt.sign(
      { id: user.id_usuario, email: user.correo, rol: normalizedRole, nombres: user.nombres, apellidos: user.apellidos },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    await db.query('UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = ?', [user.id_usuario]);

    try {
      await createNotification(user.id_usuario, 'Bienvenida', `Hola ${user.nombres}, has iniciado sesión exitosamente`, 'login');
    } catch (error) {
      console.log('⚠️ No se pudo crear notificación de bienvenida');
    }
    
    // 🪵 5. LOG: Login exitoso
    await createLog('INFO', `Inicio de sesión exitoso`, { userId: user.id_usuario, email, ip, method: 'local' });

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: { id: user.id_usuario, email: user.correo, nombres: user.nombres, apellidos: user.apellidos, rol: normalizedRole }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    // 🪵 6. LOG: Error del servidor
    await createLog('ERROR', `Error interno en la función de login`, { errorMessage: error.message, stack: error.stack, email: req.body.email });
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ✅ GOOGLE VERIFY
const googleVerify = async (req, res) => {
  try {
    const { token } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!token) {
      return res.status(400).json({ message: 'Token de Google es requerido' });
    }

    // Por ahora, asumimos que el token es decodificado para obtener el email
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.email) {
      // 🪵 LOG: Token de Google inválido
      await createLog('WARN', 'Intento de login con Google fallido: Token inválido o sin email', { ip });
      return res.status(401).json({ message: 'Token de Google inválido' });
    }
    
    const email = decoded.email;

    // Buscar usuario existente
    const [users] = await db.query(
      'SELECT id_usuario, nombres, apellidos, correo, rol, estado FROM usuario WHERE correo = ?',
      [email]
    );

    let user;
    if (users.length === 0) {
      // Crear nuevo usuario
      const nombres = decoded.name || email.split('@')[0];
      
      const [result] = await db.query(
        `INSERT INTO usuario (nombres, correo, rol, estado) 
         VALUES (?, ?, ?, 'ACTIVO')`,
        [nombres, email, 'USUARIO']
      );

      user = {
        id_usuario: result.insertId,
        nombres: nombres,
        apellidos: '',
        correo: email,
        rol: 'USUARIO',
        estado: 'ACTIVO'
      };

      // 🪵 LOG: Nuevo usuario creado vía Google
      await createLog('INFO', `Nuevo usuario creado a través de Google`, { userId: user.id_usuario, email, ip });

    } else {
      user = users[0];
    }

    if (user.estado !== 'ACTIVO') {
      // 🪵 LOG: Intento de login de usuario inactivo vía Google
      await createLog('WARN', `Intento de login con Google bloqueado: Usuario inactivo`, { userId: user.id_usuario, email, ip });
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    const normalizedRole = (user.rol || 'USUARIO').toUpperCase().trim();

    // Generar token JWT de la aplicación
    const appToken = jwt.sign(
      { id: user.id_usuario, email: user.correo, rol: normalizedRole, nombres: user.nombres, apellidos: user.apellidos },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    // Actualizar última conexión
    await db.query(
      'UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = ?',
      [user.id_usuario]
    );
    
    // 🪵 LOG: Login exitoso con Google
    await createLog('INFO', `Inicio de sesión exitoso con Google`, { userId: user.id_usuario, email, ip, method: 'google' });

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
    // 🪵 LOG: Error del servidor en Google Verify
    await createLog('ERROR', 'Error interno en la autenticación con Google', { errorMessage: error.message, stack: error.stack, email: req.body.decoded?.email });
    res.status(500).json({ message: 'Error en la autenticación con Google' });
  }
};

module.exports = {
  login,
  googleVerify
};
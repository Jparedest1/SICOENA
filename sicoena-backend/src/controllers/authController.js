const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { createNotification } = require('./notificationController');
const { createLog } = require('./logController');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const [users] = await db.query(
      `SELECT id_usuario, nombres, apellidos, correo, contraseña, rol, estado 
       FROM usuario WHERE correo = ?`,
      [email]
    );

    if (users.length === 0) {
      await createLog('WARN', `Intento de login fallido: Usuario no encontrado`, { email, ip });
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.contraseña);

    if (!isPasswordValid) {
      await createLog('WARN', `Intento de login fallido: Contraseña incorrecta`, { userId: user.id_usuario, email, ip });
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    if (user.estado !== 'ACTIVO') {
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
    
    await createLog('INFO', `Inicio de sesión exitoso`, { userId: user.id_usuario, email, ip, method: 'local' });

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: { id: user.id_usuario, email: user.correo, nombres: user.nombres, apellidos: user.apellidos, rol: normalizedRole }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    await createLog('ERROR', `Error interno en la función de login`, { errorMessage: error.message, stack: error.stack, email: req.body.email });
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const googleVerify = async (req, res) => {
  try {
    const { token } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!token) {
      return res.status(400).json({ message: 'Token de Google es requerido' });
    }

    const decoded = jwt.decode(token);

    if (!decoded || !decoded.email) {
      await createLog('WARN', 'Intento de login con Google fallido: Token inválido o sin email', { ip });
      return res.status(401).json({ message: 'Token de Google inválido' });
    }
    
    const email = decoded.email;

    const [users] = await db.query(
      'SELECT id_usuario, nombres, apellidos, correo, rol, estado FROM usuario WHERE correo = ?',
      [email]
    );

    if (users.length === 0) {
      await createLog('WARN', `Intento de login con Google fallido: Email no registrado`, { email, ip });
      return res.status(403).json({ message: 'El correo electrónico no está autorizado para acceder a este sistema.' });
    }

    if (user.estado !== 'ACTIVO') {
      await createLog('WARN', `Intento de login con Google bloqueado: Usuario inactivo`, { userId: user.id_usuario, email, ip });
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    const normalizedRole = (user.rol || 'USUARIO').toUpperCase().trim();

    const appToken = jwt.sign(
      { id: user.id_usuario, email: user.correo, rol: normalizedRole, nombres: user.nombres, apellidos: user.apellidos },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    await db.query(
      'UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = ?',
      [user.id_usuario]
    );
    
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
    const email = req.body.token ? jwt.decode(req.body.token)?.email : 'desconocido';
    await createLog('ERROR', 'Error interno en la autenticación con Google', { errorMessage: error.message, stack: error.stack, email: email });
    res.status(500).json({ message: 'Error en la autenticación con Google' });
  }
};


module.exports = {
  login,
  googleVerify
};
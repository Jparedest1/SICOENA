const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    // 1. Buscar usuario por email en la tabla 'usuario' y seleccionar 'contraseña'
    const [users] = await db.query(
      'SELECT id_usuario, nombres, apellidos, correo, contraseña, rol, estado FROM usuario WHERE correo = ? AND estado = "ACTIVO"', // Correct table and column names
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
    }

    const user = users[0];

    // 2. Comparar la contraseña enviada con el hash 'contraseña'
    const isMatch = await bcrypt.compare(password, user.contraseña); // Correct property name

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Generar un token JWT
    const payload = {
      userId: user.id_usuario, // Use id_usuario
      rol: user.rol,
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Actualizar última conexión (opcional)
    await db.query('UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = ?', [user.id_usuario]); // Correct table and column names

    // 4. Enviar el token al cliente
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token: token,
      user: { // Send basic user info
          id: user.id_usuario,
          nombre: `${user.nombres} ${user.apellidos}`, // Combine names
          email: user.correo,
          rol: user.rol
      }
    });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: 'Error interno del servidor durante el login.' });
  }
};

exports.googleVerify = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token de Google no proporcionado.' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload['email'];
        const nombreCompleto = payload['name'];
        const nameParts = nombreCompleto.split(' ');
        const nombres = nameParts[0] || '';
        const apellidos = nameParts.slice(1).join(' ') || '';

        // Busca al usuario en tu base de datos por email
        const [users] = await db.query('SELECT * FROM usuario WHERE correo = ?', [email]);

        let user;
        if (users.length > 0) {
            // Usuario encontrado
            user = users[0];
            if (user.estado !== 'ACTIVO') {
                return res.status(403).json({ message: 'Usuario inactivo. Contacte al administrador.' });
            }
            // Actualiza última conexión
            await db.query('UPDATE usuario SET ultima_conexion = NOW() WHERE id_usuario = ?', [user.id_usuario]);

        } else {
            // --- CAMBIO IMPORTANTE AQUÍ ---
            // Usuario NO encontrado - Devolver error en lugar de crearlo
            console.log(`Intento de login con Google fallido: Email ${email} no registrado.`);
            return res.status(403).json({ message: 'Acceso denegado. Su correo no está registrado. Por favor, solicite acceso al administrador.' });
            // --- FIN DEL CAMBIO ---
        }

        // Si llegó hasta aquí, el usuario es válido
        const appPayload = {
          userId: user.id_usuario,
          rol: user.rol,
        };

        const appToken = jwt.sign(
            appPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
          message: 'Inicio de sesión con Google exitoso.',
          token: appToken,
          user: {
              id: user.id_usuario,
              nombre: `${user.nombres} ${user.apellidos}`,
              email: user.correo,
              rol: user.rol
          }
        });

    } catch (error) {
        console.error("Error verificando token de Google:", error);
        // Si el error es por token inválido de Google, envía un 401
        if (error.message.includes('Invalid token') || error.message.includes('Token used too late')) {
             return res.status(401).json({ message: 'Token de Google inválido o expirado.' });
        }
        // Error genérico del servidor
        res.status(500).json({ message: 'Error interno al verificar el token de Google.' });
    }
};
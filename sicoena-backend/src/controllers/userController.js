// src/controllers/userController.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notificationController');

// ✅ FUNCIÓN 1: Crear Usuario
const createUser = async (req, res) => {
  try {
    // ✅ Recibir nombre y apellido por separado
    const { nombre, apellidos, email, rol, telefono, estado, contrasena } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ message: 'Nombre y email son requeridos.' });
    }

    // ✅ Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena || 'password123', 10);

    console.log('📝 Creando usuario:', { nombre, apellidos, email, rol, telefono, estado });

    // ✅ CORRECTO: Usar los apellidos que viene del frontend
    const [result] = await db.query(
      `INSERT INTO usuario (nombres, apellidos, correo, rol, telefono, estado, contraseña) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,                    // ← nombres
        apellidos || '',           // ← apellidos (si no viene, vacío)
        email,                     // ← correo
        rol || 'USUARIO',          // ← rol
        telefono || null,          // ← telefono
        estado || 'ACTIVO',        // ← estado
        hashedPassword             // ← contraseña
      ]
    );

    console.log('✅ Usuario creado:', result.insertId);

    // ✅ CREAR NOTIFICACIÓN PARA TODOS LOS ADMINS
    try {
      const [admins] = await db.query(
        `SELECT id_usuario FROM usuario WHERE rol = 'ADMINISTRADOR' AND estado = 'ACTIVO'`
      );

      for (const admin of admins) {
        await createNotification(
          admin.id_usuario,
          'Nuevo usuario registrado',
          `El usuario "${nombre} ${apellidos || ''}" (${email}) ha sido registrado en el sistema.`,
          'usuario'
        );
      }

      console.log(`📨 Notificaciones enviadas a ${admins.length} administradores`);
    } catch (error) {
      console.error('⚠️ Error al crear notificaciones:', error);
    }

    res.status(201).json({
      id_usuario: result.insertId,
      nombre,
      apellidos,
      email,
      rol,
      estado
    });

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El email ya está registrado.' });
    }
    res.status(500).json({ message: 'Error al crear el usuario.' });
  }
};

// ✅ FUNCIÓN 2: Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const roleFilter = req.query.rol;
    const statusFilter = req.query.estado;

    let sql = `
      SELECT
        id_usuario as id,
        CONCAT(nombres, ' ', COALESCE(apellidos, '')) as nombre,
        correo as email,
        rol,
        estado,
        ultima_conexion
      FROM usuario
      WHERE 1=1
    `;
    const params = [];

    if (statusFilter && (statusFilter.toUpperCase() === 'ACTIVO' || statusFilter.toUpperCase() === 'INACTIVO')) {
        sql += ` AND estado = ?`;
        params.push(statusFilter.toUpperCase());
    } else {
        sql += ` AND estado = 'ACTIVO'`;
    }

    if (searchTerm) {
      sql += ` AND (nombres LIKE ? OR apellidos LIKE ? OR correo LIKE ?)`;
      const searchTermLike = `%${searchTerm}%`;
      params.push(searchTermLike, searchTermLike, searchTermLike);
    }

    if (roleFilter && roleFilter !== 'todos') {
      sql += ` AND rol = ?`;
      params.push(roleFilter);
    }

    sql += ` ORDER BY id_usuario DESC`;

    const [rows] = await db.query(sql, params);

    res.status(200).json(rows);

  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
  }
};

// ✅ FUNCIÓN 3: Obtener usuario por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [user] = await db.query(
            `SELECT 
                id_usuario as id,
                CONCAT(nombres, ' ', COALESCE(apellidos, '')) as nombre,
                correo as email,
                rol,
                telefono,
                estado,
                ultima_conexion
            FROM usuario 
            WHERE id_usuario = ?`,
            [id]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(user[0]);

    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// ✅ MODIFICADO: FUNCIÓN 4: Actualizar usuario
const updateUser = async (req, res) => {
    const userId = req.params.id;
    // Extraemos todos los campos, incluyendo la contraseña
    const { 
        nombre, 
        email, 
        rol, 
        telefono, 
        estado,
        contrasena // <-- Campo clave
    } = req.body;

    // Validación básica de campos
    if (!nombre || !email) {
        return res.status(400).json({ message: 'Nombre y email son requeridos.' });
    }
    if (estado && estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO') {
        return res.status(400).json({ message: 'Estado inválido.' });
    }

    // Separamos nombre y apellidos
    const nameParts = nombre ? nombre.split(' ') : [''];
    const nombres = nameParts[0] || '';
    const apellidos = nameParts.slice(1).join(' ');

    try {
        // Construcción dinámica de la consulta SQL
        let sqlFields = [
            'nombres = ?', 
            'apellidos = ?', 
            'correo = ?', 
            'rol = ?', 
            'telefono = ?', 
            'estado = ?'
        ];
        let params = [
            nombres, 
            apellidos, 
            email, 
            rol || 'Usuario',
            telefono || null, 
            estado ? estado.toUpperCase() : 'ACTIVO'
        ];

        // --- INICIO DE LA LÓGICA CORREGIDA ---
        // Si se proporciona una nueva contraseña en el body de la petición...
        if (contrasena && contrasena.trim() !== '') {
            console.log(`🔑 Actualizando contraseña para el usuario ${userId}`);
            // ...la hasheamos
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            // ...y la añadimos a los campos y parámetros a actualizar
            sqlFields.push('contraseña = ?');
            params.push(hashedPassword);
        }
        // --- FIN DE LA LÓGICA CORREGIDA ---

        // Unimos todos los campos en un string para la consulta SET
        const sqlSetClause = sqlFields.join(', ');
        
        // Añadimos el ID del usuario al final de los parámetros para el WHERE
        params.push(userId);

        // Construimos y ejecutamos la consulta final
        const sql = `UPDATE usuario SET ${sqlSetClause} WHERE id_usuario = ?`;
        
        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ 
            message: 'Usuario actualizado exitosamente.',
            user: {
                id: userId,
                nombre,
                email,
                rol,
                estado
            }
         });

    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'El correo electrónico ya está en uso por otro usuario.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar usuario.' });
    }
};


// ✅ FUNCIÓN 5: Eliminar usuario
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM usuario WHERE id_usuario = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });

    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// ✅ FUNCIÓN 6: Actualizar estado del usuario
const updateUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { estado } = req.body;

    if (!estado || (estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO')) {
        return res.status(400).json({ message: 'Estado inválido. Debe ser ACTIVO o INACTIVO.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE usuario SET estado = ? WHERE id_usuario = ?',
            [estado.toUpperCase(), userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: `Usuario puesto en estado ${estado.toLowerCase()} con éxito.` });

    } catch (error) {
        console.error("Error al actualizar estado del usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el estado del usuario.' });
    }
};

// ✅ FUNCIÓN 7: Obtener usuarios activos
const getActiveUsers = async (req, res) => {
    try {
        console.log('🔍 INICIANDO getActiveUsers');
        
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Content-Type', 'application/json');
        
        console.log('📊 Ejecutando query SQL...');
        
        const [users] = await db.query(
            'SELECT id_usuario, CONCAT(nombres, " ", COALESCE(apellidos, "")) as nombre, correo FROM usuario WHERE estado = ? ORDER BY nombres ASC',
            ['ACTIVO']
        );

        console.log('✅ Query exitosa');
        console.log('👥 Usuarios encontrados:', users.length);
        console.log('📝 Datos de usuarios:', JSON.stringify(users));

        const responseData = {
            message: 'Usuarios activos obtenidos exitosamente.',
            users: users,
            total: users.length
        };

        console.log('📤 Enviando respuesta:', JSON.stringify(responseData));
        
        res.status(200).json(responseData);
        
        console.log('✅ Respuesta enviada correctamente');

    } catch (error) {
        console.error("❌ Error al obtener usuarios activos:", error);
        console.error("📌 Detalles del error:", error.message);
        console.error("🔗 Stack trace:", error.stack);
        
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener usuarios activos.',
            error: error.message 
        });
    }
};

const changePassword = async (req, res) => {
  // El ID del usuario debe venir del token, no de los parámetros de la URL
  const userId = req.user.id; 
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Obtener el hash de la contraseña actual del usuario desde la BD
    const [users] = await db.query('SELECT contraseña FROM usuario WHERE id_usuario = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    
    // 2. Comparar la contraseña actual enviada con el hash de la BD
    const isMatch = await bcrypt.compare(currentPassword, users[0].contraseña);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
    }

    // 3. Hashear la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar la contraseña en la BD
    await db.query('UPDATE usuario SET contraseña = ? WHERE id_usuario = ?', [hashedNewPassword, userId]);

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
// ✅ EXPORTAR TODAS LAS FUNCIONES - ESTILO CONSISTENTE
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getActiveUsers
};
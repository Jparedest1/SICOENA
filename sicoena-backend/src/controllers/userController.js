const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notificationController');

const createUser = async (req, res) => {
  try {
    
    const { nombre, apellidos, email, rol, telefono, estado, contrasena } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ message: 'Nombre y email son requeridos.' });
    }

    
    const hashedPassword = await bcrypt.hash(contrasena || 'password123', 10);

    console.log('Creando usuario:', { nombre, apellidos, email, rol, telefono, estado });
    
    const [result] = await db.query(
      `INSERT INTO usuario (nombres, apellidos, correo, rol, telefono, estado, contraseña) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,                    
        apellidos || '',           
        email,                     
        rol || 'USUARIO',          
        telefono || null,          
        estado || 'ACTIVO',        
        hashedPassword             
      ]
    );

    console.log('Usuario creado:', result.insertId);
    
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

      console.log(`Notificaciones enviadas a ${admins.length} administradores`);
    } catch (error) {
      console.error('Error al crear notificaciones:', error);
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
    console.error('Error al crear usuario:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El email ya está registrado.' });
    }
    res.status(500).json({ message: 'Error al crear el usuario.' });
  }
};

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

const updateUser = async (req, res) => {
    const userId = req.params.id;
    
    const { 
        nombre, 
        email, 
        rol, 
        telefono, 
        estado,
        contrasena 
    } = req.body;
    
    if (!nombre || !email) {
        return res.status(400).json({ message: 'Nombre y email son requeridos.' });
    }
    if (estado && estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO') {
        return res.status(400).json({ message: 'Estado inválido.' });
    }
    
    const nameParts = nombre ? nombre.split(' ') : [''];
    const nombres = nameParts[0] || '';
    const apellidos = nameParts.slice(1).join(' ');

    try {
        
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

        if (contrasena && contrasena.trim() !== '') {
            console.log(`Actualizando contraseña para el usuario ${userId}`);

            const hashedPassword = await bcrypt.hash(contrasena, 10);
            
            sqlFields.push('contraseña = ?');
            params.push(hashedPassword);
        }
        
        const sqlSetClause = sqlFields.join(', ');

        params.push(userId);

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

const getActiveUsers = async (req, res) => {
    try {
        console.log('INICIANDO getActiveUsers');
        
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Content-Type', 'application/json');

        console.log('Ejecutando query SQL...');

        const [users] = await db.query(
            'SELECT id_usuario, CONCAT(nombres, " ", COALESCE(apellidos, "")) as nombre, correo FROM usuario WHERE estado = ? ORDER BY nombres ASC',
            ['ACTIVO']
        );

        console.log('Query exitosa');
        console.log('Usuarios encontrados:', users.length);
        console.log('Datos de usuarios:', JSON.stringify(users));

        const responseData = {
            message: 'Usuarios activos obtenidos exitosamente.',
            users: users,
            total: users.length
        };

        console.log('📤 Enviando respuesta:', JSON.stringify(responseData));
        
        res.status(200).json(responseData);
        
        console.log('Respuesta enviada correctamente');

    } catch (error) {
        console.error("Error al obtener usuarios activos:", error);
        console.error("Detalles del error:", error.message);
        console.error("Stack trace:", error.stack);
        
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener usuarios activos.',
            error: error.message 
        });
    }
};
const changePassword = async (req, res) => {
  
  const userId = req.user.id; 
  const { currentPassword, newPassword } = req.body;

  try {
    
    const [users] = await db.query('SELECT contraseña FROM usuario WHERE id_usuario = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    
        const isMatch = await bcrypt.compare(currentPassword, users[0].contraseña);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await db.query('UPDATE usuario SET contraseña = ? WHERE id_usuario = ?', [hashedNewPassword, userId]);

    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getActiveUsers
};
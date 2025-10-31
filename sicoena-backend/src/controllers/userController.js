// src/controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    // Extrae los datos enviados desde el modal AddUserModal
    const { 
        nombre, 
        email, 
        contrasena: password, // Renombra la variable para claridad
        rol, 
        telefono,
        estado // Asegúrate de recibir el estado desde el modal
    } = req.body;

    // Separa nombre y apellidos
    const nameParts = nombre ? nombre.split(' ') : [''];
    const nombres = nameParts[0];
    const apellidos = nameParts.slice(1).join(' ');

    // Validación básica
    if (!nombres || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
    }

    try {
        // 1. Hashea la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Prepara la consulta INSERT incluyendo estado y fecha_creacion
        const sql = `
            INSERT INTO usuario 
            (nombres, apellidos, correo, contraseña, rol, telefono, estado, fecha_creacion) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW()) 
        `; // Añadimos estado y usamos NOW() para fecha_creacion
        
        // 3. Ejecuta la consulta
        const [result] = await db.query(sql, [
            nombres, 
            apellidos, 
            email, 
            hashedPassword, 
            rol || 'Usuario', 
            telefono || null, 
            estado ? estado.toUpperCase() : 'ACTIVO' // Establece el estado
        ]);

        // 4. Devuelve una respuesta exitosa
        res.status(201).json({
            id: result.insertId,
            nombre: nombre,      
            email: email,
            rol: rol || 'Usuario',
            estado: estado ? estado.toUpperCase() : 'ACTIVO'
        });

    } catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
    }
};

exports.getAllUsers = async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const roleFilter = req.query.rol;
    const statusFilter = req.query.estado;

    // Base de la consulta
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

    // Filtro de estado
    if (statusFilter && (statusFilter.toUpperCase() === 'ACTIVO' || statusFilter.toUpperCase() === 'INACTIVO')) {
        sql += ` AND estado = ?`;
        params.push(statusFilter.toUpperCase());
    } else {
        sql += ` AND estado = 'ACTIVO'`;
    }

    // Búsqueda
    if (searchTerm) {
      sql += ` AND (nombres LIKE ? OR apellidos LIKE ? OR correo LIKE ?)`;
      const searchTermLike = `%${searchTerm}%`;
      params.push(searchTermLike, searchTermLike, searchTermLike);
    }

    // Filtro de rol
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

exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { 
        nombre, 
        email, 
        rol, 
        telefono, 
        estado 
    } = req.body;

    // Separa nombre y apellidos
    const nameParts = nombre ? nombre.split(' ') : [''];
    const nombres = nameParts[0];
    const apellidos = nameParts.slice(1).join(' ');

    // Validación básica
    if (!nombres || !email) {
        return res.status(400).json({ message: 'Nombre y email son requeridos.' });
    }
    if (estado && estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO') {
        return res.status(400).json({ message: 'Estado inválido.' });
    }

    try {
        const sql = `
            UPDATE usuario SET 
                nombres = ?, 
                apellidos = ?, 
                correo = ?, 
                rol = ?, 
                telefono = ?, 
                estado = ? 
            WHERE id_usuario = ?
        `;
        
        const [result] = await db.query(sql, [
            nombres, 
            apellidos, 
            email, 
            rol || 'Usuario',
            telefono || null, 
            estado ? estado.toUpperCase() : 'ACTIVO',
            userId
        ]);

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

exports.updateUserStatus = async (req, res) => {
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

// ✅ NUEVA FUNCIÓN - Obtener usuarios activos (sin protección)
exports.getActiveUsers = async (req, res) => {
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
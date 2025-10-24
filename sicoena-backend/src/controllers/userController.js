// src/controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ... (deja getAllUsers y updateUserStatus como están, parecen correctos) ...

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
            // cui no está en esta consulta, ¿debería estar? Revisa tu tabla y modal.
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

// --- getAllUsers --- (Parece correcto, solo asegúrate que CONCAT maneje bien apellidos NULL)
exports.getAllUsers = async (req, res) => {
  try {
    // --- LECTURA DE QUERY PARAMETERS ---
    const searchTerm = req.query.search || ''; // Obtiene el término de búsqueda (o string vacío)
    const roleFilter = req.query.rol; // Obtiene el filtro de rol (será undefined si no se envía)

    // --- CONSTRUCCIÓN DINÁMICA DE LA CONSULTA ---
    let sql = `
      SELECT 
        id_usuario as id, 
        CONCAT(nombres, ' ', COALESCE(apellidos, '')) as nombre, 
        correo as email, 
        rol, 
        estado, 
        ultima_conexion 
      FROM usuario 
      WHERE estado = "ACTIVO" 
    `;
    const params = []; // Array para los valores seguros

    // Añade condición de búsqueda si searchTerm no está vacío
    if (searchTerm) {
      sql += ` AND (nombres LIKE ? OR apellidos LIKE ? OR correo LIKE ?)`;
      const searchTermLike = `%${searchTerm}%`; // Prepara el término para LIKE
      params.push(searchTermLike, searchTermLike, searchTermLike);
    }

    // Añade condición de rol si roleFilter no es 'todos' y existe
    if (roleFilter && roleFilter !== 'todos') {
      sql += ` AND rol = ?`;
      params.push(roleFilter);
    }

    sql += ` ORDER BY id_usuario DESC`; // Mantiene el orden

    // --- EJECUCIÓN DE LA CONSULTA CON PARÁMETROS ---
    const [rows] = await db.query(sql, params); 
    
    res.status(200).json(rows);

  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
  }
};

// --- updateUserStatus --- (Parece correcto)
exports.updateUser = async (req, res) => {
    const userId = req.params.id; // Obtiene el ID desde la URL (:id)
    // Extrae los datos actualizados del cuerpo de la petición
    // Asegúrate que coincidan con lo que envías desde AddUserModal
    const { 
        nombre, 
        email, 
        rol, 
        telefono, 
        estado 
        // NO incluyas la contraseña aquí a menos que tengas lógica específica para cambiarla
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
        // Prepara la consulta UPDATE
        // Actualiza solo los campos proporcionados
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
        
        // Ejecuta la consulta
        const [result] = await db.query(sql, [
            nombres, 
            apellidos, 
            email, 
            rol || 'Usuario', // Rol por defecto si no se envía
            telefono || null, 
            cui || null,
            estado ? estado.toUpperCase() : 'ACTIVO', // Estado actualizado o por defecto
            userId // El ID del usuario a actualizar
        ]);

        // Verifica si se actualizó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Devuelve una respuesta exitosa
        res.status(200).json({ 
            message: 'Usuario actualizado exitosamente.',
            // Opcional: devolver los datos actualizados
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
        // Manejo de error si el correo ya existe para OTRO usuario
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'El correo electrónico ya está en uso por otro usuario.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar usuario.' });
    }
};

exports.updateUserStatus = async (req, res) => {
    const { userId } = req.params; // Obtiene userId de la URL
    const { estado } = req.body; // Espera { "estado": "INACTIVO" } o { "estado": "ACTIVO" }

    // Validación del estado recibido
    if (!estado || (estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO')) {
        return res.status(400).json({ message: 'Estado inválido. Debe ser ACTIVO o INACTIVO.' });
    }

    try {
        // Ejecuta la actualización en la base de datos
        const [result] = await db.query(
            'UPDATE usuario SET estado = ? WHERE id_usuario = ?',
            [estado.toUpperCase(), userId] // Guarda el estado en mayúsculas
        );

        // Verifica si se encontró y actualizó el usuario
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Envía respuesta exitosa
        res.status(200).json({ message: `Usuario puesto en estado ${estado.toLowerCase()} con éxito.` });

    } catch (error) {
        console.error("Error al actualizar estado del usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el estado del usuario.' });
    }
};
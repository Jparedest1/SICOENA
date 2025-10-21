// src/controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ... (getAllUsers function might need updates too, check table/column names)

exports.createUser = async (req, res) => {
    // Assuming 'nombre' from frontend is full name, split it
    const { nombre, email, password, rol, cui, telefono } = req.body;
    const nameParts = nombre.split(' ');
    const nombres = nameParts[0] || '';
    const apellidos = nameParts.slice(1).join(' ') || '';

    if (!nombres || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); // Use a different variable name

        // Use correct table and column names
        const [result] = await db.query(
            'INSERT INTO usuario (nombres, apellidos, correo, contraseña, rol, telefono) VALUES (?, ?, ?, ?, ?, ?)',
            [nombres, apellidos, email, hashedPassword, rol || 'Usuario', telefono]
        );

        res.status(201).json({
            id: result.insertId,
            nombre: nombre, // Send back the full name
            email: email,
            rol: rol || 'Usuario',
            estado: 'ACTIVO'
        });

    } catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
    }
};

// --- Also update getAllUsers if needed ---
exports.getAllUsers = async (req, res) => {
  try {
    // Use correct table and column names
    const [rows] = await db.query('SELECT id_usuario as id, CONCAT(nombres, " ", apellidos) as nombre, correo as email, rol, estado, ultima_conexion FROM usuario WHERE estado = "ACTIVO"');
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
  }
};

// --- Update the 'soft delete' logic if you have it ---
exports.updateUserStatus = async (req, res) => { // Example name
    const { userId } = req.params;
    const { estado } = req.body; // Expecting { "estado": "INACTIVO" }

    if (!estado || (estado !== 'ACTIVO' && estado !== 'INACTIVO')) {
        return res.status(400).json({ message: 'Estado inválido.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE usuario SET estado = ? WHERE id_usuario = ?', // Correct table/columns
            [estado, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: `Usuario ${estado.toLowerCase()} con éxito.` });

    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Remember to define the route for updateUserStatus in userRoutes.js
// Example: router.put('/:userId/status', protect, restrictTo('Administrador'), userController.updateUserStatus);
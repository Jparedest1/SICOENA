// src/controllers/userController.js
const db = require('../config/db'); // Importa la conexión a la BD
const bcrypt = require('bcryptjs');

// Controlador para obtener todos los usuarios (ejemplo simple)
exports.getAllUsers = async (req, res) => {
  try {
    const [rows, fields] = await db.query('SELECT id, nombre, email, rol, estado FROM usuario WHERE estado = "ACTIVO"');
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
  }
};

// Controlador para crear un usuario (ejemplo básico)
// ¡Falta hashear la contraseña aquí! Lo haremos después.
exports.createUser = async (req, res) => {
    const { nombre, email, password, rol, cui, telefono } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
    }

    try {
        // --- ¡HASHEAR CONTRASEÑA! ---
        const salt = await bcrypt.genSalt(10); // Genera un salt
        const password_hash = await bcrypt.hash(password, salt); // Crea el hash

        const [result] = await db.query(
            'INSERT INTO usuario (nombre, email, password_hash, rol, cui, telefono) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, password_hash, rol || 'Usuario', cui, telefono]
        );

        res.status(201).json({ id: result.insertId, nombre, email, rol: rol || 'Usuario', estado: 'ACTIVO' });

    } catch (error) {
       // ... (manejo de errores igual que antes)
        console.error("Error al crear usuario:", error);
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
    }
};

// Añade aquí más controladores (getUserById, updateUser, deleteUser...)
// src/controllers/institutionController.js

const db = require('../config/db');

const getAllSchools = async (req, res) => {
    try {
        const { search, ubicacion, estado } = req.query;

        let sql = `
            SELECT 
                id_escuela, codigo_escuela, nombre_escuela,  
                direccion, municipio, departamento, telefono, correo,  
                director, cantidad_estudiantes, observaciones, estado 
            FROM escuela 
            WHERE 1=1 
        `;
        const params = [];

        if (estado && (estado.toUpperCase() === 'ACTIVA' || estado.toUpperCase() === 'INACTIVA')) {
             sql += ` AND estado = ?`;
             params.push(estado.toUpperCase());
        } else {
             sql += ` AND estado = 'ACTIVA'`;
        }
        
        if (search) {
            sql += ` AND (nombre_escuela LIKE ? OR codigo_escuela LIKE ? OR direccion LIKE ?)`;
            const searchTermLike = `%${search}%`;
            params.push(searchTermLike, searchTermLike, searchTermLike);
        }

        if (ubicacion && ubicacion !== 'todos') {
             sql += ` AND municipio = ?`;
             params.push(ubicacion);
        }

        sql += ` ORDER BY id_escuela DESC`;

        const [rows] = await db.query(sql, params);
        res.status(200).json(rows);

    } catch (error) {
        console.error("Error al obtener escuelas:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getActiveSchools = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
        const [schools] = await db.query(
            'SELECT id_escuela, nombre_escuela FROM escuela WHERE estado = ? ORDER BY nombre_escuela ASC',
            ['ACTIVA']
        );

        res.status(200).json({
            message: 'Escuelas activas obtenidas exitosamente.',
            schools: schools,
            total: schools.length
        });

    } catch (error) {
        console.error("Error al obtener escuelas activas:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener escuelas activas.',
            error: error.message 
        });
    }
};

const createSchool = async (req, res) => {
    const { 
        nombre_escuela, codigo_escuela, direccion, telefono, correo, 
        municipio, departamento, director, cantidad_estudiantes, 
        observaciones, estado 
    } = req.body;

    if (!nombre_escuela || !codigo_escuela) {
        return res.status(400).json({ message: 'Nombre y código son requeridos.' });
    }

    try {
        const sql = `
            INSERT INTO escuela (
                nombre_escuela, codigo_escuela,   
                direccion, municipio, departamento, telefono, correo,  
                director, cantidad_estudiantes, observaciones, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            nombre_escuela, codigo_escuela, direccion || null, municipio || null, departamento || null, telefono || null, correo || null,
            director || null, cantidad_estudiantes || 0,
            observaciones || null, estado ? estado.toUpperCase() : 'ACTIVA'
        ];
        
        const [result] = await db.query(sql, params);
        res.status(201).json({ 
            id_escuela: result.insertId, 
            ...req.body 
        });

    } catch (error) {
        console.error("Error al crear escuela:", error);
         if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'El código o correo ya existe.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const updateSchool = async (req, res) => {
    const { id } = req.params;
     const { 
        nombre_escuela, codigo_escuela, direccion, telefono, correo, 
        municipio, departamento, director, cantidad_estudiantes, 
        observaciones, estado 
    } = req.body;

     if (!nombre_escuela || !codigo_escuela) {
        return res.status(400).json({ message: 'Nombre y código son requeridos.' });
    }
     if (estado && estado.toUpperCase() !== 'ACTIVA' && estado.toUpperCase() !== 'INACTIVA') {
        return res.status(400).json({ message: 'Estado inválido.' });
    }

    try {
        const sql = `
            UPDATE escuela SET 
                codigo_escuela = ?, nombre_escuela = ?,  direccion = ?, municipio = ?, departamento = ?, telefono = ?, correo = ?, 
                 director = ?, cantidad_estudiantes = ?, observaciones = ?, estado = ?
            WHERE id_escuela = ?
        `;
         const params = [
            codigo_escuela, nombre_escuela, direccion || null, municipio || null, departamento || null, telefono || null, correo || null,
            director || null, cantidad_estudiantes || 0,
            observaciones || null, estado ? estado.toUpperCase() : 'ACTIVA',
            id 
        ];

        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Institución no encontrada.' });
        }
        res.status(200).json({ message: 'Institución actualizada.', id_escuela: id, ...req.body });

    } catch (error) {
         console.error("Error al actualizar escuela:", error);
         if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'El código o correo ya está en uso por otra institución.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const updateSchoolStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || (estado.toUpperCase() !== 'ACTIVA' && estado.toUpperCase() !== 'INACTIVA')) {
        return res.status(400).json({ message: 'Estado inválido.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE escuela SET estado = ? WHERE id_escuela = ?',
            [estado.toUpperCase(), id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Institución no encontrada.' });
        }
        res.status(200).json({ message: `Institución puesta en estado ${estado.toLowerCase()} con éxito.` });
    } catch (error) {
        console.error("Error al actualizar estado de escuela:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = {
  getAllSchools,
  getActiveSchools,
  createSchool,
  updateSchool,
  updateSchoolStatus
};
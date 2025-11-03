const db = require('../config/db');

exports.getAllBodegas = async (req, res) => {
    try {
        const [bodegas] = await db.query(`
            SELECT 
                id_bodega,
                nombre_bodega,
                fecha_actualizacion,
                observaciones,
                estado
            FROM bodega
            WHERE estado = 'ACTIVO'
            ORDER BY nombre_bodega ASC
        `);

        res.status(200).json(bodegas);
    } catch (error) {
        console.error("Error al obtener bodegas:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener bodegas.' });
    }
};

exports.createBodega = async (req, res) => {
    const { nombre_bodega, fecha_actualizacion, observaciones } = req.body;

    if (!nombre_bodega) {
        return res.status(400).json({ message: 'El nombre de la bodega es requerido.' });
    }

    try {
        const sql = `
            INSERT INTO bodega (nombre_bodega, fecha_actualizacion, observaciones)
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            nombre_bodega,
            fecha_actualizacion || null,
            observaciones || null
        ]);

        res.status(201).json({ 
            id_bodega: result.insertId, 
            nombre_bodega 
        });
    } catch (error) {
        console.error("Error al crear bodega:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear bodega.' });
    }
};
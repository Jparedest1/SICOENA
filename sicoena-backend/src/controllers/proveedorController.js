const db = require('../config/db');

exports.getAllProveedores = async (req, res) => {
    try {
        const [proveedores] = await db.query(`
            SELECT 
                id_proveedor,
                nombre_proveedor,
                nit,
                direccion,
                telefono,
                estado,
                fecha_registro
            FROM proveedor
            WHERE estado = 'ACTIVO'
            ORDER BY nombre_proveedor ASC
        `);

        res.status(200).json(proveedores);
    } catch (error) {
        console.error("Error al obtener proveedores:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener proveedores.' });
    }
};

exports.createProveedor = async (req, res) => {
    const { nombre_proveedor, nit,  direccion, telefono, estado } = req.body;

    if (!nombre_proveedor) {
        return res.status(400).json({ message: 'El nombre del proveedor es requerido.' });
    }

    try {
        const sql = `
            INSERT INTO proveedor (nombre_proveedor, nit, telefono, direccion, estado)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            nombre_proveedor,
            nit || null,
            telefono || null,
            direccion || null,
            estado || 'ACTIVO'
        ]);

        res.status(201).json({ 
            id_proveedor: result.insertId, 
            nombre_proveedor 
        });
    } catch (error) {
        console.error("Error al crear proveedor:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear proveedor.' });
    }
};
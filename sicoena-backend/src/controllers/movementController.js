// sicoena-backend/src/controllers/movementController.js
const db = require('../config/db');

// --- Obtener Movimientos de Hoy (CORREGIDO) ---
exports.getMovementsToday = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        console.log(`📅 Buscando movimientos del día: ${today}`);
        
        // Obtener movimientos de hoy
        const [movements] = await db.query(`
            SELECT 
                m.id_movimiento,
                m.tipo_movimiento,
                m.cantidad,
                m.monto,
                p.nombre_producto,
                m.fecha_movimiento
            FROM movimiento m
            INNER JOIN producto p ON m.id_producto = p.id_producto
            WHERE CAST(m.fecha_movimiento AS DATE) = ?
            ORDER BY m.fecha_movimiento DESC
        `, [today]);

        console.log(`📊 Movimientos encontrados: ${movements.length}`);

        // Calcular totales
        let totalEntradas = 0;
        let totalSalidas = 0;
        let cantidadEntradas = 0;
        let cantidadSalidas = 0;

        movements.forEach(movement => {
            if (movement.tipo_movimiento === 'ENTRADA') {
                totalEntradas += movement.cantidad || 0;
                cantidadEntradas++;
            } else if (movement.tipo_movimiento === 'SALIDA') {
                totalSalidas += movement.cantidad || 0;
                cantidadSalidas++;
            }
        });

        console.log(`✅ Totales: Entradas=${totalEntradas}, Salidas=${totalSalidas}`);

        res.status(200).json({
            entries: totalEntradas,
            exits: totalSalidas,
            total: cantidadEntradas + cantidadSalidas,
            movements: movements
        });

    } catch (error) {
        console.error("Error al obtener movimientos del día:", error);
        res.status(500).json({ 
            message: 'Error al obtener movimientos del día.',
            error: error.message 
        });
    }
};

// --- Registrar Nuevo Movimiento (Entrada o Salida) ---
exports.createMovement = async (req, res) => {
    const { 
        id_producto, 
        tipo_movimiento,
        cantidad, 
        monto,
        descripcion 
    } = req.body;

    if (!id_producto || !tipo_movimiento || !cantidad) {
        return res.status(400).json({ 
            message: 'ID Producto, tipo de movimiento y cantidad son requeridos.' 
        });
    }

    try {
        if (!['ENTRADA', 'SALIDA'].includes(tipo_movimiento.toUpperCase())) {
            return res.status(400).json({ 
                message: 'Tipo de movimiento debe ser ENTRADA o SALIDA.' 
            });
        }

        const sql = `
            INSERT INTO movimiento 
            (id_producto, tipo_movimiento, cantidad, monto, descripcion, fecha_movimiento)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await db.query(sql, [
            id_producto,
            tipo_movimiento.toUpperCase(),
            cantidad,
            monto || 0,
            descripcion || null
        ]);

        // Actualiza el stock del producto
        if (tipo_movimiento.toUpperCase() === 'ENTRADA') {
            await db.query(
                `UPDATE producto SET stock_disponible = stock_disponible + ? WHERE id_producto = ?`,
                [cantidad, id_producto]
            );
        } else if (tipo_movimiento.toUpperCase() === 'SALIDA') {
            await db.query(
                `UPDATE producto SET stock_disponible = stock_disponible - ? WHERE id_producto = ?`,
                [cantidad, id_producto]
            );
        }

        res.status(201).json({
            id_movimiento: result.insertId,
            mensaje: `Movimiento de ${tipo_movimiento} registrado exitosamente.`
        });

    } catch (error) {
        console.error("Error al registrar movimiento:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al registrar movimiento.' 
        });
    }
};

// --- Obtener Historial de Movimientos ---
exports.getMovementHistory = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, tipo_movimiento, limite = 50, pagina = 1 } = req.query;
        const offset = (pagina - 1) * limite;

        let sql = `
            SELECT 
                m.id_movimiento,
                m.id_producto,
                p.nombre_producto,
                m.tipo_movimiento,
                m.cantidad,
                m.monto,
                m.descripcion,
                m.fecha_movimiento
            FROM movimiento m
            LEFT JOIN producto p ON m.id_producto = p.id_producto
            WHERE 1=1
        `;
        const params = [];

        if (fecha_inicio) {
            sql += ` AND CAST(m.fecha_movimiento AS DATE) >= ?`;
            params.push(fecha_inicio);
        }
        if (fecha_fin) {
            sql += ` AND CAST(m.fecha_movimiento AS DATE) <= ?`;
            params.push(fecha_fin);
        }
        if (tipo_movimiento && ['ENTRADA', 'SALIDA'].includes(tipo_movimiento.toUpperCase())) {
            sql += ` AND m.tipo_movimiento = ?`;
            params.push(tipo_movimiento.toUpperCase());
        }

        sql += ` ORDER BY m.fecha_movimiento DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limite), offset);

        const [movements] = await db.query(sql, params);

        res.status(200).json({
            data: movements,
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total: movements.length
        });

    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener historial.' 
        });
    }
};

const getAllMovements = async (req, res) => {
  try {
    // Tu lógica aquí
    res.json({ message: 'Get all movements' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovementById = async (req, res) => {
  try {
    // Tu lógica aquí
    res.json({ message: 'Get movement by ID' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMovement = async (req, res) => {
  try {
    // Tu lógica aquí
    res.json({ message: 'Create movement' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMovement = async (req, res) => {
  try {
    // Tu lógica aquí
    res.json({ message: 'Update movement' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMovement = async (req, res) => {
  try {
    // Tu lógica aquí
    res.json({ message: 'Delete movement' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMovements,
  getMovementById,
  createMovement,
  updateMovement,
  deleteMovement
};
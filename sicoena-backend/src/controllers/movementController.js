// sicoena-backend/src/controllers/movementController.js
const db = require('../config/db');

// --- Obtener Movimientos de Hoy (CORREGIDO) ---
exports.getMovementsToday = async (req, res) => {
    try {
        // Obtiene la fecha actual del servidor (en la zona horaria correcta)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayFormatted = `${year}-${month}-${day}`;

        console.log('📅 Fecha buscada en cliente:', todayFormatted);

        // Consulta movimientos de hoy agrupados por tipo
        // IMPORTANTE: Usamos CAST para comparar solo la parte de fecha
        const [movements] = await db.query(`
            SELECT 
                tipo_movimiento,
                COUNT(*) as cantidad_registros,
                SUM(cantidad) as cantidad_total,
                SUM(monto) as valor_total
            FROM movimiento
            WHERE CAST(fecha_movimiento AS DATE) = ?
            GROUP BY tipo_movimiento
        `, [todayFormatted]);

        console.log('📊 Movimientos encontrados (BD):', movements);

        // Procesa los resultados
        let entries = 0;
        let exits = 0;
        let totalEntryValue = 0;
        let totalExitValue = 0;

        movements.forEach(mov => {
            if (mov.tipo_movimiento === 'ENTRADA') {
                entries = mov.cantidad_total || 0;
                totalEntryValue = parseFloat(mov.valor_total) || 0;
            } else if (mov.tipo_movimiento === 'SALIDA') {
                exits = mov.cantidad_total || 0;
                totalExitValue = parseFloat(mov.valor_total) || 0;
            }
        });

        const response = {
            entries: parseInt(entries) || 0,
            exits: parseInt(exits) || 0,
            total: parseInt(entries) + parseInt(exits) || 0,
            totalValue: (totalEntryValue + totalExitValue).toFixed(2)
        };

        console.log('✅ Respuesta enviada al frontend:', response);
        res.status(200).json(response);

    } catch (error) {
        console.error("❌ Error al obtener movimientos del día:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener movimientos.',
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
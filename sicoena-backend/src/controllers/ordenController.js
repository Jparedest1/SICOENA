// src/controllers/ordenController.js
const db = require('../config/db');

// ✅ CREAR NUEVA ORDEN
exports.createOrder = async (req, res) => {
    const { 
        codigo_orden, 
        id_escuela, 
        id_menu, 
        id_responsable,  // Este es id_usuario en tu tabla
        cantidad_alumnos, 
        dias_duracion, 
        fecha_entrega,
        valor_total,
        productos,
        observaciones 
    } = req.body;

    // Validaciones
    if (!codigo_orden || !id_escuela || !id_menu || !id_responsable) {
        return res.status(400).json({ 
            message: 'Campos requeridos faltantes.' 
        });
    }

    if (!productos || productos.length === 0) {
        return res.status(400).json({ 
            message: 'Debes seleccionar al menos un producto.' 
        });
    }

    try {
        // Insertar la orden (adaptado a tu estructura)
        const sqlOrden = `
            INSERT INTO orden (
                codigo_orden, 
                id_escuela, 
                id_menu, 
                id_usuario,
                cantidad_alumnos, 
                dias_duracion, 
                fecha_entrega, 
                valor_total, 
                observaciones, 
                estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')
        `;

        const [resultOrden] = await db.query(sqlOrden, [
            codigo_orden,
            id_escuela,
            id_menu,
            id_responsable,  // Aquí va id_usuario
            cantidad_alumnos || 0,
            dias_duracion || 1,
            fecha_entrega || null,
            valor_total || 0,
            observaciones || null
        ]);

        const idOrden = resultOrden.insertId;

        // Insertar los productos de la orden
        for (const producto of productos) {
            const sqlProducto = `
                INSERT INTO orden_producto (id_orden, id_producto, cantidad, unidad_medida)
                VALUES (?, ?, ?, ?)
            `;

            await db.query(sqlProducto, [
                idOrden,
                producto.id_producto,
                producto.cantidad || 1,
                producto.unidad_medida || 'unidad'
            ]);
        }

        res.status(201).json({
            message: 'Orden creada exitosamente.',
            id_orden: idOrden,
            codigo_orden: codigo_orden
        });

    } catch (error) {
        console.error("Error al crear orden:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                message: 'Ya existe una orden con ese código.' 
            });
        }
        res.status(500).json({ 
            message: 'Error interno del servidor al crear orden.',
            error: error.message 
        });
    }
};

// ✅ OBTENER TODAS LAS ÓRDENES
exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT 
                o.id_orden,
                o.codigo_orden,
                e.nombre_escuela,
                m.nombre as nombre_menu,
                u.nombres as nombre_responsable,
                o.cantidad_alumnos,
                o.dias_duracion,
                o.fecha_entrega,
                o.fecha_creacion,
                o.estado,
                o.valor_total
            FROM orden o
            INNER JOIN escuela e ON o.id_escuela = e.id_escuela
            INNER JOIN menu m ON o.id_menu = m.id_menu
            INNER JOIN usuario u ON o.id_usuario = u.id_usuario
            ORDER BY o.fecha_creacion DESC
        `);

        res.status(200).json(orders);

    } catch (error) {
        console.error("Error al obtener órdenes:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener órdenes.' 
        });
    }
};

// ✅ OBTENER UNA ORDEN ESPECÍFICA
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await db.query(`
            SELECT 
                o.id_orden,
                o.codigo_orden,
                o.id_escuela,
                o.id_menu,
                o.id_usuario,
                o.cantidad_alumnos,
                o.dias_duracion,
                o.fecha_entrega,
                o.fecha_creacion,
                o.estado,
                o.valor_total,
                o.observaciones
            FROM orden o
            WHERE o.id_orden = ?
        `, [id]);

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        // Obtener productos de la orden
        const [productos] = await db.query(`
            SELECT 
                op.id_producto,
                p.nombre_producto,
                op.cantidad,
                op.unidad_medida
            FROM orden_producto op
            INNER JOIN producto p ON op.id_producto = p.id_producto
            WHERE op.id_orden = ?
        `, [id]);

        res.status(200).json({
            order: orders[0],
            productos: productos
        });

    } catch (error) {
        console.error("Error al obtener orden:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener orden.' 
        });
    }
};

// ✅ ACTUALIZAR ESTADO DE ORDEN
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ['PENDIENTE', 'EN PROCESO', 'ENTREGADO', 'CANCELADO'];
        if (!estadosValidos.includes(estado.toUpperCase())) {
            return res.status(400).json({ 
                message: 'Estado inválido.' 
            });
        }

        const [result] = await db.query(
            'UPDATE orden SET estado = ? WHERE id_orden = ?',
            [estado.toUpperCase(), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        res.status(200).json({ 
            message: 'Estado de orden actualizado exitosamente.' 
        });

    } catch (error) {
        console.error("Error al actualizar orden:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor.' 
        });
    }
};
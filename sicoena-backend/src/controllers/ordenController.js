const db = require('../config/db');

exports.createOrder = async (req, res) => {
    const { 
        codigo_orden, 
        id_escuela, 
        id_menu, 
        id_responsable,
        cantidad_alumnos, 
        dias_duracion, 
        fecha_entrega,
        valor_total,
        productos,
        observaciones 
    } = req.body;

    if (!codigo_orden || !id_escuela || !id_menu || !id_responsable) {
        return res.status(400).json({ message: 'Campos requeridos faltantes.' });
    }

    if (!productos || productos.length === 0) {
        return res.status(400).json({ message: 'Debes seleccionar al menos un producto.' });
    }

    try {        
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
                estado,
                fecha_creacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', NOW())
        `;

        const [resultOrden] = await db.query(sqlOrden, [
            codigo_orden,
            id_escuela,
            id_menu,
            id_responsable,
            cantidad_alumnos || 0,
            dias_duracion || 1,
            fecha_entrega || null,
            parseFloat(valor_total) || 0,  
            observaciones || null
        ]);

        const idOrden = resultOrden.insertId;
        
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
            
            const sqlMovimiento = `
                INSERT INTO movimiento (
                    id_producto, 
                    tipo_movimiento, 
                    cantidad, 
                    descripcion, 
                    fecha_movimiento
                ) VALUES (?, 'SALIDA', ?, ?, NOW())
            `;

            await db.query(sqlMovimiento, [
                producto.id_producto,
                producto.cantidad || 1,
                `Salida por orden ${codigo_orden}`
            ]);
            
            const sqlUpdateStock = `
                UPDATE producto 
                SET stock_disponible = stock_disponible - ? 
                WHERE id_producto = ?
            `;
            await db.query(sqlUpdateStock, [
                producto.cantidad || 1,
                producto.id_producto
            ]);
        }

        console.log(`Orden ${codigo_orden} creada exitosamente con fecha: ${new Date().toISOString()}`);

        res.status(201).json({
            message: 'Orden creada exitosamente.',
            id_orden: idOrden,
            codigo_orden: codigo_orden,
            fecha_creacion: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error al crear orden:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe una orden con ese código.' });
        }
        res.status(500).json({ 
            message: 'Error interno del servidor al crear orden.',
            error: error.message 
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
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
                e.nombre_escuela,
                m.nombre as nombre_menu,
                CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as nombre_responsable
            FROM orden o
            LEFT JOIN escuela e ON o.id_escuela = e.id_escuela
            LEFT JOIN menu m ON o.id_menu = m.id_menu
            LEFT JOIN usuario u ON o.id_usuario = u.id_usuario
            ORDER BY o.fecha_creacion DESC
        `);

        console.log('Órdenes obtenidas:', orders);
        
        res.status(200).json(orders);

    } catch (error) {
        console.error("Error al obtener órdenes:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener órdenes.',
            error: error.message
        });
    }
};

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

        
        const [productos] = await db.query(`
            SELECT 
                op.id_producto,
                p.nombre_producto,
                op.cantidad,
                op.unidad_medida,
                p.precio_unitario
            FROM orden_producto op
            INNER JOIN producto p ON op.id_producto = p.id_producto
            WHERE op.id_orden = ?
            ORDER BY p.nombre_producto ASC
        `, [id]);

        console.log(`📦 Productos de la orden ${id}:`, productos);

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

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const estadosValidos = ['PENDIENTE', 'EN PROCESO', 'ENTREGADO', 'CANCELADO'];
        
        if (!estado || !estadosValidos.includes(estado.toUpperCase())) {
            return res.status(400).json({ 
                message: 'Estado inválido. Estados válidos: PENDIENTE, EN PROCESO, ENTREGADO, CANCELADO' 
            });
        }
        
        const sql = `
            UPDATE orden 
            SET estado = ? 
            WHERE id_orden = ?
        `;

        const [result] = await db.query(sql, [estado.toUpperCase(), id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        console.log(`Estado de la orden ${id} actualizado a: ${estado.toUpperCase()}`);

        res.status(200).json({
            message: `Orden actualizada a estado: ${estado.toUpperCase()}`,
            id_orden: id,
            estado: estado.toUpperCase()
        });

    } catch (error) {
        console.error("Error al actualizar estado de orden:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al actualizar estado de orden.',
            error: error.message 
        });
    }
};

exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    const { 
        codigo_orden, 
        id_escuela, 
        id_menu, 
        id_responsable,
        cantidad_alumnos, 
        dias_duracion, 
        fecha_entrega,
        valor_total,
        productos,
        observaciones 
    } = req.body;

    if (!codigo_orden || !id_escuela || !id_menu || !id_responsable) {
        return res.status(400).json({ message: 'Campos requeridos faltantes.' });
    }

    try {
        
        const sqlUpdate = `
            UPDATE orden SET
                codigo_orden = ?,
                id_escuela = ?,
                id_menu = ?,
                id_usuario = ?,
                cantidad_alumnos = ?,
                dias_duracion = ?,
                fecha_entrega = ?,
                valor_total = ?,
                observaciones = ?
            WHERE id_orden = ?
        `;

        const [result] = await db.query(sqlUpdate, [
            codigo_orden,
            id_escuela,
            id_menu,
            id_responsable,
            cantidad_alumnos || 0,
            dias_duracion || 1,
            fecha_entrega || null,
            valor_total || 0,
            observaciones || null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }
        
        await db.query('DELETE FROM orden_producto WHERE id_orden = ?', [id]);
        
        if (productos && productos.length > 0) {
            for (const producto of productos) {
                const sqlProducto = `
                    INSERT INTO orden_producto (id_orden, id_producto, cantidad, unidad_medida)
                    VALUES (?, ?, ?, ?)
                `;
                await db.query(sqlProducto, [
                    id,
                    producto.id_producto,
                    producto.cantidad || 1,
                    producto.unidad_medida || 'unidad'
                ]);
            }
        }

        console.log(`Orden ${id} actualizada exitosamente`);

        res.status(200).json({
            message: 'Orden actualizada exitosamente.',
            id_orden: id,
            codigo_orden: codigo_orden
        });

    } catch (error) {
        console.error("Error al actualizar orden:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al actualizar orden.',
            error: error.message 
        });
    }
};
// src/controllers/productController.js
const db = require('../config/db');

// --- Obtener Todos los Productos (con filtros) ---
exports.getAllProducts = async (req, res) => {
    try {
        const { search, categoria, bodega, estado, stock } = req.query;

        let sql = `
            SELECT 
                p.id_producto, p.nombre_producto, p.descripcion, p.categoria, 
                p.unidad_medida, p.precio_unitario, p.stock_disponible, p.stock_minimo, 
                p.perecedero, p.fecha_vencimiento, p.id_proveedor, p.id_bodega, p.estado 
                -- Puedes añadir JOINs aquí si necesitas nombres de proveedor o bodega
                -- ,pr.nombre_proveedor, b.nombre_bodega 
            FROM producto p 
            -- LEFT JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
            -- LEFT JOIN bodega b ON p.id_bodega = b.id_bodega
            WHERE 1=1 
        `;
        const params = [];

        // Filtro de Estado (Asume columna 'estado' VARCHAR o TINYINT)
        if (estado && estado !== 'todos' && (estado.toUpperCase() === 'ACTIVO' || estado.toUpperCase() === 'INACTIVO')) {
     sql += ` AND p.estado = ?`;
     params.push(estado.toUpperCase());
} 

        // Filtro de Búsqueda (nombre, descripción, categoría)
        if (search) {
            sql += ` AND (p.nombre_producto LIKE ? OR p.descripcion LIKE ? OR p.categoria LIKE ?)`;
            const searchTermLike = `%${search}%`;
            params.push(searchTermLike, searchTermLike, searchTermLike);
        }
        // Filtro de Categoría
        if (categoria && categoria !== 'todos') {
            sql += ` AND p.categoria = ?`;
            params.push(categoria);
        }
        // Filtro de Bodega (por ID)
        if (bodega && bodega !== 'todos') {
             sql += ` AND p.id_bodega = ?`;
             params.push(bodega);
        }
        // Filtro de Stock Bajo
        if (stock === 'bajo') {
            sql += ` AND p.stock_disponible <= p.stock_minimo`;
        }

        sql += ` ORDER BY p.id_producto DESC`;

        const [rows] = await db.query(sql, params);
        res.status(200).json(rows);

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener productos.' });
    }
};

exports.getActiveMenus = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
        const [menus] = await db.query(
            'SELECT id_menu, nombre FROM menu WHERE estado = ? ORDER BY nombre ASC',
            ['ACTIVO']
        );

        res.status(200).json({
            message: 'Menús activos obtenidos exitosamente.',
            menus: menus,
            total: menus.length
        });

    } catch (error) {
        console.error("Error al obtener menús activos:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener menús activos.',
            error: error.message 
        });
    }
};

exports.getMenuProducts = async (req, res) => {
    try {
        const { menuId } = req.params;

        if (!menuId) {
            return res.status(400).json({ message: 'ID del menú es requerido.' });
        }

        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
        // Consulta que obtiene los productos asociados a un menú
        const [products] = await db.query(`
            SELECT 
                mp.id_menu_producto,
                p.id_producto,
                p.nombre_producto,
                mp.cantidad,
                mp.unidad_medida,
                p.categoria,
                p.stock_disponible,
                p.estado
            FROM menu_producto mp
            INNER JOIN producto p ON mp.id_producto = p.id_producto
            WHERE mp.id_menu = ?
            ORDER BY p.nombre_producto ASC
        `, [menuId]);

        res.status(200).json({
            message: 'Productos del menú obtenidos exitosamente.',
            products: products,
            total: products.length
        });

    } catch (error) {
        console.error("Error al obtener productos del menú:", error);
        res.status(500).json({ 
            message: 'Error interno del servidor al obtener productos del menú.',
            error: error.message 
        });
    }
};

// --- Crear Producto ---
exports.createProduct = async (req, res) => {
    const {
        nombre_producto,
        descripcion,
        categoria,
        unidad_medida,
        precio_unitario,
        stock_disponible,
        stock_minimo,
        perecedero,
        fecha_vencimiento,
        id_proveedor,
        id_bodega,
        estado
    } = req.body;

    // Validación básica
     if (!nombre_producto || !categoria || !unidad_medida || precio_unitario === undefined || stock_disponible === undefined || stock_minimo === undefined || !id_bodega) {
        return res.status(400).json({ message: 'Campos requeridos faltantes (nombre, categoría, unidad, precio, stock inicial, stock mínimo, bodega).' });
    }
    
    if (estado && estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO') {
        return res.status(400).json({ message: 'Estado inválido (debe ser ACTIVO o INACTIVO)' })
    }

    try {
        const sql = `
            INSERT INTO producto (
                nombre_producto, descripcion, categoria, unidad_medida, precio_unitario,
                stock_disponible, stock_minimo, perecedero, fecha_vencimiento,
                id_proveedor, id_bodega, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            nombre_producto,
            descripcion || null,
            categoria,
            unidad_medida,
            precio_unitario,
            stock_disponible,
            stock_minimo,
            perecedero ? 1 : 0,
            fecha_vencimiento || null,
            id_proveedor || null,
            id_bodega,
            estado ? estado.toUpperCase() : 'ACTIVO'
        ];

        const [result] = await db.query(sql, params);
        const productoId = result.insertId;

if (stock_disponible > 0) {
            const movimientoSql = `
                INSERT INTO movimiento (
                    id_producto, 
                    tipo_movimiento, 
                    cantidad, 
                    monto, 
                    descripcion, 
                    fecha_movimiento
                ) VALUES (?, 'ENTRADA', ?, ?, 'Entrada inicial de inventario', NOW())
            `;
            
            const movimientoMonto = stock_disponible * precio_unitario; // Calcula el valor total
            
            await db.query(movimientoSql, [productoId, stock_disponible, movimientoMonto]);
        }

        res.status(201).json({ 
            id_producto: productoId, 
            ...req.body 
        });

    } catch (error) {
        console.error("Error al crear producto:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ya existe un producto con ese nombre o código.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear producto.' });
    }
};

// --- Actualizar Producto ---
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
        nombre_producto, descripcion, categoria, unidad_medida, precio_unitario,
        stock_disponible, stock_minimo, perecedero, fecha_vencimiento,
        id_proveedor, id_bodega, estado
    } = req.body;

    // Validación básica (similar a create)
     if (!nombre_producto || !categoria || !unidad_medida || precio_unitario === undefined || stock_disponible === undefined || stock_minimo === undefined || !id_bodega) {
        return res.status(400).json({ message: 'Campos requeridos faltantes.' });
    }
     if (estado && estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO') {
        return res.status(400).json({ message: 'Estado inválido.'})
    }

    try {
        const sql = `
            UPDATE producto SET
                nombre_producto = ?, descripcion = ?, categoria = ?, unidad_medida = ?, precio_unitario = ?,
                stock_disponible = ?, stock_minimo = ?, perecedero = ?, fecha_vencimiento = ?,
                id_proveedor = ?, id_bodega = ?, estado = ?
            WHERE id_producto = ?
        `;
        const params = [
            nombre_producto, descripcion || null, categoria, unidad_medida, precio_unitario,
            stock_disponible, stock_minimo, perecedero ? 1 : 0, fecha_vencimiento || null,
            id_proveedor || null, id_bodega, estado ? estado.toUpperCase() : 'ACTIVO',
            id
        ];

        const [result] = await db.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json({ message: 'Producto actualizado.', id_producto: id, ...req.body });

    } catch (error) {
        console.error("Error al actualizar producto:", error);
         if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'Ya existe otro producto con ese nombre o código.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar producto.' });
    }
};

// --- Actualizar Estado del Producto ---
exports.updateProductStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || (estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO')) {
        return res.status(400).json({ message: 'Estado inválido.' });
    }

    try {
        const estadoValor = estado.toUpperCase(); // Asumiendo estado VARCHAR
        // Si fuera TINYINT: const estadoValor = estado.toUpperCase() === 'ACTIVO' ? 1 : 0;
        const [result] = await db.query(
            'UPDATE producto SET estado = ? WHERE id_producto = ?',
            [estadoValor, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json({ message: `Producto puesto en estado ${estado.toLowerCase()} con éxito.` });
    } catch (error) {
        console.error("Error al actualizar estado del producto:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

exports.getProductCategories = async (req, res) => {
    try {
        // Consulta para obtener las categorías únicas y no nulas
        const [rows] = await db.query(
            'SELECT DISTINCT categoria FROM producto WHERE categoria IS NOT NULL AND categoria != "" ORDER BY categoria ASC'
        );
        // Extrae solo los nombres de categoría del resultado
        const categories = rows.map(row => row.categoria);
        res.status(200).json(categories); // Devuelve un array de strings ['Fruta', 'Verdura', ...]

    } catch (error) {
        console.error("Error al obtener categorías de producto:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener categorías.' });
    }
};
// --- (Opcional) Obtener Producto por ID ---
// exports.getProductById = async (req, res) => { ... }
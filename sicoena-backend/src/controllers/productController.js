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
        if (estado && (estado.toUpperCase() === 'ACTIVO' || estado.toUpperCase() === 'INACTIVO')) {
             sql += ` AND p.estado = ?`;
             params.push(estado.toUpperCase()); // Guarda como ACTIVO/INACTIVO si es VARCHAR
             // Si es TINYINT, usa: params.push(estado.toUpperCase() === 'ACTIVO' ? 1 : 0);
        } else {
             sql += ` AND p.estado = 'ACTIVO'`; // Default a activos
             // Si es TINYINT, usa: sql += ` AND p.estado = 1`;
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

// --- Crear Producto ---
exports.createProduct = async (req, res) => {
    // Extrae los campos de la tabla 'producto' desde req.body
    const {
        nombre_producto,
        descripcion,
        categoria,
        unidad_medida,
        precio_unitario,
        stock_disponible, // Corresponde a 'stockInicial' del modal
        stock_minimo,
        perecedero,        // Espera 1 o 0
        fecha_vencimiento,
        id_proveedor,
        id_bodega,
        estado             // Asume que envías 'ACTIVO' o 'INACTIVO'
    } = req.body;

    // Validación básica
    if (!nombre_producto || !categoria || !unidad_medida || precio_unitario === undefined || stock_disponible === undefined || stock_minimo === undefined || !id_bodega) {
        return res.status(400).json({ message: 'Campos requeridos faltantes (nombre, categoría, unidad, precio, stock inicial, stock mínimo, bodega).' });
    }
     if (estado && estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO') {
        return res.status(400).json({ message: 'Estado inválido (debe ser ACTIVO o INACTIVO)'})
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
            unidad_medida, // Asegúrate que el frontend envíe el tipo correcto (DECIMAL)
            precio_unitario,
            stock_disponible,
            stock_minimo,
            perecedero ? 1 : 0, // Convierte boolean a 1/0
            fecha_vencimiento || null,
            id_proveedor || null,
            id_bodega,
            estado ? estado.toUpperCase() : 'ACTIVO' // Default ACTIVO
        ];

        const [result] = await db.query(sql, params);
        res.status(201).json({ id_producto: result.insertId, ...req.body });

    } catch (error) {
        console.error("Error al crear producto:", error);
        if (error.code === 'ER_DUP_ENTRY') { // Si tienes unique keys (ej: nombre_producto?)
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

// --- (Opcional) Obtener Producto por ID ---
// exports.getProductById = async (req, res) => { ... }
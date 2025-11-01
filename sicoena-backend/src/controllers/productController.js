// src/controllers/productController.js

const db = require('../config/db');
const { createNotification } = require('./notificationController');

// ✅ FUNCIÓN PARA VERIFICAR Y NOTIFICAR STOCK BAJO
const checkAndNotifyLowStock = async (products) => {
  try {
    const STOCK_MINIMO = 10;
    const lowStockProducts = products.filter(
      p => p.stock_disponible <= p.stock_minimo && p.estado === 'ACTIVO'
    );

    if (lowStockProducts.length === 0) {
      console.log('✅ Todos los productos tienen stock adecuado');
      return;
    }

    console.log(`⚠️ ${lowStockProducts.length} productos con stock bajo detectados`);

    // Obtener todos los admins activos
    const [admins] = await db.query(
      `SELECT id_usuario FROM usuario WHERE rol = 'ADMINISTRADOR' AND estado = 'ACTIVO'`
    );

    console.log(`📨 Notificando a ${admins.length} administradores`);

    // Crear notificación para cada producto con stock bajo
    for (const product of lowStockProducts) {
      for (const admin of admins) {
        try {
          // Verificar si ya existe notificación reciente SIN LEER
          const [existing] = await db.query(
            `SELECT id_notificacion FROM notificacion 
             WHERE id_usuario = ? 
             AND titulo LIKE ? 
             AND leida = FALSE 
             AND fecha_creacion > DATE_SUB(NOW(), INTERVAL 2 HOUR)`,
            [admin.id_usuario, `%${product.nombre_producto}%`]
          );

          if (existing.length === 0) {
            await createNotification(
              admin.id_usuario,
              `⚠️ Stock bajo: ${product.nombre_producto}`,
              `El producto "${product.nombre_producto}" tiene ${product.stock_disponible} unidades en stock (mínimo: ${product.stock_minimo})`,
              'stock'
            );
            console.log(`📨 Notificación creada para ${product.nombre_producto} - Admin ${admin.id_usuario}`);
          } else {
            console.log(`⏭️ Notificación duplicada evitada para ${product.nombre_producto}`);
          }
        } catch (error) {
          console.error('⚠️ Error creando notificación:', error.message);
        }
      }
    }

    console.log('✅ Verificación de stock completada');
  } catch (error) {
    console.error('❌ Error en checkAndNotifyLowStock:', error);
  }
};

// --- Obtener Todos los Productos (con filtros) ---
exports.getAllProducts = async (req, res) => {
  try {
    const { search, categoria, bodega, estado, stock } = req.query;

    let sql = `
      SELECT 
        p.id_producto, 
        p.nombre_producto, 
        p.descripcion, 
        p.categoria, 
        p.unidad_medida, 
        p.precio_unitario, 
        p.stock_disponible, 
        p.stock_minimo, 
        p.perecedero, 
        p.fecha_vencimiento, 
        p.id_proveedor, 
        p.id_bodega, 
        p.estado 
      FROM producto p 
      WHERE 1=1 
    `;
    const params = [];

    // Filtro de Estado
    if (estado && estado !== 'todos' && (estado.toUpperCase() === 'ACTIVO' || estado.toUpperCase() === 'INACTIVO')) {
      sql += ` AND p.estado = ?`;
      params.push(estado.toUpperCase());
    }

    // Filtro de Búsqueda
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

    // Filtro de Bodega
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

    // ✅ VERIFICAR STOCK BAJO Y CREAR NOTIFICACIONES
    await checkAndNotifyLowStock(rows);

    console.log(`📦 ${rows.length} productos obtenidos`);
    res.status(200).json(rows);

  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
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
    console.error("❌ Error al obtener menús activos:", error);
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

    const [products] = await db.query(`
      SELECT 
        mp.id_menu_producto,
        p.id_producto,
        p.nombre_producto,
        mp.cantidad,
        p.unidad_medida,
        p.categoria,
        p.stock_disponible,
        p.estado,
        p.precio_unitario
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
    console.error("❌ Error al obtener productos del menú:", error);
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

    // ✅ REGISTRAR MOVIMIENTO DE ENTRADA INICIAL
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

      const movimientoMonto = stock_disponible * precio_unitario;

      await db.query(movimientoSql, [productoId, stock_disponible, movimientoMonto]);
      console.log(`✅ Movimiento de entrada registrado para producto ${productoId}`);
    }

    // ✅ VERIFICAR STOCK BAJO DEL NUEVO PRODUCTO
    const [newProduct] = await db.query(
      'SELECT * FROM producto WHERE id_producto = ?',
      [productoId]
    );

    if (newProduct.length > 0) {
      await checkAndNotifyLowStock(newProduct);
    }

    console.log(`✅ Producto creado: ${productoId}`);

    res.status(201).json({
      id_producto: productoId,
      ...req.body
    });

  } catch (error) {
    console.error("❌ Error al crear producto:", error);
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

  // Validación básica
  if (!nombre_producto || !categoria || !unidad_medida || precio_unitario === undefined || stock_disponible === undefined || stock_minimo === undefined || !id_bodega) {
    return res.status(400).json({ message: 'Campos requeridos faltantes.' });
  }

  if (estado && estado.toUpperCase() !== 'ACTIVO' && estado.toUpperCase() !== 'INACTIVO') {
    return res.status(400).json({ message: 'Estado inválido.' })
  }

  try {
    // ✅ OBTENER EL STOCK ANTERIOR
    const [existingProduct] = await db.query(
      'SELECT stock_disponible FROM producto WHERE id_producto = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    const stockAnterior = existingProduct[0].stock_disponible;
    const diferencia = stock_disponible - stockAnterior;

    // Actualizar el producto
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

    // ✅ REGISTRAR MOVIMIENTO SI HAY CAMBIO DE STOCK
    if (diferencia !== 0) {
      const tipoMovimiento = diferencia > 0 ? 'ENTRADA' : 'SALIDA';
      const cantidadAbsoluta = Math.abs(diferencia);

      const sqlMovimiento = `
        INSERT INTO movimiento (
          id_producto, 
          tipo_movimiento, 
          cantidad, 
          descripcion, 
          fecha_movimiento
        ) VALUES (?, ?, ?, ?, NOW())
      `;

      const descripcionMovimiento = `${tipoMovimiento} por ajuste de inventario (${stockAnterior} → ${stock_disponible})`;

      await db.query(sqlMovimiento, [
        id,
        tipoMovimiento,
        cantidadAbsoluta,
        descripcionMovimiento
      ]);

      console.log(`✅ Movimiento registrado: ${tipoMovimiento} de ${cantidadAbsoluta} unidades del producto ${id}`);
    }

    // ✅ VERIFICAR STOCK BAJO DEL PRODUCTO ACTUALIZADO
    const [updatedProduct] = await db.query(
      'SELECT * FROM producto WHERE id_producto = ?',
      [id]
    );

    if (updatedProduct.length > 0) {
      await checkAndNotifyLowStock(updatedProduct);
    }

    console.log(`✅ Producto actualizado: ${id}`);

    res.status(200).json({
      message: 'Producto actualizado.',
      id_producto: id,
      movimiento_registrado: diferencia !== 0,
      tipo_movimiento: diferencia > 0 ? 'ENTRADA' : 'SALIDA',
      cantidad: Math.abs(diferencia)
    });

  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
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
    const estadoValor = estado.toUpperCase();
    const [result] = await db.query(
      'UPDATE producto SET estado = ? WHERE id_producto = ?',
      [estadoValor, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    console.log(`✅ Producto ${id} puesto en estado ${estado.toLowerCase()}`);

    res.status(200).json({ message: `Producto puesto en estado ${estado.toLowerCase()} con éxito.` });
  } catch (error) {
    console.error("❌ Error al actualizar estado del producto:", error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.getProductCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DISTINCT categoria FROM producto WHERE categoria IS NOT NULL AND categoria != "" ORDER BY categoria ASC'
    );
    const categories = rows.map(row => row.categoria);

    console.log(`📂 ${categories.length} categorías obtenidas`);

    res.status(200).json(categories);

  } catch (error) {
    console.error("❌ Error al obtener categorías de producto:", error);
    res.status(500).json({ message: 'Error interno del servidor al obtener categorías.' });
  }
};
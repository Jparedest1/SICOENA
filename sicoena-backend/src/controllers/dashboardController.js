// src/controllers/dashboardController.js
const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        // --- Consultas a la Base de Datos ---

        // Usuarios Registrados (ACTIVOS - ya lo teníamos, pero lo renombramos)
        const [activeUserResult] = await db.query('SELECT COUNT(*) as count FROM usuario WHERE estado = "ACTIVO"');
        const usuariosActivos = activeUserResult[0].count;

        // --- NUEVA CONSULTA: Usuarios Inactivos ---
        const [inactiveUserResult] = await db.query('SELECT COUNT(*) as count FROM usuario WHERE estado = "INACTIVO"');
        const usuariosInactivos = inactiveUserResult[0].count;

        // Reportes Generados (Simulado)
        const reportCount = 25; // Simulado

        // Alertas del Sistema (Simulado - podríamos hacerlo dinámico para stock bajo)
        const [lowStockResult] = await db.query('SELECT COUNT(*) as count FROM producto WHERE stock_disponible <= stock_minimo'); // Asumiendo tabla 'producto' y columnas
        const alertCount = lowStockResult[0].count || 0; // Usa 0 si la tabla no existe o no hay stock bajo


        // --- Respuesta Actualizada ---
        res.status(200).json({
            // Mantenemos 'usuariosRegistrados' si quieres el total general en otro lado,
            // pero las tarjetas ahora usarán activos/inactivos
            usuariosRegistrados: usuariosActivos + usuariosInactivos, // Total
            usuariosActivos: usuariosActivos,         // Nuevo
            usuariosInactivos: usuariosInactivos,     // Nuevo
            reportesGenerados: reportCount,
            alertasSistema: alertCount,
        });

    } catch (error) {
        console.error("Error al obtener estadísticas del dashboard:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener estadísticas.' });
    }
};
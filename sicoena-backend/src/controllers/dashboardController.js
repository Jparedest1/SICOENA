// src/controllers/dashboardController.js

const pool = require('../config/db');

const getStats = async (req, res) => {
  console.log('➡️  Recibida petición para obtener estadísticas del dashboard.');

  try {
    // --- Ejecutamos todas las consultas en paralelo para máxima eficiencia ---
    const [
      [userStats],
      [reportStats],
      [alertStats] // <-- ¡NUEVA CONSULTA PARA ALERTAS!
    ] = await Promise.all([
      pool.query("SELECT estado, COUNT(*) as count FROM usuario GROUP BY estado"),
      pool.query("SELECT COUNT(*) as count FROM reportes_generados"),
      // Esta consulta cuenta los productos activos cuyo stock es menor o igual al mínimo
      pool.query("SELECT COUNT(*) AS count FROM producto WHERE stock_disponible <= stock_minimo AND estado = 'ACTIVO'")
    ]);

    // --- Procesamos los resultados ---
    const usuariosActivos = userStats.find(s => s.estado === 'ACTIVO')?.count || 0;
    const usuariosInactivos = userStats.find(s => s.estado === 'INACTIVO')?.count || 0;
    const reportesGenerados = reportStats[0]?.count || 0;
    const alertasSistema = alertStats[0]?.count || 0; // <-- ¡NUEVO VALOR DINÁMICO!

    console.log(`✅ Estadísticas calculadas: Activos=${usuariosActivos}, Inactivos=${usuariosInactivos}, Reportes=${reportesGenerados}, Alertas=${alertasSistema}`);
    
    // --- Enviamos el objeto completo al frontend ---
    res.json({
      usuariosActivos,
      usuariosInactivos,
      reportesGenerados,
      alertasSistema, 
    });

  } catch (error) {
    console.error('🔴 Error al obtener las estadísticas del dashboard:', error);
    res.status(500).json({ message: 'Error interno al cargar las estadísticas.' });
  }
};

module.exports = {
  getStats,
};
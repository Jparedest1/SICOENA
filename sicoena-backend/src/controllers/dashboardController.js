const pool = require('../config/db');

const getStats = async (req, res) => {
  console.log('Recibida petición para obtener estadísticas del dashboard.');

  try {    
    const [
      [userStats],
      [reportStats],
      [alertStats] 
    ] = await Promise.all([
      pool.query("SELECT estado, COUNT(*) as count FROM usuario GROUP BY estado"),
      pool.query("SELECT COUNT(*) as count FROM reportes_generados"),
      
      pool.query("SELECT COUNT(*) AS count FROM producto WHERE stock_disponible <= stock_minimo AND estado = 'ACTIVO'")
    ]);
    
    const usuariosActivos = userStats.find(s => s.estado === 'ACTIVO')?.count || 0;
    const usuariosInactivos = userStats.find(s => s.estado === 'INACTIVO')?.count || 0;
    const reportesGenerados = reportStats[0]?.count || 0;
    const alertasSistema = alertStats[0]?.count || 0; 

    console.log(`Estadísticas calculadas: Activos=${usuariosActivos}, Inactivos=${usuariosInactivos}, Reportes=${reportesGenerados}, Alertas=${alertasSistema}`);
        
    res.json({
      usuariosActivos,
      usuariosInactivos,
      reportesGenerados,
      alertasSistema, 
    });

  } catch (error) {
    console.error('Error al obtener las estadísticas del dashboard:', error);
    res.status(500).json({ message: 'Error interno al cargar las estadísticas.' });
  }
};

module.exports = {
  getStats,
};
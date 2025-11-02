// src/controllers/dashboardController.js

const pool = require('../config/db'); // ¡Importante! Usa la conexión directa a la BD

exports.getStats = async (req, res) => {
  try {
    // Contar reportes generados
    const [reportRows] = await pool.query('SELECT COUNT(*) AS total FROM reportes_generados');
    const reportesGenerados = reportRows[0].total;

    // Contar usuarios activos
    const [activeUsers] = await pool.query("SELECT COUNT(*) AS total FROM usuario WHERE estado = 'Activo'");
    const usuariosActivos = activeUsers[0].total;
    
    // Contar usuarios inactivos
    const [inactiveUsers] = await pool.query("SELECT COUNT(*) AS total FROM usuario WHERE estado = 'Inactivo'");
    const usuariosInactivos = inactiveUsers[0].total;

    res.json({
      usuariosActivos: usuariosActivos,
      usuariosInactivos: usuariosInactivos,
      reportesGenerados: reportesGenerados,
      alertasSistema: 0, // Puedes desarrollar esta lógica después
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ message: 'No se pudieron cargar las estadísticas.' });
  }
};
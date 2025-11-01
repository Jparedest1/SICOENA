// src/controllers/notificationController.js

const db = require('../config/db');

// ✅ Obtener notificaciones del usuario
const getNotifications = async (req, res) => {
  try {
    // ✅ Verificar que req.user existe y tiene id
    if (!req.user || !req.user.id) {
      console.log('❌ No user ID in request');
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const userId = req.user.id;
    const { limit = 10, unreadOnly = false } = req.query;

    console.log('📬 Obteniendo notificaciones para usuario:', userId);

    let sql = `
      SELECT 
        id_notificacion as id,
        titulo,
        descripcion as \`text\`,
        tipo,
        leida as \`read\`,
        DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') as fecha,
        CASE 
          WHEN TIMESTAMPDIFF(MINUTE, fecha_creacion, NOW()) < 1 THEN 'Hace unos segundos'
          WHEN TIMESTAMPDIFF(MINUTE, fecha_creacion, NOW()) < 60 THEN CONCAT('Hace ', TIMESTAMPDIFF(MINUTE, fecha_creacion, NOW()), ' min')
          WHEN TIMESTAMPDIFF(HOUR, fecha_creacion, NOW()) < 24 THEN CONCAT('Hace ', TIMESTAMPDIFF(HOUR, fecha_creacion, NOW()), ' horas')
          WHEN TIMESTAMPDIFF(DAY, fecha_creacion, NOW()) = 1 THEN 'Ayer'
          ELSE DATE_FORMAT(fecha_creacion, '%d/%m')
        END as time
      FROM notificacion
      WHERE id_usuario = ?
    `;

    const params = [userId];

    if (unreadOnly === 'true' || unreadOnly === true) {
      sql += ` AND leida = FALSE`;
    }

    sql += ` ORDER BY fecha_creacion DESC LIMIT ?`;
    params.push(parseInt(limit));

    console.log('🔍 Executing SQL:', sql);
    console.log('📌 Params:', params);

    const [notifications] = await db.query(sql, params);

    console.log(`✅ ${notifications.length} notificaciones obtenidas`);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    res.status(500).json({ 
      message: 'Error al obtener notificaciones',
      error: error.message 
    });
  }
};

// ✅ Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const { id } = req.params;
    const userId = req.user.id;

    console.log(`📝 Marcando notificación ${id} como leída para usuario ${userId}`);

    const [result] = await db.query(
      `UPDATE notificacion 
       SET leida = TRUE, fecha_lectura = NOW() 
       WHERE id_notificacion = ? AND id_usuario = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.status(200).json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('❌ Error al marcar notificación:', error);
    res.status(500).json({ message: 'Error al actualizar notificación' });
  }
};

// ✅ Marcar todas como leídas
const markAllAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const userId = req.user.id;

    console.log(`📝 Marcando todas las notificaciones como leídas para usuario ${userId}`);

    const [result] = await db.query(
      `UPDATE notificacion 
       SET leida = TRUE, fecha_lectura = NOW() 
       WHERE id_usuario = ? AND leida = FALSE`,
      [userId]
    );

    console.log(`✅ ${result.affectedRows} notificaciones marcadas como leídas`);

    res.status(200).json({ 
      message: 'Todas las notificaciones marcadas como leídas',
      updated: result.affectedRows 
    });
  } catch (error) {
    console.error('❌ Error al marcar todas como leídas:', error);
    res.status(500).json({ message: 'Error al actualizar notificaciones' });
  }
};

// ✅ Función auxiliar para crear notificaciones
const createNotification = async (userId, titulo, descripcion, tipo = 'general') => {
  try {
    console.log(`📨 Creando notificación para usuario ${userId}`);

    await db.query(
      `INSERT INTO notificacion (id_usuario, titulo, descripcion, tipo) 
       VALUES (?, ?, ?, ?)`,
      [userId, titulo, descripcion, tipo]
    );

    console.log(`✅ Notificación creada`);
  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
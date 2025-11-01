// src/utils/scheduledTasks.js

const startScheduledTasks = () => {
  console.log('⏰ Iniciando tareas programadas...');

  // Las notificaciones de stock se generan cuando se consulta el inventario
  // Aquí puedes agregar otras tareas periódicas si las necesitas
  
  // Ejemplo: Limpiar notificaciones antiguas cada 24 horas
  setInterval(async () => {
    try {
      console.log('🧹 Limpiando notificaciones antiguas...');
      // Aquí puedes agregar lógica para eliminar notificaciones de más de 30 días
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 horas

  console.log('✅ Tareas programadas iniciadas');
};

module.exports = {
  startScheduledTasks
};
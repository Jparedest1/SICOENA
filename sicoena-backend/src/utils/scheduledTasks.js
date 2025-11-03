const startScheduledTasks = () => {
  console.log('Iniciando tareas programadas...');

  setInterval(async () => {
    try {
      console.log('Limpiando notificaciones antiguas...');

    } catch (error) {
      console.error('Error en limpieza:', error);
    }
  }, 24 * 60 * 60 * 1000); 

  console.log('Tareas programadas iniciadas');
};

module.exports = {
  startScheduledTasks
};
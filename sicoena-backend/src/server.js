// src/server.js

require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const db = require('./config/db');
const { startScheduledTasks } = require('./utils/scheduledTasks');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURACIÓN DE MIDDLEWARES ---

// 1. Habilita CORS para TODAS las solicitudes entrantes.
//    Esta debe ser una de las primeras configuraciones.
app.use(cors({
  origin: 'http://localhost:3000', // Permite solicitudes solo desde tu frontend
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middlewares para parsear el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- RUTAS DE LA API ---

// Ruta de prueba para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.send('¡API de SICOENA funcionando!');
});

// Importa y usa tus rutas principales
const mainRoutes = require('./routes/index');
app.use('/api', mainRoutes);

// Importa y usa tus rutas de reportes
// Ahora también estarán cubiertas por la configuración de CORS de arriba
const reportesRoutes = require('./routes/reportesRoutes');
app.use('/api/reportes', reportesRoutes);


// --- MANEJO DE ERRORES ---

// Manejo de rutas no encontradas (404). Esto debe ir al final.
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});


// --- INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  
  // Inicia las tareas programadas
  startScheduledTasks();
});
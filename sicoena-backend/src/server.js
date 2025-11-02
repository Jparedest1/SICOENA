// src/server.js

require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const db = require('./config/db');
const { startScheduledTasks } = require('./utils/scheduledTasks'); // ✅ NUEVO

const app = express();
const PORT = process.env.PORT || 5000;
const reportesRoutes = require('./routes/reportesRoutes');
app.use('/api/reportes', reportesRoutes);

// --- CONFIGURACIÓN CORS ---
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Middlewares Esenciales ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas Principales ---
app.get('/', (req, res) => {
  res.send('¡API de SICOENA funcionando!');
});

const mainRoutes = require('./routes/index');
app.use('/api', mainRoutes);

// --- Manejo de errores 404 ---
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  
  // ✅ INICIAR TAREAS PROGRAMADAS
  startScheduledTasks();
});
// src/server.js

require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const db = require('./config/db');
const { startScheduledTasks } = require('./utils/scheduledTasks');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas de la API ---
app.get('/', (req, res) => {
  res.send('¡API de SICOENA funcionando!');
});

// ÚNICO punto de entrada para /api
const mainRoutes = require('./routes/index');
app.use('/api', mainRoutes); // mainRoutes ahora maneja TODO, incluidos los reportes.

// --- Manejo de errores 404 ---
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada en el servidor' });
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  startScheduledTasks();
});
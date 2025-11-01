// src/server.js

require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

// --- CONFIGURACIÓN CORS CORRECTA ---
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

// ✅ IMPORTA TODAS TUS RUTAS AQUÍ
const mainRoutes = require('./routes/index');
app.use('/api', mainRoutes);

// ✅ O IMPORTA LAS RUTAS ESPECÍFICAS AQUÍ (alternativa):
// const movementRoutes = require('./routes/movementRoutes');
// const institutionRoutes = require('./routes/institutionRoutes');
// const userRoutes = require('./routes/userRoutes');
// 
// app.use('/api/movimientos', movementRoutes);
// app.use('/api/institucion', institutionRoutes);
// app.use('/api/usuarios', userRoutes);

// --- Manejo de errores 404 ---
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
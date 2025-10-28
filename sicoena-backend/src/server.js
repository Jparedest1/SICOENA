// src/server.js
require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const db = require('./config/db');
const movementRoutes = require('./routes/movementRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// --- CONFIGURACIÓN CORS SIMPLIFICADA Y CORRECTA ---
const corsOptions = {
  origin: 'http://localhost:3000', // URL de tu frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'], // Asegúrate que Authorization esté aquí
  optionsSuccessStatus: 204 // Opcional: Responde rápido a OPTIONS
};

// Aplica el middleware CORS ANTES de tus rutas
// La librería 'cors' manejará automáticamente las peticiones OPTIONS (preflight)
app.use(cors({
  origin: 'http://localhost:3000', // Tu frontend
  credentials: true
}));

// --- Middlewares Esenciales ---
app.use(express.json()); // Debe ir después de CORS si necesitas procesar JSON en OPTIONS (raro)
app.use(express.urlencoded({ extended: true }));
app.use('/api/movimientos', movementRoutes);

// --- Rutas ---
app.get('/', (req, res) => {
  res.send('¡API de SICOENA funcionando!');
});

const mainRoutes = require('./routes/index');
app.use('/api', mainRoutes); // Tus rutas principales van DESPUÉS de app.use(cors())

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
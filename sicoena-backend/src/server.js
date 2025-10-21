// src/server.js
require('dotenv').config(); // Carga las variables de .env al inicio
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Descomentarás esto después

const app = express();
const PORT = process.env.PORT || 5001; // Usa el puerto de .env o 5001 por defecto


app.use(cors()); // Puedes configurarlo más específicamente después
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rutas ---
app.get('/', (req, res) => {
  res.send('¡API de SICOENA funcionando!');
});

// Aquí irán las rutas principales de tu API (ej: /api/usuarios, /api/productos)
const mainRoutes = require('./routes/index');
app.use('/api', mainRoutes);

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  // Aquí podrías añadir una prueba de conexión a la BD
});

// Configuración CORS más específica (reemplaza 'http://localhost:3000' con la URL de tu frontend)
const corsOptions = {
  origin: 'http://localhost:3000', // Permite solo a tu frontend
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const db = require('./config/db');
const { startScheduledTasks } = require('./utils/scheduledTasks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('¡API de SICOENA funcionando!');
});

const mainRoutes = require('./routes/index');
app.use('/api', mainRoutes); 

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada en el servidor' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  startScheduledTasks();
});
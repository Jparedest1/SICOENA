require('dotenv').config(); 
const express = require('express');
const cors = require('cors'); 
const path = require('path');
const db = require('./config/db');
const { startScheduledTasks } = require('./utils/scheduledTasks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mainRoutes = require('./routes/index');
app.use('/api', mainRoutes); 

app.use(express.static(path.join(__dirname, '../sicoena-frontend/build')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../sicoena-frontend/build', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  startScheduledTasks();
});
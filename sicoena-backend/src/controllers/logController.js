// src/controllers/logController.js

const db = require('../config/db');

const createLog = async (level, message, context = {}) => {
  try {
    const query = 'INSERT INTO logs (level, message, context) VALUES (?, ?, ?)';
    const contextString = JSON.stringify(context);
    await db.query(query, [level, message, contextString]);
  } catch (error) {
    console.error('CRITICAL: Falla al escribir en la tabla de logs.', error);
  }
};

const getLogs = async (req, res) => {
  try {
    const query = 'SELECT * FROM logs ORDER BY timestamp DESC';
    const [logs] = await db.query(query);
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error al obtener los logs:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener los logs' });
  }
};

module.exports = {
  createLog,
  getLogs,
};
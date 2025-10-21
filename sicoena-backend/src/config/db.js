// src/config/db.js
const mysql = require('mysql2/promise'); // Usamos la versión con promesas

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10, // Número de conexiones máximas en el pool
  queueLimit: 0
});

// (Opcional) Probar la conexión al iniciar
pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos MySQL establecida con éxito.');
    connection.release(); // Libera la conexión de prueba
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });

module.exports = pool; // Exportamos el pool para usarlo en los controladores
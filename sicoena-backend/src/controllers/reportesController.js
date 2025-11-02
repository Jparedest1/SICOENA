// src/controllers/reportesController.js
const pool = require('../config/db');
const { jsPDF } = require("jspdf");
require("jspdf-autotable");

const registrarReporte = async (tipo, modulo, usuarioId) => {
  try {
    const sql = 'INSERT INTO reportes_generados (tipo, modulo, generado_por_id) VALUES (?, ?, ?)';
    await pool.query(sql, [tipo, modulo, usuarioId]);
    console.log(`Reporte de ${modulo} (${tipo}) registrado para el usuario ${usuarioId}.`);
  } catch (error) {
    console.error('Error al registrar la generación del reporte:', error);
  }
};

const generarReporte = async (req, res) => {
  const { modulo } = req.params;
  const usuarioId = req.usuarioId;

  try {
    let data, headers, titulo;

    switch (modulo) {
      case 'inventario':
        titulo = 'Reporte de Inventario';
        headers = [['ID', 'Nombre', 'Descripción', 'Stock', 'Precio']];
        const [rows] = await pool.query('SELECT id, nombre, descripcion, stock, precio FROM productos ORDER BY nombre ASC');
        data = rows.map(item => [item.id, item.nombre, item.descripcion, item.stock, item.precio]);
        break;
      
      default:
        return res.status(400).json({ message: 'Tipo de reporte no válido.' });
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(titulo, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);

    doc.autoTable({
      startY: 35,
      head: headers,
      body: data,
    });

    const pdfBuffer = doc.output('arraybuffer');
    await registrarReporte('PDF', modulo, usuarioId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${modulo}_${Date.now()}.pdf`);
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error(`Error al generar el reporte de ${modulo}:`, error);
    res.status(500).json({ message: 'Error interno al generar el reporte.' });
  }
};

// --- CAMBIO CLAVE: Exportamos un objeto que contiene la función ---
module.exports = {
  generarReporte,
};
// src/controllers/reportesController.js

const pool = require('../config/db');
const { jsPDF } = require("jspdf");
const { default: autoTable } = require("jspdf-autotable");
const ExcelJS = require('exceljs');

const registrarReporte = async (tipo, modulo, usuarioId) => {
  // Esta función no necesita cambios
  console.log(`➡️  Registrando reporte: Tipo=${tipo}, Módulo=${modulo}, UsuarioID=${usuarioId}`);
  if (!usuarioId) {
    console.error('🔴 ¡FALLO! No se puede registrar porque el ID de Usuario es nulo.');
    return;
  }
  try {
    const sql = 'INSERT INTO reportes_generados (tipo, modulo, generado_por_id) VALUES (?, ?, ?)';
    await pool.query(sql, [tipo, modulo, usuarioId]);
    console.log(`✅ ¡ÉXITO! Reporte registrado en la BD.`);
  } catch (error) {
    console.error('🔴 ¡FALLO CRÍTICO! Error al insertar en la BD:', error);
  }
};

const generarReporte = async (req, res) => {
  const { modulo } = req.params;
  const { format = 'pdf', ...filters } = req.query; // Captura el formato y el resto de los filtros
  const usuarioId = req.user ? req.user.id : null;
  
  console.log(`--- Iniciando generación de reporte ---`);
  console.log(`   - Módulo: ${modulo}, Formato: ${format}, UsuarioID: ${usuarioId}`);
  console.log(`   - Filtros recibidos:`, filters);

  try {
    let data, columns, headers, titulo;

    switch (modulo) {
      case 'inventario':
        // ... (código existente, no necesita cambios)
        titulo = 'Reporte de Inventario';
        columns = [ /*...*/ ];
        headers = [ /*...*/ ];
        const [invRows] = await pool.query('SELECT id_producto AS id, ... FROM producto ...');
        data = invRows;
        break;

      // --- ¡NUEVO! LÓGICA PARA EL REPORTE DE ÓRDENES ---
      case 'ordenes':
        titulo = 'Reporte de Órdenes';
        columns = [
          { header: 'ID Orden', key: 'id_orden', width: 10 },
          { header: 'Escuela', key: 'escuela', width: 30 },
          { header: 'Menú', key: 'menu', width: 25 },
          { header: 'Fecha Creación', key: 'fecha_creacion', width: 20 },
          { header: 'Total (Q)', key: 'total', width: 15, style: { numFmt: '"Q"#,##0.00' } },
          { header: 'Estado', key: 'estado', width: 15 },
        ];
        headers = [['ID Orden', 'Escuela', 'Menú', 'Fecha', 'Total (Q)', 'Estado']];

        // Construcción de consulta SQL dinámica y segura
        let sql = `
          SELECT 
            o.id_orden,
            i.nombre_institucion AS escuela,
            p.nombre_producto AS menu,
            DATE_FORMAT(o.fecha_creacion, '%Y-%m-%d %H:%i') AS fecha_creacion,
            o.total,
            o.estado
          FROM orden o
          JOIN instituciones_educativas i ON o.id_escuela = i.id_institucion
          JOIN producto p ON o.id_menu = p.id_producto
        `;
        const whereClauses = [];
        const queryParams = [];

        if (filters.dateFrom && filters.dateTo) {
          whereClauses.push('DATE(o.fecha_creacion) BETWEEN ? AND ?');
          queryParams.push(filters.dateFrom, filters.dateTo);
        }
        if (filters.escuela && filters.escuela !== 'todas') {
          whereClauses.push('o.id_escuela = ?');
          queryParams.push(filters.escuela);
        }
        if (filters.estado && filters.estado !== 'todos') {
          whereClauses.push('o.estado = ?');
          queryParams.push(filters.estado);
        }
        if (filters.menu && filters.menu !== 'todos') {
          whereClauses.push('o.id_menu = ?');
          queryParams.push(filters.menu);
        }

        if (whereClauses.length > 0) {
          sql += ' WHERE ' + whereClauses.join(' AND ');
        }
        sql += ' ORDER BY o.fecha_creacion DESC';

        console.log('Ejecutando SQL para órdenes:', sql);
        console.log('Con parámetros:', queryParams);

        const [orderRows] = await pool.query(sql, queryParams);
        data = orderRows;
        break;
      
      default:
        return res.status(400).json({ message: `El módulo de reporte '${modulo}' no es válido.` });
    }

    // --- LÓGICA DE GENERACIÓN (PDF/EXCEL) ---
    // Esta parte funciona para cualquier módulo
    if (format.toLowerCase() === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(titulo);
        worksheet.columns = columns;
        worksheet.addRows(data);
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2c3e50' } };
        
        await registrarReporte('EXCEL', modulo, usuarioId);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${modulo}_${Date.now()}.xlsx`);
        const buffer = await workbook.xlsx.writeBuffer();
        return res.send(buffer);

    } else { // PDF por defecto
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.text(titulo, 14, 22);

        const body = data.map(item => columns.map(col => item[col.key] || ''));
        autoTable(doc, { startY: 35, head: headers, body });

        await registrarReporte('PDF', modulo, usuarioId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${modulo}_${Date.now()}.pdf`);
        const pdfBuffer = doc.output('arraybuffer');
        return res.send(Buffer.from(pdfBuffer));
    }

  } catch (error) {
    console.error(`🔴 Error general al generar el reporte de ${modulo}:`, error);
    res.status(500).json({ message: 'Error interno al generar el reporte.' });
  }
};

module.exports = {
  generarReporte,
};
const pool = require('../config/db');
const { jsPDF } = require("jspdf");
const { default: autoTable } = require("jspdf-autotable");
const ExcelJS = require('exceljs');

const registrarReporte = async (tipo, modulo, usuarioId) => {
  console.log(`Registrando reporte: Tipo=${tipo}, Módulo=${modulo}, UsuarioID=${usuarioId}`);
  if (!usuarioId) {
    console.error('¡FALLO! No se puede registrar porque el ID de Usuario es nulo.');
    return;
  }
  try {
    const sql = 'INSERT INTO reportes_generados (tipo, modulo, generado_por_id) VALUES (?, ?, ?)';
    await pool.query(sql, [tipo, modulo, usuarioId]);
    console.log(`¡ÉXITO! Reporte registrado en la BD.`);
  } catch (error) {
    console.error('¡FALLO CRÍTICO! Error al insertar en la BD:', error);
  }
};

const generarReporte = async (req, res) => {
  const { modulo, id } = req.params;
  const { format = 'pdf', ...filters } = req.query;
  const usuarioId = req.user ? req.user.id : null;
  
  console.log(`--- Iniciando reporte: Módulo=${modulo}, Formato=${format}, ID=${id} ---`);

  try {
    let data, columns, headers, titulo, order; 

    switch (modulo) {
      case 'inventario':
        console.log('Generando reporte de Inventario...');
        
        titulo = 'Reporte de Inventario General';

        columns = [
          { header: 'ID', key: 'id_producto', width: 10 },
          { header: 'Producto', key: 'nombre_producto', width: 35 },
          { header: 'Categoría', key: 'categoria', width: 20 },
          { header: 'Stock Disp.', key: 'stock_disponible', width: 15, style: { numFmt: '#,##0' } },
          { header: 'Stock Mín.', key: 'stock_minimo', width: 15, style: { numFmt: '#,##0' } },
          { header: 'Unidad', key: 'unidad_medida', width: 15 },
          { header: 'Precio Unit.', key: 'precio_unitario', width: 20, style: { numFmt: '"Q"#,##0.00' } }
        ];
        headers = [['ID', 'Producto', 'Categoría', 'Stock Disp.', 'Stock Mín.', 'Unidad', 'Precio Unit.']];

        const [rows] = await pool.query(`
          SELECT 
            id_producto, 
            nombre_producto, 
            categoria, 
            stock_disponible, 
            stock_minimo, 
            unidad_medida, 
            precio_unitario 
          FROM producto 
          WHERE estado = 'ACTIVO'
          ORDER BY nombre_producto ASC
        `);
        
        data = rows;
        console.log(`Se encontraron ${data.length} productos para el reporte.`);
        break;

      case 'ordenes':
        break;

      case 'orden_individual':
        if (!id) {
          return res.status(400).json({ message: 'Se requiere el ID de la orden para este reporte.' });
        }
        
        const [orderInfoRows] = await pool.query(`
          SELECT o.*, esc.nombre_escuela, p.nombre_producto AS nombre_menu
          FROM orden o
          LEFT JOIN escuela esc ON o.id_escuela = esc.id_escuela
          LEFT JOIN producto p ON o.id_menu = p.id_producto
          WHERE o.id_orden = ?`, [id]);
        
        if (orderInfoRows.length === 0) {
          return res.status(404).json({ message: 'Orden no encontrada.' });
        }
        
        order = orderInfoRows[0]; 
        
        const [productsRows] = await pool.query(`
          SELECT p.*, op.cantidad 
          FROM orden_producto op 
          JOIN producto p ON op.id_producto = p.id_producto 
          WHERE op.id_orden = ?`, [id]);
        order.productos = productsRows;
        
        titulo = `Orden de Entrega - ${order.codigo_orden}`;

        data = order.productos || []; 

        columns = [
          { header: 'Producto', key: 'nombre_producto', width: 40 },
          { header: 'Cantidad', key: 'cantidad', width: 15 },
          { header: 'Precio Unitario', key: 'precio_unitario', width: 20, style: { numFmt: '"Q"#,##0.00' } }
        ];
        headers = [['Producto', 'Cantidad', 'Precio Unitario']];
        break;
      
      default:
        return res.status(400).json({ message: `El módulo de reporte '${modulo}' no es válido.` });
    }

    

    if (format.toLowerCase() === 'excel') {
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(titulo);
        worksheet.columns = columns;
        worksheet.addRows(data);
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2c3e50' } };
        
        await registrarReporte('EXCEL', `${modulo} ${id || ''}`.trim(), usuarioId);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${modulo}_${Date.now()}.xlsx`);
        const buffer = await workbook.xlsx.writeBuffer();
        return res.send(buffer);

    } else { 
        
        const doc = new jsPDF({ orientation: 'portrait' });

        
        doc.setFontSize(18);
        doc.text(titulo, 14, 22);

        
        if (modulo === 'orden_individual' && order) {
          doc.setFontSize(10);
          doc.text(`Fecha de Emisión: ${new Date(order.fecha_creacion).toLocaleDateString('es-GT')}`, 14, 30);
          doc.text(`Estado: ${order.estado}`, 196, 30, { align: 'right' }); 

          doc.setFontSize(12);
          doc.text('Información de la Entrega:', 14, 40);
          doc.setFontSize(10);
          doc.text(`Institución: ${order.nombre_escuela || 'N/A'}`, 14, 46);
          doc.text(`Fecha de Entrega: ${new Date(order.fecha_entrega).toLocaleDateString('es-GT')}`, 14, 52);
          doc.text(`Responsable: ${order.nombre_responsable || 'N/A'}`, 14, 58);
          doc.text(`Menú Aplicado: ${order.nombre_menu || 'N/A'}`, 14, 64);
        }

        
        const body = data.map(item => columns.map(col => item[col.key] || ''));
        autoTable(doc, { 
          startY: (modulo === 'orden_individual' && order) ? 70 : 35, 
          head: headers, 
          body 
        });

        
        if (modulo === 'orden_individual' && order) {
            const totalGeneral = parseFloat(order.valor_total) || data.reduce((sum, item) => {
                const precio = parseFloat(item.precio_unitario) || 0;
                const cantidad = parseFloat(item.cantidad) || 0;
                return sum + (precio * cantidad);
            }, 0);

            const finalY = doc.lastAutoTable.finalY + 10; 
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Total de la Orden:', 150, finalY, { align: 'right' });
            doc.text(`Q${totalGeneral.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 196, finalY, { align: 'right' });
        }
        

        await registrarReporte('PDF', `${modulo} ${id || ''}`.trim(), usuarioId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${modulo}_${Date.now()}.pdf`);
        const pdfBuffer = doc.output('arraybuffer');
        return res.send(Buffer.from(pdfBuffer));
    }

  } catch (error) {
    console.error(`Error general al generar el reporte de ${modulo}:`, error);
    res.status(500).json({ message: 'Error interno al generar el reporte.' });
  }
};

module.exports = {
  generarReporte,
};
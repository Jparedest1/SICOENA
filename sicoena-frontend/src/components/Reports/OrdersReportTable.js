// src/components/Reports/OrdersReportTable.js

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './OrdersReportTable.css';

const OrdersReportTable = ({ orders, allOrdersWithProducts }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  const itemsPerPage = 10;

  // Paginación
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  // ✅ MANEJAR SELECCIÓN DE CHECKBOX INDIVIDUAL
  const handleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders([orderId]);
    }
  };

  // ✅ OBTENER ORDEN SELECCIONADA CON TODOS SUS DETALLES
  const getSelectedOrderWithDetails = () => {
    if (selectedOrders.length === 0) return null;
    return allOrdersWithProducts.find(o => o.id_orden === selectedOrders[0]);
  };

  // ✅ CALCULAR SUBTOTAL POR PRODUCTO
  const calcularSubtotal = (product, order) => {
    const precioUnitario = parseFloat(product.precio_unitario) || 0;
    const cantidad = parseFloat(product.cantidad) || 0;
    const dias = order.dias_duracion || 1;
    const alumnos = order.cantidad_alumnos || 0;
    return precioUnitario * cantidad * dias * alumnos;
  };

  // ✅ EXPORTAR PDF DE ORDEN INDIVIDUAL
  const handleExportPDF = () => {
  const selectedOrder = getSelectedOrderWithDetails();

  if (!selectedOrder) {
    alert('Selecciona una orden para exportar');
    return;
  }

  const doc = new jsPDF();
  let yPosition = 20;

  // ✅ ENCABEZADO
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('ORDEN DE ENTREGA', 14, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Fecha de reporte: ${new Date().toLocaleDateString('es-GT')}`, 14, yPosition);

  // ✅ INFORMACIÓN GENERAL
  yPosition += 15;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('INFORMACIÓN GENERAL', 14, yPosition);

  yPosition += 8;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const infoData = [
    ['Código de Orden:', selectedOrder.codigo_orden],
    ['Estado:', selectedOrder.estado],
    ['Fecha de Creación:', selectedOrder.fecha_creacion ? new Date(selectedOrder.fecha_creacion).toLocaleDateString('es-GT') : '-'],
    ['Fecha de Entrega:', selectedOrder.fecha_entrega ? new Date(selectedOrder.fecha_entrega).toLocaleDateString('es-GT') : 'No especificada']
  ];

  infoData.forEach(([label, value]) => {
    doc.text(label, 14, yPosition);
    doc.text(value, 80, yPosition);
    yPosition += 6;
  });

  // ✅ DETALLES DE ENTREGA
  yPosition += 5;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('DETALLES DE LA ENTREGA', 14, yPosition);

  yPosition += 8;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const deliveryData = [
    ['Escuela:', selectedOrder.nombre_escuela || '-'],
    ['Menú:', selectedOrder.nombre_menu || '-'],
    ['Cantidad de Alumnos:', `${selectedOrder.cantidad_alumnos} alumnos`],
    ['Días de Duración:', `${selectedOrder.dias_duracion} días`],
    ['Responsable:', selectedOrder.nombre_responsable || '-']
  ];

  deliveryData.forEach(([label, value]) => {
    doc.text(label, 14, yPosition);
    doc.text(value, 80, yPosition);
    yPosition += 6;
  });

  // ✅ PRODUCTOS SELECCIONADOS
  yPosition += 10;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text(`PRODUCTOS SELECCIONADOS (${selectedOrder.productos?.length || 0})`, 14, yPosition);

  yPosition += 8;
  const productHead = [['Producto', 'Cant.', 'Unidad', 'Precio Unit.', 'Subtotal']];
  
  const productBody = selectedOrder.productos?.map(p => [
    p.nombre_producto,
    p.cantidad,
    p.unidad_medida,
    `Q${parseFloat(p.precio_unitario || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Q${calcularSubtotal(p, selectedOrder).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]) || [];

  autoTable(doc, {
    startY: yPosition,
    head: productHead,
    body: productBody,
    theme: 'grid',
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });

  // ✅ RESUMEN FINAL
  yPosition = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  
  const totalValue = selectedOrder.productos?.reduce((sum, p) => sum + calcularSubtotal(p, selectedOrder), 0) || 0;
  
  doc.text(`Total de Productos: ${selectedOrder.productos?.length || 0}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Días de Entrega: ${selectedOrder.dias_duracion} días`, 14, yPosition);
  yPosition += 6;
  doc.text(`Cantidad de Alumnos: ${selectedOrder.cantidad_alumnos} alumnos`, 14, yPosition);
  yPosition += 10;
  
  // ✅ Valor total en box destacado CON FORMATO DE MILES
  doc.setDrawColor(102, 126, 234);
  doc.rect(14, yPosition, 182, 15);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text(`VALOR TOTAL DE LA ORDEN: Q${totalValue.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 18, yPosition + 10);

  // Abrir en ventana emergente
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, 'ReporteOrden', 'width=1000,height=700,resizable=yes,scrollbars=yes');
};

  // ✅ EXPORTAR EXCEL DE ORDEN INDIVIDUAL
  const handleExportExcel = async () => {
  const selectedOrder = getSelectedOrderWithDetails();

  if (!selectedOrder) {
    alert('Selecciona una orden para exportar');
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SICOENA';
    workbook.lastModifiedBy = 'SICOENA';
    workbook.created = new Date();
    workbook.modified = new Date();

    // ✅ UNA SOLA HOJA CON TODA LA INFORMACIÓN
    const worksheet = workbook.addWorksheet('Orden');

    let rowNumber = 1;

    // ✅ ENCABEZADO PRINCIPAL
    const titleCell = worksheet.getCell(rowNumber, 1);
    titleCell.value = 'ORDEN DE ENTREGA - SICOENA';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667eea' }
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'center' };
    worksheet.mergeCells(rowNumber, 1, rowNumber, 5);
    worksheet.getRow(rowNumber).height = 25;
    rowNumber += 2;

    // ✅ INFORMACIÓN GENERAL
    worksheet.getCell(rowNumber, 1).value = 'INFORMACIÓN GENERAL';
    worksheet.getCell(rowNumber, 1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell(rowNumber, 1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2c3e50' }
    };
    worksheet.mergeCells(rowNumber, 1, rowNumber, 5);
    worksheet.getRow(rowNumber).height = 18;
    rowNumber += 1;

    const infoData = [
      ['Código de Orden:', selectedOrder.codigo_orden, 'Estado:', selectedOrder.estado, ''],
      ['Fecha de Creación:', selectedOrder.fecha_creacion ? new Date(selectedOrder.fecha_creacion).toLocaleDateString('es-GT') : '-', 'Fecha de Entrega:', selectedOrder.fecha_entrega ? new Date(selectedOrder.fecha_entrega).toLocaleDateString('es-GT') : 'No especificada', ''],
      ['Escuela:', selectedOrder.nombre_escuela || '-', 'Menú:', selectedOrder.nombre_menu || '-', ''],
      ['Responsable:', selectedOrder.nombre_responsable || '-', 'Observaciones:', selectedOrder.observaciones || '-', '']
    ];

    infoData.forEach(([label1, value1, label2, value2]) => {
      worksheet.getCell(rowNumber, 1).value = label1;
      worksheet.getCell(rowNumber, 1).font = { bold: true };
      worksheet.getCell(rowNumber, 2).value = value1;
      worksheet.getCell(rowNumber, 3).value = label2;
      worksheet.getCell(rowNumber, 3).font = { bold: true };
      worksheet.getCell(rowNumber, 4).value = value2;
      rowNumber += 1;
    });

    rowNumber += 1;

    // ✅ DETALLES DE LA ENTREGA
    worksheet.getCell(rowNumber, 1).value = 'DETALLES DE LA ENTREGA';
    worksheet.getCell(rowNumber, 1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell(rowNumber, 1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2c3e50' }
    };
    worksheet.mergeCells(rowNumber, 1, rowNumber, 5);
    worksheet.getRow(rowNumber).height = 18;
    rowNumber += 1;

    const deliveryData = [
      ['Cantidad de Alumnos:', selectedOrder.cantidad_alumnos, 'Días de Duración:', selectedOrder.dias_duracion, '']
    ];

    deliveryData.forEach(([label1, value1, label2, value2]) => {
      worksheet.getCell(rowNumber, 1).value = label1;
      worksheet.getCell(rowNumber, 1).font = { bold: true };
      worksheet.getCell(rowNumber, 2).value = value1;
      worksheet.getCell(rowNumber, 3).value = label2;
      worksheet.getCell(rowNumber, 3).font = { bold: true };
      worksheet.getCell(rowNumber, 4).value = value2;
      rowNumber += 1;
    });

    rowNumber += 1;

    // ✅ TABLA DE PRODUCTOS
    worksheet.getCell(rowNumber, 1).value = 'PRODUCTOS SELECCIONADOS';
    worksheet.getCell(rowNumber, 1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell(rowNumber, 1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2c3e50' }
    };
    worksheet.mergeCells(rowNumber, 1, rowNumber, 5);
    worksheet.getRow(rowNumber).height = 18;
    rowNumber += 1;

    // ✅ Encabezados de tabla de productos
    const headers = ['Producto', 'Cantidad', 'Unidad', 'Precio Unitario (Q)', 'Subtotal (Q)'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(rowNumber, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667eea' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    worksheet.getRow(rowNumber).height = 20;
    rowNumber += 1;

    // ✅ Datos de productos
    const productsData = selectedOrder.productos?.map(p => ({
      nombre_producto: p.nombre_producto,
      cantidad: p.cantidad,
      unidad_medida: p.unidad_medida,
      precio_unitario: parseFloat(p.precio_unitario || 0).toFixed(2),
      subtotal: calcularSubtotal(p, selectedOrder).toFixed(2)
    })) || [];

    let totalSubtotal = 0;
productsData.forEach((product, index) => {
  worksheet.getCell(rowNumber, 1).value = product.nombre_producto;
  worksheet.getCell(rowNumber, 2).value = product.cantidad;
  worksheet.getCell(rowNumber, 3).value = product.unidad_medida;
  
  // ✅ Precio unitario con formato Q y miles
  worksheet.getCell(rowNumber, 4).value = parseFloat(product.precio_unitario);
  worksheet.getCell(rowNumber, 4).numFmt = '"Q"#,##0.00';
  
  // ✅ Subtotal con formato Q y miles
  const subtotalValue = parseFloat(product.subtotal);
  worksheet.getCell(rowNumber, 5).value = subtotalValue;
  worksheet.getCell(rowNumber, 5).numFmt = '"Q"#,##0.00';

  // Estilos
  for (let col = 1; col <= 5; col++) {
    const cell = worksheet.getCell(rowNumber, col);
    cell.alignment = { horizontal: 'left', vertical: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFcccccc' } },
      left: { style: 'thin', color: { argb: 'FFcccccc' } },
      bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
      right: { style: 'thin', color: { argb: 'FFcccccc' } }
    };
  }

  // Alternancia de colores
  if (rowNumber % 2 === 0) {
    for (let col = 1; col <= 5; col++) {
      worksheet.getCell(rowNumber, col).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
    }
  }

  totalSubtotal += subtotalValue;
  rowNumber += 1;
});

// ✅ FILA DE TOTAL CON FORMATO Q Y MILES
worksheet.getCell(rowNumber, 1).value = 'TOTAL';
worksheet.getCell(rowNumber, 1).font = { bold: true, size: 12 };
worksheet.getCell(rowNumber, 1).fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE8F4FF' }
};
worksheet.mergeCells(rowNumber, 1, rowNumber, 4);

worksheet.getCell(rowNumber, 5).value = totalSubtotal;
worksheet.getCell(rowNumber, 5).font = { bold: true, size: 12 };
worksheet.getCell(rowNumber, 5).fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE8F4FF' }
};
// ✅ FORMATO CON Q Y SEPARADOR DE MILES
worksheet.getCell(rowNumber, 5).numFmt = '"Q"#,##0.00';

for (let col = 1; col <= 5; col++) {
  worksheet.getCell(rowNumber, col).border = {
    top: { style: 'medium', color: { argb: 'FF667eea' } },
    left: { style: 'medium', color: { argb: 'FF667eea' } },
    bottom: { style: 'medium', color: { argb: 'FF667eea' } },
    right: { style: 'medium', color: { argb: 'FF667eea' } }
  };
}

rowNumber += 2;

// ✅ RESUMEN FINAL
worksheet.getCell(rowNumber, 1).value = 'RESUMEN';
worksheet.getCell(rowNumber, 1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
worksheet.getCell(rowNumber, 1).fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF11998e' }
};
worksheet.mergeCells(rowNumber, 1, rowNumber, 5);
worksheet.getRow(rowNumber).height = 18;
rowNumber += 1;

const summaryItems = [
  { label: 'Total de Productos:', value: selectedOrder.productos?.length || 0, isNumeric: false },
  { label: 'Días de Entrega:', value: selectedOrder.dias_duracion, isNumeric: false },
  { label: 'Cantidad de Alumnos:', value: selectedOrder.cantidad_alumnos, isNumeric: false },
  { label: 'Valor Total de la Orden (Q):', value: totalSubtotal, isNumeric: true }
];

summaryItems.forEach((item) => {
  worksheet.getCell(rowNumber, 1).value = item.label;
  worksheet.getCell(rowNumber, 1).font = { bold: true };
  worksheet.getCell(rowNumber, 2).value = item.value;
  
  // ✅ Aplicar formato Q a valores numéricos
  if (item.isNumeric) {
    worksheet.getCell(rowNumber, 2).numFmt = '"Q"#,##0.00';
    worksheet.getCell(rowNumber, 2).font = { bold: true };
  }
  
  for (let col = 1; col <= 5; col++) {
    worksheet.getCell(rowNumber, col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F8FF' }
    };
  }
  rowNumber += 1;
});

    // ✅ AJUSTAR ANCHO DE COLUMNAS
    worksheet.columns = [
      { width: 30 },
      { width: 18 },
      { width: 18 },
      { width: 20 },
      { width: 18 }
    ];

    // ✅ Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `orden-${selectedOrder.codigo_orden}-${new Date().toISOString().slice(0, 10)}.xlsx`);

    console.log('✅ Archivo Excel descargado exitosamente');

  } catch (error) {
    console.error('Error al generar archivo Excel:', error);
    alert('Error al generar el archivo Excel: ' + error.message);
  }
};

  const getStatusClass = (estado) => {
    if (!estado) return 'pendiente';
    return estado.toLowerCase().replace(' ', '-');
  };

  return (
    <div className="report-table-container">
      <div className="table-header">
        <div className="header-left">
          <h2>
            Detalle de Órdenes ({orders.length} registros)
            {selectedOrders.length > 0 && (
              <span className="selected-count"> - Orden seleccionada</span>
            )}
          </h2>
        </div>
        <div className="export-buttons">
          <button 
            className="btn-export pdf" 
            onClick={handleExportPDF}
            disabled={selectedOrders.length === 0}
            title={selectedOrders.length === 0 ? 'Selecciona una orden para exportar' : 'Exportar orden seleccionada a PDF'}
          >
            📄 PDF
          </button>
          <button 
            className="btn-export excel" 
            onClick={handleExportExcel}
            disabled={selectedOrders.length === 0}
            title={selectedOrders.length === 0 ? 'Selecciona una orden para exportar' : 'Descargar orden seleccionada en Excel'}
          >
            📊 Excel
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No hay órdenes para mostrar
        </p>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Sel.</th>
                  <th>Código</th>
                  <th>Escuela</th>
                  <th>Menú</th>
                  <th>Alumnos</th>
                  <th>Valor Total</th>
                  <th>Estado</th>
                  <th>F. Creación</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id_orden} className={selectedOrders.includes(order.id_orden) ? 'selected-row' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input 
                        type="radio" 
                        name="selected-order"
                        checked={selectedOrders.includes(order.id_orden)}
                        onChange={() => handleSelectOrder(order.id_orden)}
                      />
                    </td>
                    <td><strong>{order.codigo_orden}</strong></td>
                    <td>{order.nombre_escuela || '-'}</td>
                    <td>{order.nombre_menu || '-'}</td>
                    <td>{order.cantidad_alumnos || '-'}</td>
                    <td>Q{parseFloat(order.valor_total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.estado)}`}>
                        {order.estado}
                      </span>
                    </td>
                    <td>{order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString('es-GT') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
              >
                Primera
              </button>
              <button 
                onClick={() => setCurrentPage(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              <div className="page-info">
                Página {currentPage} de {totalPages}
              </div>

              <button 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
              >
                Última
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersReportTable;
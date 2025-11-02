// src/components/Reports/OrdersReportTable.js

import React, { useState } from 'react';
import './OrdersReportTable.css';

const OrdersReportTable = ({ orders }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  const itemsPerPage = 10;

  // --- ¡LÍNEA CLAVE! ASEGÚRATE DE QUE ESTA LÍNEA EXISTA ---
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';


  // Paginación
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => prev.includes(orderId) ? [] : [orderId]);
  };

  const handleExport = async (format) => {
    // --- PRUEBA DE ACTUALIZACIÓN ---
    console.log('--- USANDO LA VERSIÓN CORRECTA DEL ARCHIVO (CON GUION_BAJO) ---');

    if (selectedOrders.length === 0) {
      alert('Por favor, selecciona una orden para exportar.');
      return;
    }
    const orderId = selectedOrders[0];
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('Sesión no válida. Por favor, inicie sesión de nuevo.');
      return;
    }

    // La URL con guion_bajo
    const url = `${apiUrl}/api/reportes/orden_individual/${orderId}?format=${format}`;
    
    console.log('Llamando a la URL de exportación:', url);

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: "Error al generar el reporte." }));
        throw new Error(errData.message);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const selectedOrder = orders.find(o => o.id_orden === orderId);
      const fileName = `orden_${selectedOrder?.codigo_orden || orderId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      console.error('Error al exportar:', err);
      alert(`No se pudo exportar el reporte: ${err.message}`);
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
        {/* --- BOTONES MODIFICADOS PARA LLAMAR A handleExport --- */}
        <div className="export-buttons">
          <button 
            className="btn-export pdf" 
            onClick={() => handleExport('pdf')}
            disabled={selectedOrders.length === 0}
            title={selectedOrders.length === 0 ? 'Selecciona una orden para exportar' : 'Exportar orden seleccionada a PDF'}
          >
            📄 PDF
          </button>
          <button 
            className="btn-export excel" 
            onClick={() => handleExport('excel')}
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
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>Primera</button>
              <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
              <div className="page-info">Página {currentPage} de {totalPages}</div>
              <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Última</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersReportTable;
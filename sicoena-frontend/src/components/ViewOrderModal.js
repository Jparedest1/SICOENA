import React, { useState, useEffect } from 'react';
import './ViewOrderModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBox, faCalendar, faUser, faBuilding, faList } from '@fortawesome/free-solid-svg-icons';

const ViewOrderModal = ({ onClose, orderId, orderData }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      try {
        const response = await fetch(`${apiUrl}/api/orden/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Error al obtener orden');

        const data = await response.json();
        console.log('Datos de la orden:', data);
        
        setOrderDetails(data.order);
        setProductos(data.productos || []);
        
      } catch (err) {
        console.error('Error al obtener detalles de la orden:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, apiUrl]);

  const getStatusClass = (estado) => {
    if (!estado) return 'pendiente';
    return estado.toLowerCase().replace(' ', '-');
  };

  const calcularSubtotal = (product) => {
    const precioUnitario = parseFloat(product.precio_unitario) || 0;
    const cantidad = parseFloat(product.cantidad) || 0;
    const dias = orderDetails?.dias_duracion || 1;
    const alumnos = orderDetails?.cantidad_alumnos || 0;
    return precioUnitario * cantidad * dias * alumnos;
  };

  const calcularTotal = () => {
    if (productos.length === 0) return 0;
    return productos.reduce((sum, p) => sum + calcularSubtotal(p), 0);
  };

  if (isLoading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content view-order-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Cargando orden...</h2>
            <button className="modal-close-btn" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Obteniendo detalles de la orden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content view-order-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Error</h2>
            <button className="modal-close-btn" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: '#c00' }}>
            <p>{error || 'No se pudo cargar la orden'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faBox} /> Detalles de Orden
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body view-order-body">
          
          <div className="info-section">
            <h3>Información General</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Código de Orden:</span>
                <span className="info-value">{orderDetails.codigo_orden}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Estado:</span>
                <span className={`status-badge ${getStatusClass(orderDetails.estado)}`}>
                  {orderDetails.estado}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faCalendar} /> Fecha de Creación:
                </span>
                <span className="info-value">
                  {orderDetails.fecha_creacion 
                    ? new Date(orderDetails.fecha_creacion).toLocaleDateString('es-GT', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'
                  }
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faCalendar} /> Fecha de Entrega:
                </span>
                <span className="info-value">
                  {orderDetails.fecha_entrega 
                    ? new Date(orderDetails.fecha_entrega).toLocaleDateString('es-GT')
                    : 'No especificada'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Detalles de la Entrega</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faBuilding} /> Escuela:
                </span>
                <span className="info-value">{orderData?.nombre_escuela || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Menú:</span>
                <span className="info-value">{orderData?.nombre_menu || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cantidad de Alumnos:</span>
                <span className="info-value">{orderDetails.cantidad_alumnos} alumnos</span>
              </div>
              <div className="info-item">
                <span className="info-label">Días de Duración:</span>
                <span className="info-value">{orderDetails.dias_duracion} días</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faUser} /> Responsable:
                </span>
                <span className="info-value">{orderData?.nombre_responsable || '-'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>
              <FontAwesomeIcon icon={faList} /> Productos Seleccionados ({productos.length})
            </h3>
            
            {productos && productos.length > 0 ? (
              <>
                <div className="products-table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th style={{ width: '100px' }}>Cantidad</th>
                        <th style={{ width: '100px' }}>Unidad</th>
                        <th style={{ width: '120px' }}>Precio Unit.</th>
                        <th style={{ width: '150px' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((product, index) => (
                        <tr key={index}>
                          <td>{product.nombre_producto}</td>
                          <td style={{ textAlign: 'center' }}>{product.cantidad}</td>
                          <td style={{ textAlign: 'center' }}>{product.unidad_medida}</td>
                          <td style={{ textAlign: 'right' }}>
                            Q{parseFloat(product.precio_unitario || 0).toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            Q{calcularSubtotal(product).toFixed(2)}
                            <br />
                            <small style={{ color: '#666', fontSize: '11px' }}>
                              ({product.cantidad} × Q{parseFloat(product.precio_unitario || 0).toFixed(2)} × {orderDetails.dias_duracion} días × {orderDetails.cantidad_alumnos} alumnos)
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span className="summary-label">Total de Productos:</span>
                    <span className="summary-value">{productos.length}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Días de Entrega:</span>
                    <span className="summary-value">{orderDetails.dias_duracion} días</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Cantidad de Alumnos:</span>
                    <span className="summary-value">{orderDetails.cantidad_alumnos} alumnos</span>
                  </div>
                  <div className="summary-row total">
                    <span className="summary-label">VALOR TOTAL DE LA ORDEN:</span>
                    <span className="summary-value">Q{parseFloat(orderDetails.valor_total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No hay productos asociados a esta orden.
              </p>
            )}
          </div>

          {orderDetails.observaciones && (
            <div className="info-section">
              <h3>Observaciones</h3>
              <p className="info-value">{orderDetails.observaciones}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;
import React, { useState } from 'react';
import './ChangeOrderStatusModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const ChangeOrderStatusModal = ({ onClose, onStatusChanged, order }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.estado || 'PENDIENTE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const estadosPosibles = [
    { valor: 'PENDIENTE', label: 'Pendiente', color: '#FFC107', bgColor: '#FFF3CD' },
    { valor: 'EN PROCESO', label: 'En Proceso', color: '#0066CC', bgColor: '#CCE5FF' },
    { valor: 'ENTREGADO', label: 'Entregado', color: '#28A745', bgColor: '#D4EDDA' },
    { valor: 'CANCELADO', label: 'Cancelado', color: '#DC3545', bgColor: '#F8D7DA' }
  ];

  const handleChangeStatus = async () => {
    if (selectedStatus === order.estado) {
      alert('Selecciona un estado diferente al actual');
      return;
    }

    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${apiUrl}/api/orden/${order.id_orden}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: selectedStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar estado');
      }

      console.log('Estado actualizado:', data);
      alert(`Estado actualizado a: ${selectedStatus}`);

      onStatusChanged(data);
      onClose();

    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const estadoActual = estadosPosibles.find(e => e.valor === order.estado);
  const estadoNuevo = estadosPosibles.find(e => e.valor === selectedStatus);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faCheckCircle} /> Cambiar Estado de Orden
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body status-body">
          <div className="status-info">
            <div className="info-item">
              <span className="info-label">Código de Orden:</span>
              <span className="info-value">{order.codigo_orden}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Escuela:</span>
              <span className="info-value">{order.nombre_escuela}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado Actual:</span>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: estadoActual?.bgColor, 
                  color: estadoActual?.color 
                }}
              >
                {estadoActual?.label}
              </span>
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '15px' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="status-selector">
            <h3>Selecciona el nuevo estado:</h3>
            <div className="status-options">
              {estadosPosibles.map(estado => (
                <button
                  key={estado.valor}
                  type="button"
                  className={`status-option ${selectedStatus === estado.valor ? 'selected' : ''}`}
                  onClick={() => setSelectedStatus(estado.valor)}
                  style={{
                    borderColor: selectedStatus === estado.valor ? estado.color : '#ddd',
                    backgroundColor: selectedStatus === estado.valor ? estado.bgColor : '#fff'
                  }}
                >
                  <div className="status-circle" style={{ backgroundColor: estado.color }}></div>
                  <span>{estado.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="status-preview">
            <div className="preview-item">
              <span className="preview-label">De:</span>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: estadoActual?.bgColor, 
                  color: estadoActual?.color 
                }}
              >
                {estadoActual?.label}
              </span>
            </div>
            <div className="preview-arrow">→</div>
            <div className="preview-item">
              <span className="preview-label">A:</span>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: estadoNuevo?.bgColor, 
                  color: estadoNuevo?.color 
                }}
              >
                {estadoNuevo?.label}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn-save" 
            onClick={handleChangeStatus}
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Confirmar Cambio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeOrderStatusModal;
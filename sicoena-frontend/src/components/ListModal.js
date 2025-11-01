// src/components/ListModal.js

import React from 'react';
// Importamos los estilos de modal que ya tenemos
import './AddProveedorModal.css'; 

// Estilos CSS en línea solo para este componente (para no crear otro archivo)
const listStyles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  column: {
    flex: 1,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    border: '1px solid #eee',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  listItem: {
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
  },
  listItemHeader: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '0.9rem',
  },
  listItemSub: {
    fontSize: '0.85rem',
    color: '#666',
    wordBreak: 'break-word',
  },
  loadingText: {
    textAlign: 'center',
    padding: '20px',
    color: '#777',
  }
};

// Pasamos las listas y el estado de carga como props
const ListModal = ({ onClose, bodegas, proveedores, isLoading }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>Catálogo de Bodegas y Proveedores</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {isLoading ? (
            <p style={listStyles.loadingText}>Cargando catálogos...</p>
          ) : (
            <div style={listStyles.container}>
              
              {/* Columna de Bodegas */}
              <div style={listStyles.column}>
                <h3>Bodegas ({bodegas.length})</h3>
                <ul style={listStyles.list}>
                  {bodegas.length > 0 ? bodegas.map(bod => (
                    <li key={bod.id_bodega} style={listStyles.listItem}>
                      <div style={listStyles.listItemHeader}>{bod.nombre_bodega}</div>
                      <div style={listStyles.listItemSub}>
                        {bod.observaciones || 'Sin observaciones'}
                      </div>
                    </li>
                  )) : (
                    <li style={listStyles.listItem}>No hay bodegas registradas.</li>
                  )}
                </ul>
              </div>

              {/* Columna de Proveedores */}
              <div style={listStyles.column}>
                <h3>Proveedores ({proveedores.length})</h3>
                <ul style={listStyles.list}>
                  {proveedores.length > 0 ? proveedores.map(prov => (
                    <li key={prov.id_proveedor} style={listStyles.listItem}>
                      <div style={listStyles.listItemHeader}>{prov.nombre_proveedor}</div>
                      <div style={listStyles.listItemSub}>
                        NIT: {prov.nit || 'N/A'} | Tel: {prov.telefono || 'N/A'}
                      </div>
                    </li>
                  )) : (
                     <li style={listStyles.listItem}>No hay proveedores registrados.</li>
                  )}
                </ul>
              </div>

            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListModal;
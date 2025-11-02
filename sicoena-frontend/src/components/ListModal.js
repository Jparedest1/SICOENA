import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import './AddEditProveedorModal.css'; 

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
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
  actions: {
    display: 'flex',
    gap: '10px',
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#555',
  },
  loadingText: {
    textAlign: 'center',
    padding: '20px',
    color: '#777',
  }
};

const ListModal = ({ onClose, bodegas, proveedores, isLoading, onEditBodega, onDeleteBodega, onEditProveedor, onDeleteProveedor }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Catálogo de Bodegas y Proveedores</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {isLoading ? (
            <p style={listStyles.loadingText}>Cargando catálogos...</p>
          ) : (
            <div style={listStyles.container}>
              
              <div style={listStyles.column}>
                <h3>Bodegas ({bodegas.length})</h3>
                <ul style={listStyles.list}>
                  {bodegas.length > 0 ? bodegas.map(bod => (
                    <li key={bod.id_bodega} style={listStyles.listItem}>
                      <div style={listStyles.listItemContent}>
                        <div style={listStyles.listItemHeader}>{bod.nombre_bodega}</div>
                        <div style={listStyles.listItemSub}>
                          {bod.observaciones || 'Sin observaciones'}
                        </div>
                      </div>
                      <div style={listStyles.actions}>
                        <button style={listStyles.actionButton} title="Editar" onClick={() => onEditBodega(bod)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button style={listStyles.actionButton} title="Desactivar" onClick={() => onDeleteBodega(bod.id_bodega)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </li>
                  )) : (
                    <li style={listStyles.listItem}>No hay bodegas registradas.</li>
                  )}
                </ul>
              </div>

              <div style={listStyles.column}>
                <h3>Proveedores ({proveedores.length})</h3>
                <ul style={listStyles.list}>
                  {proveedores.length > 0 ? proveedores.map(prov => (
                    <li key={prov.id_proveedor} style={listStyles.listItem}>
                      <div style={listStyles.listItemContent}>
                        <div style={listStyles.listItemHeader}>{prov.nombre_proveedor}</div>
                        <div style={listStyles.listItemSub}>
                          NIT: {prov.nit || 'N/A'} | Tel: {prov.telefono || 'N/A'}
                        </div>
                      </div>
                      <div style={listStyles.actions}>
                        <button style={listStyles.actionButton} title="Editar" onClick={() => onEditProveedor(prov)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button style={listStyles.actionButton} title="Desactivar" onClick={() => onDeleteProveedor(prov.id_proveedor)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
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
          <button onClick={onClose} className="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ListModal;
// src/components/AddBodegaModal.js

import React, { useState } from 'react';
import './AddProveedorModal.css'; 

const AddBodegaModal = ({ onClose, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre) {
      setError('El nombre de la bodega es obligatorio.');
      return;
    }
    
    // El 'estado' se manejará en handleSaveBodega en InventoryPage.js
    onSave({
      nombre_bodega: nombre,
      observaciones: observaciones,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nueva Bodega</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="modal-error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="bodega-nombre">Nombre Bodega *</label>
              <input
                id="bodega-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bodega-obs">Observaciones</label>
              <textarea
                id="bodega-obs"
                rows="4"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar Bodega
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBodegaModal;
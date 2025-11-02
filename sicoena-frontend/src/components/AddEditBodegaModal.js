import React, { useState } from 'react';
import './AddEditBodegaModal.css';

const AddEditBodegaModal = ({ onClose, onSave, currentBodega }) => {
  // Inicializa el estado directamente con los datos de la bodega a editar o un objeto vacío.
  const [bodega, setBodega] = useState(
    currentBodega
      ? {
          nombre_bodega: currentBodega.nombre_bodega || '',
          ubicacion: currentBodega.ubicacion || '',
          observaciones: currentBodega.observaciones || '',
        }
      : {
          nombre_bodega: '',
          ubicacion: '',
          observaciones: '',
        }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBodega((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(bodega);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{currentBodega ? 'Editar Bodega' : 'Agregar Nueva Bodega'}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Nombre de la Bodega</label>
            <input type="text" name="nombre_bodega" value={bodega.nombre_bodega} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Ubicación</label>
            <input type="text" name="ubicacion" value={bodega.ubicacion} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Observaciones</label>
            <textarea name="observaciones" value={bodega.observaciones} onChange={handleChange}></textarea>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditBodegaModal;
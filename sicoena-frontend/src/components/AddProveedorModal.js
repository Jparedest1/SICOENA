// src/components/AddProveedorModal.js

import React, { useState } from 'react';
import './AddProveedorModal.css'; 

const AddProveedorModal = ({ onClose, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !nit) {
      setError('El nombre y el NIT son obligatorios.');
      return;
    }
    
    // El 'estado' se manejará en handleSaveProveedor en InventoryPage.js
    onSave({
      nombre_proveedor: nombre,
      nit: nit,
      telefono: telefono,
      direccion: direccion,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nuevo Proveedor</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="modal-error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="prov-nombre">Nombre Proveedor *</label>
              <input
                id="prov-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="prov-nit">NIT *</label>
              <input
                id="prov-nit"
                type="text"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prov-telefono">Teléfono</label>
              <input
                id="prov-telefono"
                type="text" // Usamos text para permitir guiones o +(502)
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="prov-direccion">Dirección</label>
              <textarea
                id="prov-direccion"
                rows="3"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              ></textarea>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProveedorModal;
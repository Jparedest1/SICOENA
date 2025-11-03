import React, { useState } from 'react';
import './AddEditProveedorModal.css';

const AddEditProveedorModal = ({ onClose, onSave, currentProveedor }) => {
  const [proveedor, setProveedor] = useState(
    currentProveedor
      ? {
          nombre_proveedor: currentProveedor.nombre_proveedor || '',
          nit: currentProveedor.nit || '',
          direccion: currentProveedor.direccion || '',
          telefono: currentProveedor.telefono || '',
          email: currentProveedor.email || '',
          observaciones: currentProveedor.observaciones || '',
        }
      : {
          nombre_proveedor: '',
          nit: '',
          direccion: '',
          telefono: '',
          email: '',
          observaciones: '',
        }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProveedor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(proveedor);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{currentProveedor ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Nombre del Proveedor</label>
            <input type="text" name="nombre_proveedor" value={proveedor.nombre_proveedor} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>NIT</label>
            <input type="text" name="nit" value={proveedor.nit} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input type="text" name="direccion" value={proveedor.direccion} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="text" name="telefono" value={proveedor.telefono} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={proveedor.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Observaciones</label>
            <textarea name="observaciones" value={proveedor.observaciones} onChange={handleChange}></textarea>
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

export default AddEditProveedorModal;
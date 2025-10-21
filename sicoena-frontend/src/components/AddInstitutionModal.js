// src/components/AddInstitutionModal.js

import React, { useState, useEffect } from 'react';
// We can reuse the user modal's CSS as it's very similar
import './AddUserModal.css'; 

const AddInstitutionModal = ({ onClose, onSave, currentInstitution }) => {
  // --- State for all form fields ---
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [poblacion, setPoblacion] = useState('');
  const [encargado, setEncargado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState('ACTIVA');

  const isEditMode = currentInstitution !== null;

  // Effect to populate fields when in edit mode
  useEffect(() => {
    if (isEditMode) {
      setNombre(currentInstitution.nombre || '');
      setTipo(currentInstitution.tipo || '');
      setCodigo(currentInstitution.codigo || '');
      setTelefono(currentInstitution.telefono || '');
      setEmail(currentInstitution.email || '');
      setDireccion(currentInstitution.direccion || '');
      setDepartamento(currentInstitution.departamento || '');
      setMunicipio(currentInstitution.municipio || '');
      setPoblacion(currentInstitution.poblacion || '');
      setEncargado(currentInstitution.encargado || '');
      setObservaciones(currentInstitution.observaciones || '');
      setEstado(currentInstitution.estado || 'ACTIVA');
    }
  }, [currentInstitution, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gather all data into one object
    const institutionData = { 
      nombre, tipo, codigo, telefono, email, direccion, 
      departamento, municipio, poblacion, encargado, observaciones, estado 
    };
    onSave(institutionData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Editar Institución' : 'Nueva Institución'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          
          {/* --- INFORMACIÓN BÁSICA --- */}
          <div className="form-section">
            <h3>INFORMACIÓN BÁSICA</h3>
            <div className="form-group">
              <label htmlFor="nombre">Nombre de la Institución *</label>
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              <small className="helper-text">Nombre completo de la institución u organización</small>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo">Tipo de Institución *</label>
                <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                  <option value="" disabled>Seleccionar tipo</option>
                  <option value="Escuela">Escuela</option>
                  <option value="Colegio">Colegio</option>
                  <option value="Instituto">Instituto</option>
                </select>
                <small className="helper-text">Seleccione el tipo que mejor describe la institución</small>
              </div>
              <div className="form-group">
                <label htmlFor="codigo">Código *</label>
                <input type="text" id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. J-12345678-9" required />
                <small className="helper-text">Código único de identificación (NIT, etc.)</small>
              </div>
            </div>
          </div>

          {/* --- INFORMACIÓN DE CONTACTO --- */}
          <div className="form-section">
            <h3>INFORMACIÓN DE CONTACTO</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono Principal</label>
                <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <small className="helper-text">Número de teléfono principal de contacto</small>
              </div>
              <div className="form-group">
                <label>Email de Contacto</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <small className="helper-text">Correo electrónico oficial de la institución</small>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <textarea id="direccion" rows="3" value={direccion} onChange={(e) => setDireccion(e.target.value)} required></textarea>
              <small className="helper-text">Ubicación completa de la institución</small>
            </div>
          </div>

          {/* --- UBICACIÓN GEOGRÁFICA --- */}
          <div className="form-section">
            <h3>UBICACIÓN GEOGRÁFICA</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departamento">Departamento *</label>
                <select id="departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} required>
                  <option value="" disabled>Seleccionar departamento</option>
                  <option value="Sacatepéquez">Sacatepéquez</option>
                  {/* Add other departments here */}
                </select>
                <small className="helper-text">Departamento donde se ubica la institución</small>
              </div>
              <div className="form-group">
                <label htmlFor="municipio">Municipio *</label>
                <select id="municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} required>
                  <option value="" disabled>Seleccionar municipio</option>
                  <option value="Sumpango">Sumpango</option>
                  <option value="Antigua Guatemala">Antigua Guatemala</option>
                  {/* Add other municipalities here */}
                </select>
                <small className="helper-text">Municipio específico de la institución</small>
              </div>
            </div>
          </div>

          {/* --- INFORMACIÓN ADICIONAL --- */}
          <div className="form-section">
            <h3>INFORMACIÓN ADICIONAL</h3>
            <div className="form-row">
                <div className="form-group">
                    <label>Población Beneficiaria</label>
                    <input type="number" value={poblacion} onChange={(e) => setPoblacion(e.target.value)} />
                    <small className="helper-text">Número aproximado de beneficiarios</small>
                </div>
                <div className="form-group">
                    <label>Encargado Principal</label>
                    <input type="text" value={encargado} onChange={(e) => setEncargado(e.target.value)} />
                    <small className="helper-text">Nombre de la persona responsable o director</small>
                </div>
            </div>
            <div className="form-group">
              <label>Observaciones</label>
              <textarea rows="3" value={observaciones} onChange={(e) => setObservaciones(e.target.value)}></textarea>
              <small className="helper-text">Notas adicionales, servicios que ofrece, etc.</small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">
              {isEditMode ? 'Guardar Cambios' : 'Crear Institución'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInstitutionModal;
import React, { useState, useEffect } from 'react';
import './AddUserModal.css'; 

const AddInstitutionModal = ({ onClose, onSave, currentInstitution }) => {
  const [nombre, setNombre] = useState(''); 
  const [tipo, setTipo] = useState(''); 
  const [codigo, setCodigo] = useState(''); 
  const [telefono, setTelefono] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [direccion, setDireccion] = useState(''); 
  const [departamento, setDepartamento] = useState(''); 
  const [municipio, setMunicipio] = useState(''); 
  const [poblacion, setPoblacion] = useState(''); 
  const [director, setDirector] = useState(''); 
  const [observaciones, setObservaciones] = useState(''); 
  const [estado, setEstado] = useState('ACTIVA'); 

  const isEditMode = currentInstitution !== null;

  
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
      setDirector(currentInstitution.director || ''); 
      setObservaciones(currentInstitution.observaciones || '');
      setEstado(currentInstitution.estado || 'ACTIVA');
    } else {
        
        setNombre('');
        setTipo('');
        setCodigo('');
        setTelefono('');
        setEmail('');
        setDireccion('');
        setDepartamento('');
        setMunicipio('');
        setPoblacion('');
        setDirector('');
        setObservaciones('');
        setEstado('ACTIVA');
    }
  }, [currentInstitution, isEditMode]);

  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    
    const institutionData = { 
      nombre, tipo, codigo, telefono, email, direccion, 
      departamento, municipio, poblacion, director, observaciones, estado 
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
          
          <div className="form-section">
            <h3>INFORMACIÓN BÁSICA</h3>
            <div className="form-group">
              <label htmlFor="nombre">Nombre de la Institución *</label>
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              <small className="helper-text">Nombre completo de la institución u organización</small>
            </div>
            <div className="form-row">
              <div className="form-group">
              <label htmlFor="director">Director</label>
              <input type="text" id="director" value={director} onChange={(e) => setDirector(e.target.value)} />
              <small className="helper-text">Nombre de la persona responsable o director</small>
              </div>
              <div className="form-group">
                <label htmlFor="codigo">Código Esecuela *</label>
                <input type="text" id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. 01-01-1234-45" required />
                <small className="helper-text">Código único de escuela</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>INFORMACIÓN DE CONTACTO</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input type="tel" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <small className="helper-text">Número de teléfono principal de contacto</small>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email de Contacto</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <small className="helper-text">Correo electrónico oficial de la institución</small>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <textarea id="direccion" rows="3" value={direccion} onChange={(e) => setDireccion(e.target.value)} required></textarea>
              <small className="helper-text">Ubicación completa de la institución</small>
            </div>
          </div>

          <div className="form-section">
            <h3>UBICACIÓN GEOGRÁFICA</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departamento">Departamento *</label>
                <select id="departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} required>
                  <option value="" disabled>Seleccionar departamento</option>
                  <option value="Sacatepéquez">Sacatepéquez</option>
                </select>
                <small className="helper-text">Departamento donde se ubica la institución</small>
              </div>
              <div className="form-group">
                <label htmlFor="municipio">Municipio *</label>
                <select id="municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} required>
                  <option value="" disabled>Seleccionar municipio</option>
                  <option value="Sumpango">Sumpango</option>
                  <option value="Antigua Guatemala">Antigua Guatemala</option>
                  <option value="Santo Domingo Xenacoj">Santo Domingo Xenacoj</option>
                </select>
                <small className="helper-text">Municipio específico de la institución</small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>INFORMACIÓN ADICIONAL</h3>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="poblacion">Cantidad de Estudiantes</label>
                    <input type="number" id="poblacion" value={poblacion} onChange={(e) => setPoblacion(e.target.value)} />
                    <small className="helper-text">Número aproximado de estudiantes</small>
                </div>
            </div>
            <div className="form-group">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea id="observaciones" rows="3" value={observaciones} onChange={(e) => setObservaciones(e.target.value)}></textarea>
              <small className="helper-text">Notas adicionales, servicios que ofrece, etc.</small>
            </div>
            {isEditMode && (
                <div className="form-group">
                    <label htmlFor="estado">Estado Actual</label>
                    <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="ACTIVA">Activa</option>
                        <option value="INACTIVA">Inactiva</option>
                    </select>
                </div>
            )}
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
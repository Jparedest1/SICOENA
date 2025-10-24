// src/components/AddInstitutionModal.js

import React, { useState, useEffect } from 'react';
// Reutilizamos los estilos del modal de usuario para consistencia
import './AddUserModal.css'; 

const AddInstitutionModal = ({ onClose, onSave, currentInstitution }) => {
  // --- Estados del formulario que coinciden con los campos de la tabla 'escuela' ---
  const [nombre, setNombre] = useState(''); // Mapea a nombre_escuela
  const [tipo, setTipo] = useState(''); // Mapea a tipo
  const [codigo, setCodigo] = useState(''); // Mapea a codigo_infraestructura
  const [telefono, setTelefono] = useState(''); // Mapea a telefono
  const [email, setEmail] = useState(''); // Mapea a correo
  const [direccion, setDireccion] = useState(''); // Mapea a direccion
  const [departamento, setDepartamento] = useState(''); // Mapea a departamento
  const [municipio, setMunicipio] = useState(''); // Mapea a municipio
  const [poblacion, setPoblacion] = useState(''); // Mapea a poblacion_beneficiaria
  const [director, setDirector] = useState(''); // Mapea a nombre_director
  const [observaciones, setObservaciones] = useState(''); // Mapea a observaciones
  const [estado, setEstado] = useState('ACTIVA'); // Mapea a estado

  const isEditMode = currentInstitution !== null;

  // Efecto para llenar los campos si estamos editando
  useEffect(() => {
    if (isEditMode) {
      setNombre(currentInstitution.nombre || ''); // Frontend usa 'nombre'
      setTipo(currentInstitution.tipo || '');
      setCodigo(currentInstitution.codigo || ''); // Frontend usa 'codigo'
      setTelefono(currentInstitution.telefono || '');
      setEmail(currentInstitution.email || ''); // Frontend usa 'email'
      setDireccion(currentInstitution.direccion || '');
      setDepartamento(currentInstitution.departamento || '');
      setMunicipio(currentInstitution.municipio || '');
      setPoblacion(currentInstitution.poblacion || ''); // Frontend usa 'poblacion'
      setDirector(currentInstitution.director || ''); // Frontend usa 'director'
      setObservaciones(currentInstitution.observaciones || '');
      setEstado(currentInstitution.estado || 'ACTIVA');
    } else {
        // Valores iniciales para nuevo registro
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

  // Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Crea el objeto de datos que se enviará a handleSaveInstitution en InstitutionsPage
    // Usamos los nombres de estado del modal aquí. El mapeo final a nombres de BD se hace en InstitutionsPage.
    const institutionData = { 
      nombre, tipo, codigo, telefono, email, direccion, 
      departamento, municipio, poblacion, director, observaciones, estado 
    };
    onSave(institutionData); // Llama a la función onSave pasada desde InstitutionsPage
  };

  return (
    // Estructura del Modal (Overlay + Content)
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}> {/* Clase 'large' para más espacio */}
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
              <label htmlFor="director">Director</label> {/* ID añadido */}
              <input type="text" id="director" value={director} onChange={(e) => setDirector(e.target.value)} />
              <small className="helper-text">Nombre de la persona responsable o director</small>
              </div>
              <div className="form-group">
                <label htmlFor="codigo">Código Esecuela *</label> {/* Etiqueta ajustada */}
                <input type="text" id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. 01-01-1234-45" required />
                <small className="helper-text">Código único de escuela</small>
              </div>
            </div>
          </div>

          {/* --- INFORMACIÓN DE CONTACTO --- */}
          <div className="form-section">
            <h3>INFORMACIÓN DE CONTACTO</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label> {/* ID añadido */}
                <input type="tel" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <small className="helper-text">Número de teléfono principal de contacto</small>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email de Contacto</label> {/* ID añadido */}
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

          {/* --- UBICACIÓN GEOGRÁFICA --- */}
          <div className="form-section">
            <h3>UBICACIÓN GEOGRÁFICA</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departamento">Departamento *</label>
                <select id="departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} required>
                  <option value="" disabled>Seleccionar departamento</option>
                  <option value="Sacatepéquez">Sacatepéquez</option>
                  <option value="Guatemala">Guatemala</option>
                  {/* Agrega otros departamentos */}
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
                  {/* Agrega otros municipios */}
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
                    <label htmlFor="poblacion">Cantidad de Estudiantes</label> {/* ID añadido */}
                    <input type="number" id="poblacion" value={poblacion} onChange={(e) => setPoblacion(e.target.value)} />
                    <small className="helper-text">Número aproximado de estudiantes</small>
                </div>
            </div>
            <div className="form-group">
              <label htmlFor="observaciones">Observaciones</label> {/* ID añadido */}
              <textarea id="observaciones" rows="3" value={observaciones} onChange={(e) => setObservaciones(e.target.value)}></textarea>
              <small className="helper-text">Notas adicionales, servicios que ofrece, etc.</small>
            </div>
            {/* Campo Estado (Opcional mostrarlo aquí, ya que se maneja en InstitutionsPage) */}
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

          {/* --- Botones de Acción --- */}
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
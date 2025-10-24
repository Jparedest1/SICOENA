// src/components/AddUserModal.js

import React, { useState, useEffect } from 'react';
import './AddUserModal.css'; // Assuming you have this CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCog, faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons';

const AddUserModal = ({ onClose, onSave, currentUser }) => {
  // --- States for relevant form fields ---
  const [nombre, setNombre] = useState(''); // Corresponds to 'nombres' in DB
  const [apellido, setApellido] = useState(''); // Corresponds to 'apellidos' in DB
  const [telefono, setTelefono] = useState(''); // Corresponds to 'telefono' in DB
  const [email, setEmail] = useState(''); // Corresponds to 'correo' in DB
  const [rol, setRol] = useState(''); // Corresponds to 'rol' in DB
  const [contrasena, setContrasena] = useState(''); // Corresponds to 'contraseña' in DB
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [estado, setEstado] = useState('Activo'); // Corresponds to 'estado' in DB
  const [enviarCredenciales, setEnviarCredenciales] = useState(true); // UI state

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Determine if we are editing an existing user
  const isEditMode = currentUser !== null;

  // Effect to populate fields when in edit mode
  useEffect(() => {
    if (isEditMode) {
      // Split the full name from the user object into first and last names
      const nameParts = currentUser.nombre ? currentUser.nombre.split(' ') : [''];
      setNombre(nameParts[0] || '');
      setApellido(nameParts.slice(1).join(' ') || '');

      // Populate other fields from the currentUser object
      // Use the email field from the user object for the 'correo' column
      setEmail(currentUser.email || ''); 
      setTelefono(currentUser.telefono || ''); // Assuming telefono exists in user object
      setRol(currentUser.rol || '');
      // Ensure state mapping handles potential case differences (e.g., 'ACTIVO' vs 'Activo')
      setEstado(currentUser.estado?.toUpperCase() === 'ACTIVO' ? 'Activo' : 'Inactivo'); 
      // Password fields remain empty in edit mode for security
      setContrasena(''); 
      setConfirmarContrasena('');
    } else {
      // Default values for creating a new user
      setNombre('');
      setApellido('');
      setEmail('');
      setTelefono('');
      setRol(''); // Start with empty or a default role like 'Usuario'
      setContrasena('');
      setConfirmarContrasena('');
      setEstado('Activo');
      setEnviarCredenciales(true);
    }
  }, [currentUser, isEditMode]); // Rerun effect if currentUser changes

  // Function to generate a random secure password
  const generateRandomPassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const allChars = upper + lower + numbers + symbols;
    const passwordLength = 14;
    let newPassword = '';
    // Ensure complexity
    newPassword += upper[Math.floor(Math.random() * upper.length)];
    newPassword += lower[Math.floor(Math.random() * lower.length)];
    newPassword += numbers[Math.floor(Math.random() * numbers.length)];
    newPassword += symbols[Math.floor(Math.random() * symbols.length)];
    // Fill the rest
    for (let i = 4; i < passwordLength; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    // Shuffle
    newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');
    setContrasena(newPassword);
    setConfirmarContrasena(newPassword);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate passwords only if creating a new user
    if (!isEditMode && contrasena !== confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Construct the data object to send to the backend
    const userData = {
      // Combine nombre and apellido for the backend if needed, or send separately
      nombre: `${nombre} ${apellido}`.trim(), 
      email: email, // Send email (backend maps to 'correo')
      rol: rol || 'Usuario', // Default role if not selected
      telefono: telefono || null, // Send null if empty
      estado: estado, // Send state ('Activo' or 'Inactivo')
      // Password is only sent when creating a new user
      ...( !isEditMode && { contrasena: contrasena } ) 
    };

    onSave(userData); // Call the save function passed from UsersPage
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}> {/* Added 'large' class */}
        <div className="modal-header">
          {/* Title changes based on mode */}
          <h2>{isEditMode ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h2> 
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          
          {/* --- INFORMACIÓN PERSONAL --- */}
          <div className="form-section">
            <h3>INFORMACIÓN PERSONAL</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input type="text" id="nombre" placeholder="Ingrese el nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <small className="helper-text">Nombre(s) del usuario</small>
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido *</label>
                <input type="text" id="apellido" placeholder="Ingrese el apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                <small className="helper-text">Apellido(s) del usuario</small>
              </div>
            </div>
            {/* CUI field removed */}
            <div className="form-row"> 
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input type="tel" id="telefono" placeholder="Ingrese el teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <small className="helper-text">Número de teléfono (opcional)</small>
              </div>
               <div className="form-group"> {/* Email moved here to fill the row */}
                <label htmlFor="email">Correo Electrónico *</label>
                <input type="email" id="email" placeholder="Ingrese el correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <small className="helper-text">Dirección de correo electrónico única del usuario</small>
              </div>
            </div>
          </div>

          {/* --- CONFIGURACIÓN DEL SISTEMA --- */}
          <div className="form-section">
            <h3>CONFIGURACIÓN DEL SISTEMA</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rol">Rol *</label>
                <select id="rol" value={rol} onChange={(e) => setRol(e.target.value)} required>
                  <option value="" disabled>Seleccionar rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Usuario">Usuario</option>
                  <option value="Operador">Operador</option> {/* Added Operator role */}
                </select>
                <small className="helper-text">Seleccione el rol que tendrá el usuario en el sistema</small>
              </div>
              {/* Institución field removed */}
               <div className="form-group"> {/* Added empty div for layout consistency */}
                    {/* Optionally add another system setting here if needed */}
               </div>
            </div>
          </div>

          {/* --- CONFIGURACIÓN DE SEGURIDAD (Only for New Users) --- */}
          {!isEditMode && ( 
            <div className="form-section">
              <div className="section-header-with-button">
                <h3><FontAwesomeIcon icon={faLock} className="section-icon" /> CONFIGURACIÓN DE SEGURIDAD</h3>
                <button type="button" className="generate-password-btn" onClick={generateRandomPassword}>
                  <FontAwesomeIcon icon={faKey} /> Generar Contraseña
                </button>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contrasena">Contraseña *</label>
                  <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} id="contrasena" placeholder="Ingrese la contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)} />
                  </div>
                  <small className="helper-text">Mínimo 8 caracteres, incluya mayúsculas, minúsculas y números</small>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmarContrasena">Confirmar Contraseña *</label>
                  <div className="password-wrapper">
                    <input type={showConfirmPassword ? "text" : "password"} id="confirmarContrasena" placeholder="Confirme la contraseña" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} required />
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                  </div>
                  <small className="helper-text">Repita la contraseña para confirmar</small>
                </div>
              </div>
            </div>
          )}
          {isEditMode && ( // Optional: Add a note about password changes in edit mode
            <div className="form-section">
                 <h3><FontAwesomeIcon icon={faLock} className="section-icon" /> CONFIGURACIÓN DE SEGURIDAD</h3>
                 <p className="helper-text">La gestión de contraseñas (restablecimiento) se realiza por separado.</p>
            </div>
          )}


          {/* --- CONFIGURACIONES ADICIONALES --- */}
          <div className="form-section">
            <h3><FontAwesomeIcon icon={faCog} className="section-icon" /> CONFIGURACIONES ADICIONALES</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="estado">Estado del Usuario</label>
                <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                <small className="helper-text">Estado actual del usuario en el sistema</small>
              </div>

            </div>
          </div>

          {/* --- Modal Footer --- */}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">
              {/* Button text changes based on mode */}
              {isEditMode ? 'Guardar Cambios' : 'Crear Usuario'} 
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
// src/components/AddUserModal.js

import React, { useState, useEffect } from 'react'; // <-- CORREGIDO AQUÍ
import './AddUserModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCog, faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons';

const AddUserModal = ({ onClose, onSave, currentUser }) => {
  // --- CORREGIDO AQUÍ (useState en lugar de in_stock) ---
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cui, setCui] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('');
  const [institucion, setInstitucion] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [estado, setEstado] = useState('Activo');
  const [enviarCredenciales, setEnviarCredenciales] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEditMode = currentUser !== null;

  useEffect(() => {
    if (isEditMode) {
      const nameParts = currentUser.nombre.split(' ');
      setNombre(nameParts[0] || '');
      setApellido(nameParts.slice(1).join(' ') || '');
      setCui(currentUser.cui || '');
      setTelefono(currentUser.telefono || '');
      setEmail(currentUser.email || '');
      setRol(currentUser.rol || '');
      setInstitucion(currentUser.institucion || '');
      setEstado(currentUser.estado.toUpperCase() === 'ACTIVO' ? 'Activo' : 'Inactivo');
    }
  }, [currentUser, isEditMode]);

  const generateRandomPassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const allChars = upper + lower + numbers + symbols;
    const passwordLength = 14;
    let newPassword = '';
    newPassword += upper[Math.floor(Math.random() * upper.length)];
    newPassword += lower[Math.floor(Math.random() * lower.length)];
    newPassword += numbers[Math.floor(Math.random() * numbers.length)];
    newPassword += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 4; i < passwordLength; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');
    setContrasena(newPassword);
    setConfirmarContrasena(newPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditMode && contrasena !== confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const userData = {
      nombre: `${nombre} ${apellido}`.trim(),
      cui,
      telefono,
      email,
      rol,
      institucion,
      estado: estado.toUpperCase(),
    };
    
    if (!isEditMode) {
      userData.contrasena = contrasena;
    }

    onSave(userData);
  };

  // ... (El resto del return JSX se queda igual)
  return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
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
                    {/* ... (resto de los campos de información personal) ... */}
                    <div className="form-row">
              <div className="form-group">
                <label htmlFor="cui">CUI *</label>
                <input type="text" id="cui" placeholder="Ingrese la cédula" value={cui} onChange={(e) => setCui(e.target.value)} required />
                <small className="helper-text">Código Único de Identificación (13 dígitos)</small>
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input type="tel" id="telefono" placeholder="Ingrese el teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <small className="helper-text">Número de teléfono (opcional)</small>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico *</label>
              <input type="email" id="email" placeholder="Ingrese el correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <small className="helper-text">Dirección de correo electrónico única del usuario</small>
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
                            </select>
                            <small className="helper-text">Seleccione el rol que tendrá el usuario en el sistema</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="institucion">Institución</label>
                            <select id="institucion" value={institucion} onChange={(e) => setInstitucion(e.target.value)}>
                                <option value="" disabled>Seleccionar institución</option>
                                <option value="Escuela No. 1">Escuela No. 1</option>
                            </select>
                            <small className="helper-text">Institución a la que pertenece el usuario (opcional)</small>
                        </div>
                    </div>
                </div>

                {/* --- CONTRASEÑA --- */}
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
                            <small className="helper-text">Estado inicial del usuario en el sistema</small>
                        </div>
                        <div className="form-group checkbox-group">
                            <input type="checkbox" id="enviarCredenciales" checked={enviarCredenciales} onChange={(e) => setEnviarCredenciales(e.target.checked)} />
                            <label htmlFor="enviarCredenciales">Enviar Credenciales por Email</label>
                            <small className="helper-text">El usuario recibirá un email con sus credenciales de acceso</small>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-save">
                        {isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default AddUserModal;
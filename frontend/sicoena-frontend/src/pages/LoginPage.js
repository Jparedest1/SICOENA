// src/pages/LoginPage.js

import React, { useState } from 'react';
import './LoginPage.css';
import sicoenaLogo from '../assets/logo_sicoena.png'; // Asegúrate de tener tu logo en src/assets/

const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Usuario:', usuario, 'Contraseña:', contrasena);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        
        <div className="login-header">
          <img src={sicoenaLogo} alt="Logo de SICOENA" className="sicoena-logo-img" />
          <p>Sistema de Control de Entrega de Alimentos</p>
          <p>Acceso al Sistema</p>
        </div>

        <h3>Iniciar Sesión</h3>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Usuario</label>
            <input 
              type="text" 
              placeholder="Ingrese su usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password"
              placeholder="Ingrese su contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button">Ingresar al Sistema</button>
          <a href="#" className="forgot-password">¿Olvidó su contraseña?</a>
        </form>

        <footer className="login-footer">
          <p>© 2025 SICOENA</p>
        </footer>
        
      </div>
    </div>
  );
};

export default LoginPage;
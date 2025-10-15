import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './LoginPage.css';
import sicoenaLogo from '../assets/logo_sicoena.png';

const LoginPage = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);

  /**
   * Maneja el inicio de sesión estándar (formulario)
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('Simulando login estándar para:', usuario);

        onLoginSuccess();
  };

    const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    console.log("Simulando login con Google:", credentialResponse.credential);
    
    // 3. ¡YA NO HAY FETCH! Solo llama a la función del padre
    onLoginSuccess();
  };

  /**
   * Maneja un error durante el flujo de Google
   */
  const handleGoogleError = () => {
    setError('El inicio de sesión con Google falló. Por favor, intente de nuevo.');
    console.error('Login de Google fallido');
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

        {/* --- CONTENEDOR DE ERROR --- */}
        {error && (
          <div className="login-error-message">
            {error}
          </div>
        )}

        {/* --- FORMULARIO ESTÁNDAR --- */}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Usuario (Email)</label>
            <input 
              type="email" 
              placeholder="Ingrese su usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)} 
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password"
              placeholder="Ingrese su contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Ingresar al Sistema</button>
          <a href="#" className="forgot-password">¿Olvidó su contraseña?</a>
        </form>

        {/* --- DIVISOR "O" --- */}
        <div className="login-divider">
          <span>o</span>
        </div>

        {/* --- BOTÓN DE GOOGLE --- */}
        <div className="google-login-button-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false} // Para que no aparezca automáticamente
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%" // Esto es clave para que se ajuste
          />
        </div>

        <footer className="login-footer">
          <p>© 2025 SICOENA</p>
        </footer>
        
      </div>
    </div>
  );
};

export default LoginPage;
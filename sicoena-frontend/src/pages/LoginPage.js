// src/pages/LoginPage.js

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './LoginPage.css';
import sicoenaLogo from '../assets/logo-sicoena.png'; 

// Define your backend API base URL
const API_URL = 'http://localhost:5000/api'; 

const LoginPage = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState(''); // Corresponds to 'email' in backend
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // To show loading state

  /**
   * Handles standard form login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: usuario, password: contrasena }), // Send email and password
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors from the backend (like invalid credentials)
        throw new Error(data.message || 'Error al iniciar sesión.');
      }

      // Login successful, backend sends back a token
      localStorage.setItem('authToken', data.token); // Store the token
      localStorage.setItem('userData', JSON.stringify(data.user)); // Store basic user data (optional)
      onLoginSuccess(); // Notify App.js to update state and redirect

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  /**
   * Handles successful Google login (sends Google token to backend)
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Send the Google token to your backend for verification and login/registration
      const response = await fetch(`${API_URL}/auth/google/verify`, { // Use your actual Google verification endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle backend errors (e.g., email not registered in your system)
        throw new Error(data.message || 'Error al iniciar sesión con Google.');
      }

      // Google login successful, backend sends back your app's token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user)); // Store basic user data
      onLoginSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Google login errors
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

        {/* --- Error Message --- */}
        {error && (
          <div className="login-error-message">
            {error}
          </div>
        )}

        {/* --- Standard Form --- */}
        <form onSubmit={handleLogin}>
          {/* ... (input fields for usuario/email and contrasena) ... */}
          <div className="input-group">
            <label>Usuario (Email)</label>
            <input 
              type="email" 
              placeholder="Ingrese su correo electrónico"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)} 
              required
              disabled={isLoading} // Disable fields while loading
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
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
          <a href="#" className="forgot-password">¿Olvidó su contraseña?</a>
        </form>

        <div className="login-divider"><span>o</span></div>

        {/* --- Google Button --- */}
        <div className="google-login-button-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false} 
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%" 
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
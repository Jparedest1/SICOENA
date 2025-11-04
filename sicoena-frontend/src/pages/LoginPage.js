import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './LoginPage.css';
import sicoenaLogo from '../assets/logo-sicoena.png'; 

const API_URL = process.env.REACT_APP_API_URL || '/api';

console.log('API URL:', API_URL);

const LoginPage = ({ onLoginSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LoginPage montado');
    console.log('ESTA ES LA VERSIÓN NUEVA CON SESSIONSTORAGE');
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
      console.log('Sesión activa detectada, redirigiendo...');
    }
  }, [navigate]);

  const saveUserData = (data) => {
    try {
      sessionStorage.setItem('authToken', data.token);
      
      sessionStorage.setItem('userInfo', JSON.stringify({
        id_usuario: data.user?.id_usuario || data.user?.id,
        nombres: data.user?.nombres || data.user?.name,
        email: data.user?.email,
        rol: data.user?.rol || 'USUARIO'
      }));

      sessionStorage.setItem('userData', JSON.stringify(data.user));

      console.log('Usuario logueado exitosamente:', {
        email: data.user?.email,
        rol: data.user?.rol || 'USUARIO'
      });

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Error guardando datos de usuario:', err);
      setError('Error guardando datos. Intente de nuevo.');
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario, password: contrasena }) 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciales incorrectas. Por favor, intente de nuevo.');
      }

      console.log('Login exitoso:', data);      
      saveUserData(data);
      navigate('/dashboard');

    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Iniciando login con Google...');
      
      const response = await fetch(`${API_URL}/auth/google/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      console.log('Respuesta de Google - Status:', response.status);

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`No se pudo leer la respuesta del servidor: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: No se pudo iniciar sesión con Google.`);
      }

      console.log('Login Google exitoso:', data);
      saveUserData(data);
      onLoginSuccess?.();
      navigate('/dashboard');

    } catch (err) {
      console.error('Error en login Google:', err);
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('No se pudo conectar al servidor.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('El inicio de sesión con Google falló. Por favor, intente de nuevo.');
    console.error('Google login error');
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

        {error && (
          <div className="login-error-message" style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #fcc',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Usuario (Email)</label>
            <input 
              type="email" 
              placeholder="Ingrese su correo electrónico"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)} 
              required
              disabled={isLoading}
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
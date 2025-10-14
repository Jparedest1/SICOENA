import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './LoginPage.css';
import sicoenaLogo from '../assets/logo_sicoena.png'; // Asegúrate que tu logo esté en src/assets/

const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  
  // Estado para mostrar errores al usuario
  const [error, setError] = useState(null);

  /**
   * Maneja el inicio de sesión estándar (formulario)
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Limpia errores anteriores
    
    console.log('Intentando iniciar sesión con:', usuario, contrasena);
    
    // --- LÓGICA DE LOGIN ESTÁNDAR ---
    // Aquí harías una llamada (fetch) a tu backend con el usuario y contraseña
    // try {
    //   const res = await fetch('http://TU-BACKEND-API.COM/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email: usuario, password: contrasena }),
    //   });
    //   if (!res.ok) throw new Error('Usuario o contraseña incorrectos.');
    //   
    //   const { miTokenJWT } = await res.json();
    //   localStorage.setItem('authToken', miTokenJWT);
    //   window.location.href = '/dashboard';
    // } catch (err) {
    //   setError(err.message);
    // }
  };

  /**
   * Maneja el inicio de sesión exitoso con Google
   * (Google nos da un token, se lo enviamos a nuestro backend)
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null); // Limpia errores anteriores
    console.log("Token de Google recibido:", credentialResponse.credential);

    try {
      // Envía el token de Google a TU PROPIO BACKEND para verificación
      const res = await fetch('http://TU-BACKEND-API.COM/api/auth/google/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Enviamos el token que nos dio Google en el cuerpo
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      // Si el backend dice que no (porque el email no está en tu DB), !res.ok será true
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Este correo no está autorizado en SICOENA.');
      }

      // Si todo OK, el backend nos da NUESTRO PROPIO TOKEN (JWT)
      const { miTokenJWT } = await res.json();
      
      // Guardamos nuestro token y redirigimos al dashboard
      localStorage.setItem('authToken', miTokenJWT);
      window.location.href = '/dashboard'; // Redirección simple

    } catch (err) {
      console.error('Error en la verificación de Google:', err);
      setError(err.message); // Muestra el error (ej. "Este correo no está autorizado...")
    }
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
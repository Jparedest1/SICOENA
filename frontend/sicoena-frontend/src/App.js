// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa el ícono del menú (hamburger)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

// Importa tus componentes
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// import UsersPage from './pages/UsersPage'; 
// ...etc.

import './App.css'; // Asegúrate que App.css esté importado

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // --- ¡NUEVO ESTADO! ---
  // 1. Estado para controlar la visibilidad del Sidebar. Por defecto, visible.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fakeAuthToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('fakeAuthToken', 'un-token-falso-de-prueba');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('fakeAuthToken');
    setIsLoggedIn(false);
  };

  // --- ¡NUEVA FUNCIÓN! ---
  // 2. Función para cambiar el estado del sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      {!isLoggedIn ? (
        // --- SIN LOGUEAR ---
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // --- SÍ LOGUEADO ---
        
        // 3. Añadimos una clase condicional al contenedor principal
        <div 
          className={isSidebarOpen ? "app-container-logged-in" : "app-container-logged-in sidebar-closed"}
        >
          {/* 4. Le pasamos el estado al Sidebar para que sepa si está abierto */}
          <Sidebar onLogout={handleLogout} isSidebarOpen={isSidebarOpen} />
          
          <main className="content-area">
            
            {/* 5. Añadimos el botón para controlar el sidebar */}
            <button onClick={toggleSidebar} className="sidebar-toggle-btn">
              <FontAwesomeIcon icon={faBars} />
            </button>
            
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* <Route path="/usuarios" element={<UsersPage />} /> */}
              {/* <Route path="/instituciones" element={<InstitutionsPage />} /> */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
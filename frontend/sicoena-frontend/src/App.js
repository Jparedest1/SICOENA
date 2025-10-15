import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
//import UsersPage from './pages/UsersPage';
//import InstitutionsPage from './pages/InstitutionsPage';
//import InventoryPage from './pages/InventoryPage';
//import OrdersPage from './pages/OrdersPage';
//import ReportsPage from './pages/ReportsPage';
//import SettingsPage from './pages/SettingsPage';
//import HelpPage from './pages/HelpPage';
//import BackupsPage from './pages/BackupsPage';
//import LogsPage from './pages/LogsPage';
// ...etc

import './App.css'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // El estado del sidebar sigue viviendo aquí
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
  
  // La función de toggle sigue viviendo aquí
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <Tooltip id="my-tooltip" variant="light" placement="bottom" offset={10} style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}/>
      {!isLoggedIn ? (
        // --- SIN LOGUEAR ---
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // --- SÍ LOGUEADO ---
        // Usamos un Fragment (<>) para renderizar Header y el layout principal
        <>
          {/* 1. Renderiza el Header y pásale las funciones */}
          <Header onLogout={handleLogout} toggleSidebar={toggleSidebar} />
          
          {/* 2. El layout principal ahora se llama 'app-main-layout' */}
          <div 
            className={isSidebarOpen ? "app-main-layout" : "app-main-layout sidebar-closed"}
          >
            {/* 3. El Sidebar ya NO necesita el prop isSidebarOpen */}
            <Sidebar onLogout={handleLogout} />
            
            <main className="content-area">
              {/* 4. ¡El botón de toggle ya NO va aquí! */}
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                {/* A medida que crees cada página, descomenta su import y su ruta */}
                {/*<Route path="/usuarios" element={<UsersPage />} />
                <Route path="/instituciones" element={<InstitutionsPage />} />
                <Route path="/inventario" element={<InventoryPage />} />
                <Route path="/ordenes" element={<OrdersPage />} />
                <Route path="/reportes" element={<ReportsPage />} />
                <Route path="/configuracion" element={<SettingsPage />} />
                <Route path="/ayuda" element={<HelpPage />} />
                <Route path="/respaldos" element={<BackupsPage />} />
                <Route path="/logs" element={<LogsPage />} />*/}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import HelpPage from './pages/HelpPage';
import UsersPage from './pages/UsersPage';
import InstitutionsPage from './pages/InstitutionsPage';
import SettingsPage from './pages/SettingsPage';
import BackupsPage from './pages/BackupsPage';
import LogsPage from './pages/LogsPage';

const AppLayout = ({ children, userInfo, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const userRole = userInfo?.rol?.toUpperCase().trim() || 'USUARIO';

  return (
    <div className="app-layout-container">
      <Header 
        userInfo={userInfo} 
        onLogout={onLogout}
        toggleSidebar={handleToggleSidebar}
      />
      
      <div className="app-layout-content">
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
          {sidebarOpen && (
            <Sidebar 
              userRole={userRole} 
              userInfo={userInfo} 
              onLogout={onLogout}
            />
          )}
        </div>
        
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 

   useEffect(() => {
    try {
      const userInfoData = sessionStorage.getItem('userInfo');
      
      if (userInfoData) {
        const user = JSON.parse(userInfoData);
        setUserInfo(user);
        setIsAuthenticated(true);
      } else {
        setUserInfo(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al parsear datos de sesión, limpiando sesión:', error);
      sessionStorage.clear();
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    const userInfoData = sessionStorage.getItem('userInfo');
    if (userInfoData) {
      setUserInfo(JSON.parse(userInfoData));
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px' }}>
        Verificando sesión...
      </div>
    );
  }
  
  const userRole = userInfo?.rol?.toUpperCase().trim() || null;

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <AppLayout userInfo={userInfo} onLogout={handleLogout}>
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="reportes" element={<ReportsPage />} />
                  <Route path="ayuda" element={<HelpPage />} />

                  <Route 
                    path="ordenes" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'USUARIO']} userRole={userRole}>
                        <OrdersPage />
                      </ProtectedRoute>
                    } 
                  />

                  <Route path="inventario" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><InventoryPage /></ProtectedRoute>} />
                  <Route path="usuario" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><UsersPage /></ProtectedRoute>} />
                  <Route path="institucion" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><InstitutionsPage /></ProtectedRoute>} />
                  <Route path="configuracion" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><SettingsPage /></ProtectedRoute>} />
                  <Route path="respaldos" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><BackupsPage /></ProtectedRoute>} />
                  <Route path="logs" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><LogsPage /></ProtectedRoute>} />
                  
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
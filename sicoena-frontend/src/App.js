// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

// ✅ Importar TODAS las páginas
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

// ✅ Componente envolvente que contiene Header y Sidebar
const AppLayout = ({ children, userRole, userInfo, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    console.log('🔄 Toggle Sidebar:', !sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

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
  const [userRole, setUserRole] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const getUserRole = () => {
      try {
        const userInfoData = localStorage.getItem('userInfo');
        
        if (userInfoData) {
          const user = JSON.parse(userInfoData);
          // ✅ Normalizar rol: convertir a mayúsculas y eliminar espacios
          const normalizedRole = (user.rol || 'USUARIO')
            .toUpperCase()
            .trim();
          
          console.log('👤 Usuario cargado:', { 
            email: user.email, 
            nombres: user.nombres,
            rolOriginal: user.rol,
            rolNormalizado: normalizedRole
          });
          
          setUserRole(normalizedRole);
          setUserInfo(user);
        } else {
          setUserRole(null);
          setUserInfo(null);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error obteniendo rol del usuario:', error);
        setUserRole(null);
        setUserInfo(null);
        setIsLoading(false);
      }
    };

    getUserRole();
  }, [refreshKey]);

  const handleLoginSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userData');
    setUserRole(null);
    setUserInfo(null);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando aplicación...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        
        {/* ✅ DASHBOARD - Acceso: Admin + Usuario */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR', 'USUARIO']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ REPORTES - Acceso: Admin + Usuario */}
        <Route 
          path="/reportes" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR', 'USUARIO']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <ReportsPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ AYUDA - Acceso: Admin + Usuario */}
        <Route 
          path="/ayuda" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR', 'USUARIO']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <HelpPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ INVENTARIO - Acceso: Solo Admin */}
        <Route 
          path="/inventario" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <InventoryPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ ÓRDENES - Acceso: Solo Admin */}
        <Route 
          path="/ordenes" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <OrdersPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ USUARIOS - Acceso: Solo Admin */}
        <Route 
          path="/usuario" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <UsersPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ INSTITUCIONES - Acceso: Solo Admin */}
        <Route 
          path="/institucion" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <InstitutionsPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ CONFIGURACIÓN - Acceso: Solo Admin */}
        <Route 
          path="/configuracion" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ RESPALDOS - Acceso: Solo Admin */}
        <Route 
          path="/respaldos" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <BackupsPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* ✅ LOGS DEL SISTEMA - Acceso: Solo Admin */}
        <Route 
          path="/logs" 
          element={
            <ProtectedRoute 
              allowedRoles={['ADMINISTRADOR']} 
              userRole={userRole}
            >
              <AppLayout userRole={userRole} userInfo={userInfo} onLogout={handleLogout}>
                <LogsPage />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
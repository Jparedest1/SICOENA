import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

// Importar TODAS las páginas
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

// Componente envolvente que contiene Header y Sidebar
const AppLayout = ({ children, userInfo, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // ✅ Usamos el rol desde userInfo para pasarlo a Sidebar
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
  // ✅ MODIFICADO: Simplificamos los estados. 'isAuthenticated' es ahora la fuente de verdad.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Este estado es crucial

  useEffect(() => {
    // Esta función se ejecuta solo una vez al cargar la aplicación
    try {
      const userInfoData = localStorage.getItem('userInfo');
      
      if (userInfoData) {
        const user = JSON.parse(userInfoData);
        // ✅ Se establece toda la información del usuario y el estado de autenticación
        setUserInfo(user);
        setIsAuthenticated(true);
      } else {
        // Si no hay datos, nos aseguramos de que el estado esté limpio
        setUserInfo(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al parsear datos de sesión, limpiando sesión:', error);
      // Si hay un error (ej. JSON mal formado), se limpia todo para evitar problemas
      localStorage.clear();
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      // ✅ Una vez que la verificación termina, dejamos de cargar.
      setIsLoading(false);
    }
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez.

  const handleLoginSuccess = () => {
    // Al iniciar sesión, leemos los datos frescos de localStorage
    const userInfoData = localStorage.getItem('userInfo');
    if (userInfoData) {
      setUserInfo(JSON.parse(userInfoData));
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserInfo(null);
    // No es necesario Navigate aquí, el cambio de estado en las rutas lo hará automáticamente.
  };

  // ✅ MODIFICADO: Mientras isLoading sea true, mostramos un mensaje.
  // Esto previene que las rutas se rendericen antes de tiempo.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px' }}>
        Verificando sesión...
      </div>
    );
  }
  
  // ✅ Extraemos el rol del usuario de forma segura
  const userRole = userInfo?.rol?.toUpperCase().trim() || null;

  return (
    <Router>
      <Routes>
        {/* ✅ MODIFICADO: La ruta de Login ahora redirige si ya estás autenticado */}
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
        
        {/* Se agrupan las rutas protegidas para mayor claridad */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <AppLayout userInfo={userInfo} onLogout={handleLogout}>
                <Routes>
                  {/* Rutas para TODOS los usuarios autenticados */}
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="reportes" element={<ReportsPage />} />
                  <Route path="ayuda" element={<HelpPage />} />

                  {/* Rutas SOLO para ADMINISTRADOR */}
                  <Route path="inventario" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><InventoryPage /></ProtectedRoute>} />
                  <Route path="ordenes" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><OrdersPage /></ProtectedRoute>} />
                  <Route path="usuario" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><UsersPage /></ProtectedRoute>} />
                  <Route path="institucion" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><InstitutionsPage /></ProtectedRoute>} />
                  <Route path="configuracion" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><SettingsPage /></ProtectedRoute>} />
                  <Route path="respaldos" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><BackupsPage /></ProtectedRoute>} />
                  <Route path="logs" element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} userRole={userRole}><LogsPage /></ProtectedRoute>} />
                  
                  {/* Redirección por defecto dentro del layout */}
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
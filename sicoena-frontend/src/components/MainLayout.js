// src/components/MainLayout.js (o tu componente principal)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setUserRole(user.rol || 'USUARIO');
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (!userRole) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="main-layout">
      <Sidebar userRole={userRole} onLogout={handleLogout} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
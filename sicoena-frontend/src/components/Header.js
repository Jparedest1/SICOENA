// src/components/Header.js

import React, { useState, useEffect, useRef } from 'react'; // <-- Importa useRef
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import sicoenaLogo from '../assets/logo-sicoena.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faSearch, faTachometerAlt, faUsers, faBuilding,
  faBoxes, faChartBar, faSignOutAlt, faBell, faUserCircle,
  faCheck // Icon for marking read
} from '@fortawesome/free-solid-svg-icons';

// Mock Notifications
const initialNotifications = [
    { id: 1, text: 'Nuevo usuario "Carlos G." registrado.', read: false, time: 'Hace 5 min' },
    { id: 2, text: 'Stock bajo para el producto "PRD-004 - Bandita".', read: false, time: 'Hace 1 hora' },
    { id: 3, text: 'Orden "ORD-2025-003" ha sido entregada.', read: false, time: 'Hace 3 horas' },
    { id: 4, text: 'Respaldo automático completado.', read: true, time: 'Ayer' }, // Example of a read one
];

const Header = ({ toggleSidebar, onLogout }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // --- NEW STATES for Notifications ---
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false); // Dropdown visibility

  const notificationRef = useRef(null);

  useEffect(() => {
    // ... (existing useEffect to load userData) ...
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogoutClick(); // Logout if data is corrupt
      }
    } else if (localStorage.getItem('authToken')) {
        console.warn("Token found but no user data. Logging out.");
        handleLogoutClick();
    }
  }, [navigate]); // Removed onLogout from dependencies here

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el dropdown está abierto y el clic NO fue dentro del contenedor del dropdown (notificationRef.current)
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false); // Cierra el dropdown
      }
    };

    // Añade el listener solo si el dropdown está visible
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Si no está visible, asegúrate de quitar cualquier listener previo
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Función de limpieza: se ejecuta cuando el componente se desmonta o antes de que el efecto se vuelva a ejecutar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]); // Este efecto depende del estado showNotifications

  const handleLogoutClick = () => {
      onLogout();
      navigate('/login');
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="top-navbar">
      {/* --- LADO IZQUIERDO (sin cambios) --- */}
       <div className="navbar-left">
         <button onClick={toggleSidebar} className="navbar-toggle-btn" title="Menú de opciones">
          <FontAwesomeIcon icon={faBars} />
        </button>
        <Link to="/dashboard" className="navbar-logo">
          <img src={sicoenaLogo} alt="SICOENA Logo" className="logo-image" />
        </Link>
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input type="text" placeholder="Buscar..." />
        </div>
      </div>

      {/* --- LADO DERECHO --- */}
      <div className="navbar-right">
        <div className="quick-icons">
          {/* ... (otros iconos) ... */}
           <Link to="/dashboard" title="Dashboard"><FontAwesomeIcon icon={faTachometerAlt} /></Link>
          <Link to="/usuarios" title="Usuarios"><FontAwesomeIcon icon={faUsers} /></Link>
          <Link to="/instituciones" title="Instituciones"><FontAwesomeIcon icon={faBuilding} /></Link>
          <Link to="/inventario" title="Inventario"><FontAwesomeIcon icon={faBoxes} /></Link>
          <Link to="/reportes" title="Reportes"><FontAwesomeIcon icon={faChartBar} /></Link>

           {/* --- CONTENEDOR DE NOTIFICACIONES --- */}
           {/* --- 3. AÑADE LA REFERENCIA (ref) AL DIV CONTENEDOR --- */}
           <div className="notification-container" ref={notificationRef}>
                <button onClick={toggleNotifications} className="notification-bell-btn" title="Notificaciones">
                    <FontAwesomeIcon icon={faBell} />
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount}</span>
                    )}
                </button>
                {showNotifications && (
                    <div className="notification-dropdown">
                        <div className="dropdown-header">
                            <span>Notificaciones</span>
                            <button onClick={markAllAsRead} disabled={unreadCount === 0}>
                                <FontAwesomeIcon icon={faCheck}/> Marcar todas como leídas
                            </button>
                        </div>
                        <ul className="notification-list">
                            {notifications.length > 0 ? notifications.map(n => (
                                <li key={n.id} className={n.read ? 'read' : 'unread'}>
                                    <p>{n.text}</p>
                                    <small>{n.time}</small>
                                </li>
                            )) : (
                                <li className="no-notifications">No hay notificaciones nuevas.</li>
                            )}
                        </ul>
                    </div>
                )}
           </div>
        </div>

        {/* --- User Info (sin cambios) --- */}
        <div className="user-profile-section">
            <FontAwesomeIcon icon={faUserCircle} className="user-avatar-icon"/>
            <div className="user-info">
              <span>{userData ? userData.nombre : 'Usuario'}</span>
              <span className="user-id">{userData ? (userData.rol || userData.email) : 'Cargando...'}</span>
            </div>
        </div>

        {/* --- Logout Button (sin cambios) --- */}
        <button onClick={handleLogoutClick} className="navbar-logout-btn" title="Cerrar Sesión">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </header>
  );
};

export default Header;
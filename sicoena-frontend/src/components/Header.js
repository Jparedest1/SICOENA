import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import sicoenaLogo from '../assets/logo-sicoena.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faSearch, faTachometerAlt, faUsers, faBuilding,
  faBoxes, faChartBar, faSignOutAlt, faBell, faUserCircle,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:5000/api';

const Header = ({ toggleSidebar, onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setUserData(JSON.parse(userInfo));
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogoutClick();
      }
    } else if (localStorage.getItem('authToken')) {
      console.warn("Token found but no user data. Logging out.");
      handleLogoutClick();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.log('No token available');
        return;
      }

      console.log('Fetching notifications...');

      const response = await fetch(`${API_URL}/notificaciones?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          return;
        }
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      console.log('Notificaciones obtenidas:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (showNotifications && notifications.length === 0) {
      fetchNotifications();
    }
  }, [showNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}/notificaciones/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al marcar como leídas');

      const data = await response.json();
      console.log('Notificaciones marcadas como leídas:', data);
      
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}/notificaciones/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al marcar como leída');

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="top-navbar">
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

      <div className="navbar-right">
        <div className="quick-icons">
          <Link to="/dashboard" title="Dashboard"><FontAwesomeIcon icon={faTachometerAlt} /></Link>
          <Link to="/usuarios" title="Usuarios"><FontAwesomeIcon icon={faUsers} /></Link>
          <Link to="/instituciones" title="Instituciones"><FontAwesomeIcon icon={faBuilding} /></Link>
          <Link to="/inventario" title="Inventario"><FontAwesomeIcon icon={faBoxes} /></Link>
          <Link to="/reportes" title="Reportes"><FontAwesomeIcon icon={faChartBar} /></Link>

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
                    <FontAwesomeIcon icon={faCheck} /> Marcar todas como leídas
                  </button>
                </div>
                <ul className="notification-list">
                  {loadingNotifications ? (
                    <li className="loading">Cargando notificaciones...</li>
                  ) : notifications.length > 0 ? (
                    notifications.map(n => (
                      <li 
                        key={n.id} 
                        className={n.read ? 'read' : 'unread'}
                        onClick={() => markAsRead(n.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="notification-content">
                          <strong>{n.titulo}</strong>
                          <p>{n.text}</p>
                          <small>{n.time}</small>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="no-notifications">No hay notificaciones nuevas.</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="user-profile-section">
          <FontAwesomeIcon icon={faUserCircle} className="user-avatar-icon" />
          <div className="user-info">
            <span>{userData?.nombres || 'Usuario'}</span>
            <span className="user-id">{userData?.rol || 'Cargando...'}</span>
          </div>
        </div>

        <button onClick={handleLogoutClick} className="navbar-logout-btn" title="Cerrar Sesión">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </header>
  );
};

export default Header;
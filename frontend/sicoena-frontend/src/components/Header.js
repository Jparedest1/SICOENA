import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import sicoenaLogo from '../assets/logo_sicoena.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faSearch, 
  faTachometerAlt, 
  faUsers, 
  faBuilding, 
  faBoxes, 
  faChartBar,
  faSignOutAlt,
  faBell
} from '@fortawesome/free-solid-svg-icons';

const Header = ({ toggleSidebar, onLogout }) => {
  return (
    <header className="top-navbar">
      {/* --- LADO IZQUIERDO: AHORA INCLUYE LA BÚSQUEDA --- */}
      <div className="navbar-left">
        <button onClick={toggleSidebar} className="navbar-toggle-btn" title="Menú de opciones">
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className="navbar-logo">
          <img src={sicoenaLogo} alt="SICOENA Logo" className="logo-image" />
        </div>
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input type="text" placeholder="Buscar..." />
        </div>
      </div>

      {/* --- LADO DERECHO: Iconos y Usuario --- */}
      <div className="navbar-right">
        {/* Iconos de acceso rápido */}
        <div className="quick-icons">
          <Link to="/dashboard" title="Dashboard"><FontAwesomeIcon icon={faTachometerAlt} /></Link>
          <Link to="/usuarios" title="Usuarios"><FontAwesomeIcon icon={faUsers} /></Link>
          <Link to="/instituciones" title="Instituciones"><FontAwesomeIcon icon={faBuilding} /></Link>
          <Link to="/inventario" title="Inventario"><FontAwesomeIcon icon={faBoxes} /></Link>
          <Link to="/reportes" title="Reportes"><FontAwesomeIcon icon={faChartBar} /></Link>
          <Link to="#" title="Notificaciones" className="notification-bell">
            <FontAwesomeIcon icon={faBell} />
            <span className="notification-badge">12</span>
          </Link>
        </div>

        {/* Información del usuario y Logout */}
        <div className="user-info">
          <span>Admin Usuario</span>
          <span className="user-id">0910-13-18822</span>
          {/* Aquí podrías poner un avatar/imagen */}
        </div>
        <button onClick={onLogout} className="navbar-logout-btn" title="Cerrar Sesión">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </header>
  );
};

export default Header;
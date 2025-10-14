// src/components/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// 1. Importa el componente de icono
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// 2. Importa cada ícono que vas a usar
import { 
  faTachometerAlt, 
  faUsers, 
  faBuilding, 
  faBoxes, 
  faTruck, 
  faChartBar, 
  faCog, 
  faQuestionCircle,
  faDatabase,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ onLogout, isSidebarOpen }) => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>SICOENA</h3>
      </div>
      <ul className="sidebar-modules">
        <li className='module-title'>MÓDULOS PRINCIPALES</li>
        
        {/* 3. Usa el componente FontAwesomeIcon */}
        <li><NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faTachometerAlt} className="sidebar-icon" /> Dashboard
        </NavLink></li>
        
        <li><NavLink to="/usuarios" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faUsers} className="sidebar-icon" /> Gestión de Usuarios
        </NavLink></li>

        <li><NavLink to="/instituciones" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faBuilding} className="sidebar-icon" /> Gestión de Instituciones
        </NavLink></li>

        <li><NavLink to="/inventario" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faBoxes} className="sidebar-icon" /> Gestión de Inventarios
        </NavLink></li>
        
        <li><NavLink to="/ordenes" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faTruck} className="sidebar-icon" /> Gestión de Órdenes
        </NavLink></li>
        
        <li><NavLink to="/reportes" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faChartBar} className="sidebar-icon" /> Reportes y Análisis
        </NavLink></li>
        
        <li><NavLink to="/configuracion" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faCog} className="sidebar-icon" /> Configuración
        </NavLink></li>

        <li><NavLink to="/ayuda" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faQuestionCircle} className="sidebar-icon" /> Ayuda
        </NavLink></li>
        
        <li className='module-title'>HERRAMIENTAS</li>
        
        <li><NavLink to="/respaldos" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faDatabase} className="sidebar-icon" /> Respaldos
        </NavLink></li>

        <li><NavLink to="/logs" className={({isActive}) => isActive ? 'active' : ''}>
          <FontAwesomeIcon icon={faFileAlt} className="sidebar-icon" /> Logs del Sistema
        </NavLink></li>
        <li>
          <button onClick={onLogout} className="logout-button">
            <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" /> Cerrar Sesión
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
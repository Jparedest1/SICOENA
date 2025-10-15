import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

const Sidebar = ({ onLogout }) => {
  return (
    <nav className="sidebar">
      <ul className="sidebar-modules">            
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
      </ul>
    </nav>
  );
};

export default Sidebar;
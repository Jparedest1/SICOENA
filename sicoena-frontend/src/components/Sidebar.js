import React from 'react'; 
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

const Sidebar = ({ userRole }) => {
  
  const modules = {
    
    ADMINISTRADOR: [
      { path: '/dashboard', icon: faTachometerAlt, label: 'Dashboard' },
      { path: '/usuario', icon: faUsers, label: 'Gestión de Usuarios' },
      { path: '/institucion', icon: faBuilding, label: 'Gestión de Instituciones' },
      { path: '/inventario', icon: faBoxes, label: 'Gestión de Inventarios' },
      { path: '/ordenes', icon: faTruck, label: 'Gestión de Entregas' },
      { path: '/reportes', icon: faChartBar, label: 'Reportes y Análisis' },
      { path: '/configuracion', icon: faCog, label: 'Configuración' },
      { path: '/ayuda', icon: faQuestionCircle, label: 'Ayuda' },
      { type: 'section', label: 'HERRAMIENTAS' },
      { path: '/respaldos', icon: faDatabase, label: 'Respaldos' },
      { path: '/logs', icon: faFileAlt, label: 'Logs del Sistema' }
    ],
    
    USUARIO: [
      { path: '/dashboard', icon: faTachometerAlt, label: 'Dashboard' },
      
      { path: '/ordenes', icon: faTruck, label: 'Gestión de Entregas' },
      { path: '/reportes', icon: faChartBar, label: 'Reportes y Análisis' },
      { path: '/ayuda', icon: faQuestionCircle, label: 'Ayuda' }
    ],
  };
  
  const userModules = modules[userRole] || modules['USUARIO'];

  return (
    <nav className="sidebar">
      <ul className="sidebar-modules">
        {userModules.map((item, index) => {
          if (item.type === 'section') {
            return (
              <li key={index} className='module-title'>
                {item.label}
              </li>
            );
          }

          return (
            <li key={index}>
              <NavLink 
                to={item.path} 
                className={({isActive}) => isActive ? 'active' : ''}
                title={item.label}
              >
                <FontAwesomeIcon icon={item.icon} className="sidebar-icon" />
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
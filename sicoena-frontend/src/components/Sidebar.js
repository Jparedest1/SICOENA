import React, { useState, useEffect } from 'react';
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

// Versión más completa con más roles

const Sidebar = ({ onLogout }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        const normalizedRole = (user.rol || 'USUARIO').toUpperCase().trim();
        setUserRole(normalizedRole);
        console.log('👤 Sidebar - Rol del usuario:', normalizedRole);
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }, []);

  // ✅ Definir módulos disponibles por rol
  const modules = {
    // 🔴 ADMINISTRADOR - Acceso total
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
    // 🟢 USUARIO - Acceso limitado
    USUARIO: [
      { path: '/dashboard', icon: faTachometerAlt, label: 'Dashboard' },
      { path: '/reportes', icon: faChartBar, label: 'Reportes y Análisis' },
      { path: '/ayuda', icon: faQuestionCircle, label: 'Ayuda' }
    ],
    // 🟡 Puedes agregar más roles aquí
    // GESTOR: [ ... ],
    // SUPERVISOR: [ ... ]
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
// Archivo: src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react'; // Importa useState y useEffect
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import './DashboardPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, faBuilding, faBox, faFileAlt, faDatabase, 
  faExclamationTriangle, faUsers, faUserCheck, faUserTimes, faChartBar, faBell // Changed faLink to faUserCheck, faUserTimes
} from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:5000/api'; // Asegúrate que esta sea tu URL base

// --- Componentes ActionCard y StatCard (sin cambios) ---
const ActionCard = ({ title, icon }) => (
    <div className="action-card">
      <FontAwesomeIcon icon={icon} className="action-icon" />
      <span>{title}</span>
    </div>
);
const StatCard = ({ title, value, detail, icon, iconBgColor, iconColor }) => (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ backgroundColor: iconBgColor }}>
        <FontAwesomeIcon icon={icon} className="stat-icon" style={{ color: iconColor }} />
      </div>
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        {/* Muestra '...' mientras carga */}
        <span className="stat-value">{value === null ? '...' : value}</span> 
        {detail && <span className="stat-detail">{detail}</span>}
      </div>
    </div>
);

// --- Componente Principal de la Página ---
const DashboardPage = () => {
  // --- ESTADOS para guardar los datos, carga y errores ---
const [stats, setStats] = useState({
    usuariosActivos: null,
    usuariosInactivos: null,
    reportesGenerados: null,
    alertasSistema: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Para redirigir si el token falla

  // --- useEffect para llamar a la API al montar ---
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      if (!token) {
        navigate('/login'); // Redirige si no hay token
        return;
      }

      try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem('authToken');
          throw new Error('Sesión inválida o expirada.');
        }
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar las estadísticas.`);
        }

        const data = await response.json();
        setStats(data); // Guarda los datos recibidos en el estado

      } catch (err) {
        setError(err.message);
        if (err.message.includes('Sesión inválida')) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [navigate]); // El efecto se ejecuta una vez al montar

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard de Control</h2>
        <span className="breadcrumb">Inicio &gt; Dashboard</span>
      </div>

      {/* --- Muestra error si existe --- */}
      {error && <div className="page-error-message">{error}</div>}

      {/* --- Sección de Acciones Rápidas (sin cambios en la lógica) --- */}
      <div className="quick-actions-grid">
        <Link to="/usuario" className="action-link"> {/* Corregido a /usuario */}
          <ActionCard title="Nuevo Usuario" icon={faUserPlus} />
        </Link>
        <Link to="/instituciones" className="action-link">
          <ActionCard title="Nueva Institución" icon={faBuilding} />
        </Link>
        <Link to="/inventario" className="action-link">
          <ActionCard title="Nuevo Producto" icon={faBox} />
        </Link>
        <Link to="/reportes" className="action-link">
          <ActionCard title="Generar Reporte" icon={faFileAlt} />
        </Link>
        <Link to="/respaldos" className="action-link">
          <ActionCard title="Crear Respaldo" icon={faDatabase} />
        </Link>
        <Link to="/alertas" className="action-link"> {/* Asegúrate de tener esta ruta si es necesaria */}
          <ActionCard title="Ver Alertas" icon={faExclamationTriangle} />
        </Link>
      </div>

      {/* --- Sección de Estadísticas ACTUALIZADA --- */}
      <div className="stats-grid">
        <StatCard 
          title="Usuarios Activos" // Nuevo título
          value={stats.usuariosActivos} // Nuevo dato
          icon={faUserCheck} // Nuevo icono
          iconBgColor="#e6f8f0" // Verde claro
          iconColor="#2ab57d" // Verde
        />
        <StatCard 
          title="Usuarios Inactivos" // Nuevo título
          value={stats.usuariosInactivos} // Nuevo dato
          icon={faUserTimes} // Nuevo icono
          iconBgColor="#f8f9fa" // Gris claro
          iconColor="#868e96" // Gris
        />
        <StatCard 
          title="Reportes Generados"
          value={stats.reportesGenerados} // Mantiene dato (aún simulado)
          icon={faChartBar}
          iconBgColor="#fdf0e7"
          iconColor="#f19a62"
        />
        <StatCard 
          title="Alertas del Sistema"
          value={stats.alertasSistema} // Ahora dinámico (si tienes tabla producto)
          icon={faBell}
          iconBgColor="#feefef"
          iconColor="#e65353"
        />
      </div>
    </div>
  );
};

export default DashboardPage;
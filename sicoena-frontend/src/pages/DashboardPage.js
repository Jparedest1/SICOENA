import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import './DashboardPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, faBuilding, faBox, faFileAlt, faTruck,
  faExclamationTriangle, faUserCheck, faUserTimes, faChartBar, faBell 
} from '@fortawesome/free-solid-svg-icons';

const API_URL = process.env.REACT_APP_API_URL || '/api';

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
        <span className="stat-value">{value === null ? '...' : value}</span> 
        {detail && <span className="stat-detail">{detail}</span>}
      </div>
    </div>
);

const DashboardPage = () => {
  
const [stats, setStats] = useState({
    usuariosActivos: null,
    usuariosInactivos: null,
    reportesGenerados: null,
    alertasSistema: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      const token = sessionStorage.getItem('authToken');

      if (!token) {
        navigate('/login'); 
        return;
      }

      try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401) {
          sessionStorage.removeItem('authToken');
          throw new Error('Sesión inválida o expirada.');
        }
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar las estadísticas.`);
        }

        const data = await response.json();
        setStats(data); 

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
  }, [navigate]); 

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard de Control</h2>
        <span className="breadcrumb">Inicio &gt; Dashboard</span>
      </div>

      {error && <div className="page-error-message">{error}</div>}

      <div className="quick-actions-grid">
        <Link to="/usuario" className="action-link">
          <ActionCard title="Usuarios" icon={faUserPlus} />
        </Link>
        <Link to="/institucion" className="action-link">
          <ActionCard title="Instituciones" icon={faBuilding} />
        </Link>
        <Link to="/inventario" className="action-link">
          <ActionCard title="Inventario" icon={faBox} />
        </Link>
        <Link to="/ordenes" className="action-link">
          <ActionCard title="Entregas" icon={faTruck} />
        </Link>
        <Link to="/reportes" className="action-link">
          <ActionCard title="Generar Reporte" icon={faFileAlt} />
        </Link>
        <Link to="/inventario" className="action-link">
          <ActionCard title="Ver Alertas" icon={faExclamationTriangle} />
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Usuarios Activos" 
          value={stats.usuariosActivos} 
          icon={faUserCheck} 
          iconBgColor="#e6f8f0" 
          iconColor="#2ab57d" 
        />
        <StatCard 
          title="Usuarios Inactivos" 
          value={stats.usuariosInactivos} 
          icon={faUserTimes} 
          iconBgColor="#f8f9fa" 
          iconColor="#868e96" 
        />
        <StatCard 
          title="Reportes Generados"
          value={stats.reportesGenerados} 
          icon={faChartBar}
          iconBgColor="#fdf0e7"
          iconColor="#f19a62"
        />
        <StatCard 
          title="Alertas del Sistema"
          value={stats.alertasSistema} 
          icon={faBell}
          iconBgColor="#feefef"
          iconColor="#e65353"
        />
      </div>
    </div>
  );
};

export default DashboardPage;
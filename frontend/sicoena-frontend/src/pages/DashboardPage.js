import React from 'react';
import './DashboardPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faBuilding, 
  faBox, 
  faFileAlt, 
  faDatabase, 
  faExclamationTriangle, 
  faUsers, 
  faLink, // Usado para Sesiones Activas
  faChartBar, 
  faBell 
} from '@fortawesome/free-solid-svg-icons';

// --- Tarjeta de Acción Rápida (Componente local) ---
const ActionCard = ({ title, icon }) => {
  return (
    <div className="action-card">
      <FontAwesomeIcon icon={icon} className="action-icon" />
      <span>{title}</span>
    </div>
  );
};

// --- Tarjeta de Estadística (Componente local) ---
const StatCard = ({ title, value, detail, icon, iconBgColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {detail && <span className="stat-detail">{detail}</span>}
      </div>
      <div className="stat-icon-wrapper" style={{ backgroundColor: iconBgColor }}>
        <FontAwesomeIcon icon={icon} className="stat-icon" />
      </div>
    </div>
  );
};

// --- Componente Principal de la Página ---
const DashboardPage = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard de Control</h2>
        <span className="breadcrumb">Inicio &gt; Dashboard</span>
      </div>

      {/* --- Sección de Acciones Rápidas --- */}
      <div className="quick-actions-grid">
        <ActionCard title="Nuevo Usuario" icon={faUserPlus} />
        <ActionCard title="Nueva Institución" icon={faBuilding} />
        <ActionCard title="Nuevo Producto" icon={faBox} />
        <ActionCard title="Generar Reporte" icon={faFileAlt} />
        <ActionCard title="Crear Respaldo" icon={faDatabase} />
        <ActionCard title="Ver Alertas" icon={faExclamationTriangle} />
      </div>

      {/* --- Sección de Estadísticas --- */}
      <div className="stats-grid">
        <StatCard 
          title="Usuarios Registrados"
          value="7"
          detail="+1% este mes"
          icon={faUsers}
          iconBgColor="#e7eafc" // Azul claro
        />
        <StatCard 
          title="Sesiones Activas"
          value="3"
          detail="Usuarios conectados"
          icon={faLink}
          iconBgColor="#e6fcf0" // Verde claro
        />
        <StatCard 
          title="Reportes Generados"
          value="25"
          detail="Este mes"
          icon={faChartBar}
          iconBgColor="#fdeee7" // Naranja claro
        />
        <StatCard 
          title="Alertas del Sistema"
          value="7"
          detail="Pendientes"
          icon={faBell}
          iconBgColor="#fef8e7" // Amarillo claro
        />
      </div>
    </div>
  );
};

export default DashboardPage;
// Archivo: src/pages/DashboardPage.js

import React from 'react';
import { Link } from 'react-router-dom'; // <-- 1. IMPORTA Link
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
  faLink,
  faChartBar, 
  faBell 
} from '@fortawesome/free-solid-svg-icons';

// --- Tarjeta de Acción Rápida (sin cambios) ---
const ActionCard = ({ title, icon }) => {
  return (
    <div className="action-card">
      <FontAwesomeIcon icon={icon} className="action-icon" />
      <span>{title}</span>
    </div>
  );
};

// --- Tarjeta de Estadística (sin cambios) ---
const StatCard = ({ title, value, detail, icon, iconBgColor, iconColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ backgroundColor: iconBgColor }}>
        <FontAwesomeIcon icon={icon} className="stat-icon" style={{ color: iconColor }} />
      </div>
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {detail && <span className="stat-detail">{detail}</span>}
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
        {/* 2. ENVUELVE CADA TARJETA CON UN COMPONENTE Link */}
        <Link to="/usuarios" className="action-link">
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
        <Link to="/alertas" className="action-link">
          <ActionCard title="Ver Alertas" icon={faExclamationTriangle} />
        </Link>
      </div>

      {/* --- Sección de Estadísticas --- */}
      <div className="stats-grid">
        {/* (Esta sección no necesita cambios) */}
        <StatCard 
          title="Usuarios Registrados"
          value="7"
          detail="+1% este mes"
          icon={faUsers}
          iconBgColor="#e6e8fa"
          iconColor="#4d5de2"
        />
        <StatCard 
          title="Sesiones Activas"
          value="3"
          detail="Usuarios conectados"
          icon={faLink}
          iconBgColor="#e6f8f0"
          iconColor="#2ab57d"
        />
        <StatCard 
          title="Reportes Generados"
          value="25"
          icon={faChartBar}
          iconBgColor="#fdf0e7"
          iconColor="#f19a62"
        />
        <StatCard 
          title="Alertas del Sistema"
          value="7"
          icon={faBell}
          iconBgColor="#feefef"
          iconColor="#e65353"
        />
      </div>
    </div>
  );
};

export default DashboardPage;
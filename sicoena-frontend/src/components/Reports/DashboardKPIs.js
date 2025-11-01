// src/components/Reports/DashboardKPIs.js

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faCheckCircle,
  faClock,
  faCoins,
  faUsers,
  faBox,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './DashboardKPIs.css';

const DashboardKPIs = ({ orders }) => {
  // Cálculos
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.estado === 'ENTREGADO').length;
  const pendingOrders = orders.filter(o => o.estado === 'PENDIENTE').length;
  const inProcessOrders = orders.filter(o => o.estado === 'EN PROCESO').length;

  const totalValue = orders.reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0);
  const totalStudents = orders.reduce((sum, o) => sum + (parseInt(o.cantidad_alumnos) || 0), 0);

  // Escuelas únicas
  const uniqueSchools = new Set(orders.map(o => o.id_escuela)).size;

  // Promedio de valor por orden
  const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

  // Tasa de completitud
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Alertas
  const hasAlert = pendingOrders > 0 || inProcessOrders > 0;

  const KPICard = ({ icon, title, value, subtitle, color, trend }) => (
    <div className={`kpi-card ${color}`}>
      <div className="kpi-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="kpi-content">
        <h3>{title}</h3>
        <div className="kpi-value">{value}</div>
        {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
        {trend && <span className="kpi-trend">{trend}</span>}
      </div>
    </div>
  );

  return (
    <div className="kpis-container">
      <div className="kpis-grid">
        {/* Total Órdenes */}
        <KPICard
          icon={faShoppingCart}
          title="Total de Órdenes"
          value={totalOrders}
          color="primary"
        />

        {/* Órdenes Completadas */}
        <KPICard
          icon={faCheckCircle}
          title="Completadas"
          value={completedOrders}
          subtitle={`${completionRate.toFixed(1)}% completadas`}
          color="success"
        />

        {/* Órdenes Pendientes */}
        <KPICard
          icon={faClock}
          title="Pendientes/En Proceso"
          value={pendingOrders + inProcessOrders}
          color={hasAlert ? 'warning' : 'info'}
        />

        {/* Valor Total */}
        <KPICard
          icon={faCoins}
          title="Valor Total Invertido"
          value={`Q${totalValue.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`}
          subtitle={`Promedio: Q${averageOrderValue.toLocaleString('es-GT', { minimumFractionDigits: 2 })} por orden`}
          color="primary"
        />

        {/* Estudiantes Atendidos */}
        <KPICard
          icon={faUsers}
          title="Estudiantes Atendidos"
          value={totalStudents}
          color="info"
        />

        {/* Escuelas */}
        <KPICard
          icon={faBox}
          title="Escuelas Atendidas"
          value={uniqueSchools}
          color="secondary"
        />
      </div>

      {/* Sección de Alertas */}
      {hasAlert && (
        <div className="alerts-section">
          <h3>
            <FontAwesomeIcon icon={faExclamationTriangle} /> Alertas
          </h3>
          <div className="alerts-grid">
            {pendingOrders > 0 && (
              <div className="alert-card alert-warning">
                <span className="alert-icon">⏳</span>
                <div className="alert-content">
                  <h4>Órdenes Pendientes</h4>
                  <p>{pendingOrders} orden{pendingOrders !== 1 ? 'es' : ''} esperando procesarse</p>
                </div>
              </div>
            )}
            {inProcessOrders > 0 && (
              <div className="alert-card alert-info">
                <span className="alert-icon">🔄</span>
                <div className="alert-content">
                  <h4>En Proceso</h4>
                  <p>{inProcessOrders} orden{inProcessOrders !== 1 ? 'es' : ''} en entrega</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardKPIs;
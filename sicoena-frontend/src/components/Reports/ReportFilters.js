// src/components/Reports/ReportFilters.js

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes } from '@fortawesome/free-solid-svg-icons';
import './ReportFilters.css';

const ReportFilters = ({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  filterEscuela,
  setFilterEscuela,
  filterEstado,
  setFilterEstado,
  filterMenu,
  setFilterMenu,
  escuelas,
  menus
}) => {
  const handleClearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    setDateFrom(firstDay);
    setDateTo(today);
    setFilterEscuela('todas');
    setFilterEstado('todos');
    setFilterMenu('todos');
  };

  return (
    <div className="filters-section">
      <div className="filters-header">
        <h2><FontAwesomeIcon icon={faFilter} /> Filtros de Reporte</h2>
        <button className="btn-clear-filters" onClick={handleClearFilters}>
          <FontAwesomeIcon icon={faTimes} /> Limpiar Filtros
        </button>
      </div>

      <div className="filters-grid">
        {/* Rango de fechas */}
        <div className="filter-group">
          <label>Desde:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Hasta:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Escuela */}
        <div className="filter-group">
          <label>Escuela:</label>
          <select value={filterEscuela} onChange={(e) => setFilterEscuela(e.target.value)}>
            <option value="todas">Todas las Escuelas</option>
            {escuelas.map(escuela => (
              <option key={escuela.id_escuela} value={escuela.id_escuela}>
                {escuela.nombre_escuela}
              </option>
            ))}
          </select>
        </div>

        {/* Menú */}
        <div className="filter-group">
          <label>Menú:</label>
          <select value={filterMenu} onChange={(e) => setFilterMenu(e.target.value)}>
            <option value="todos">Todos los Menús</option>
            {menus.map(menu => (
              <option key={menu.id_menu} value={menu.id_menu}>
                {menu.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div className="filter-group">
          <label>Estado:</label>
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
            <option value="todos">Todos los Estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN PROCESO">En Proceso</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
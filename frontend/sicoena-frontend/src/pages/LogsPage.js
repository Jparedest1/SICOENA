// src/pages/LogsPage.js

import React, { useState, useEffect } from 'react';
import './LogsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFilter, faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';

// Datos de ejemplo simulando logs del sistema
const mockLogs = [
  { timestamp: '2025-10-15 16:30:05.123', level: 'INFO', message: "Inicio de sesión exitoso para el usuario 'admin@sistema.com'", context: { user: 'admin@sistema.com', ip: '192.168.1.10' } },
  { timestamp: '2025-10-15 16:28:10.456', level: 'INFO', message: "Respaldo manual 'BKP-20251015-1628' completado exitosamente.", context: { user: 'admin@sistema.com' } },
  { timestamp: '2025-10-15 16:25:01.789', level: 'WARN', message: "Intento de acceso no autorizado a la página de configuración.", context: { user: 'usuario@sistema.com', ip: '200.5.8.1' } },
  { timestamp: '2025-10-15 16:20:45.912', level: 'ERROR', message: "Fallo al procesar la orden 'ORD-2025-004': stock insuficiente para el producto 'PRD-004'.", context: { orderId: 'ORD-2025-004', productId: 'PRD-004' } },
  { timestamp: '2025-10-15 16:15:22.345', level: 'INFO', message: "Usuario 'supervisor@sistema.com' creó un nuevo producto 'PRD-005'.", context: { user: 'supervisor@sistema.com', productId: 'PRD-005' } },
  { timestamp: '2025-10-15 16:10:11.678', level: 'DEBUG', message: "Payload recibido para la actualización de institución.", context: { institutionId: 'INST-002', data: '{...}' } },
];

const LogsPage = () => {
  const [logs, setLogs] = useState(mockLogs);
  const [filteredLogs, setFilteredLogs] = useState(mockLogs);
  
  // Estados para los filtros
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('Hoy');
  const [searchTerm, setSearchTerm] = useState('');

  // Simula el filtrado de logs cuando cambian los filtros
  useEffect(() => {
    let tempLogs = logs.filter(log => {
      const matchesLevel = levelFilter === 'Todos' || log.level === levelFilter;
      const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            JSON.stringify(log.context).toLowerCase().includes(searchTerm.toLowerCase());
      // Lógica de fecha (simplificada para el ejemplo)
      const matchesDate = dateFilter === 'Hoy' ? new Date(log.timestamp).getDate() === new Date().getDate() : true;
      return matchesLevel && matchesSearch && matchesDate;
    });
    setFilteredLogs(tempLogs);
  }, [levelFilter, dateFilter, searchTerm, logs]);

  return (
    <div className="page-container logs-page">
      <div className="page-header">
        <h1><FontAwesomeIcon icon={faFileAlt} /> Logs del Sistema</h1>
        <span className="breadcrumb">Inicio &gt; Herramientas &gt; Logs del Sistema</span>
      </div>

      <div className="card-container">
        <h3><FontAwesomeIcon icon={faFilter} /> Filtrar Registros</h3>
        <div className="log-filters-bar">
          <div className="search-group">
            <FontAwesomeIcon icon={faSearch} />
            <input 
              type="text" 
              placeholder="Buscar por mensaje, usuario, IP, ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option>Todos los niveles</option>
            <option>INFO</option>
            <option>WARN</option>
            <option>ERROR</option>
            <option>DEBUG</option>
          </select>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option>Hoy</option>
            <option>Últimas 24 horas</option>
            <option>Últimos 7 días</option>
          </select>
          <button className="btn-secondary">
            <FontAwesomeIcon icon={faDownload} /> Exportar
          </button>
        </div>
      </div>
      
      <div className="card-container">
        <div className="log-table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Nivel</th>
                <th>Mensaje</th>
                <th>Contexto (Datos)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                <tr key={index} className={`log-level-${log.level.toLowerCase()}`}>
                  <td className="log-timestamp">{log.timestamp}</td>
                  <td>
                    <span className={`log-level-badge level-${log.level.toLowerCase()}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="log-message">{log.message}</td>
                  <td className="log-context">
                    <pre>{JSON.stringify(log.context, null, 2)}</pre>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="4" className="no-results">No se encontraron registros que coincidan con los filtros aplicados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
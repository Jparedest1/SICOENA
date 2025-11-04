import React, { useState, useEffect, useCallback } from 'react';
import './LogsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFilter, faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';

const fetchLogsFromAPI = () => {
  console.log("Fetching logs from REAL API...");
  
  const token = sessionStorage.getItem('authToken'); 
  
  if (!token) {     
    return Promise.reject(new Error("No se encontró el token de autenticación. Por favor, inicie sesión."));
  }
  
  return fetch('/api/logs', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (response.status === 401) {
      throw new Error(`Error 401: No autorizado. Verifique sus permisos de administrador.`);
    }
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron cargar los logs.`);
    }
    return response.json();
  });
};

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('Hoy');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    setLoading(true);
    fetchLogsFromAPI()
      .then(data => {
        setLogs(data);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching logs:", err);
        setError(err.message);
        setLogs([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  const filterLogs = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    let tempLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      
      const matchesLevel = levelFilter === 'Todos' || log.level === levelFilter;
      
      const matchesSearch = searchTerm === '' || 
                            log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            JSON.stringify(log.context).toLowerCase().includes(searchTerm.toLowerCase());
      let matchesDate = false;
      switch (dateFilter) {
        case 'Hoy':
          matchesDate = logDate >= today;
          break;
        case 'Últimas 24 horas':
          matchesDate = logDate >= twentyFourHoursAgo;
          break;
        case 'Últimos 7 días':
          matchesDate = logDate >= sevenDaysAgo;
          break;
        default:
          matchesDate = true;
      }

      return matchesLevel && matchesSearch && matchesDate;
    });
    setFilteredLogs(tempLogs);
  }, [levelFilter, dateFilter, searchTerm, logs]);

  useEffect(() => {
    filterLogs();
  }, [filterLogs]);
  
  const handleExport = () => {
    const headers = ["Timestamp", "Nivel", "Mensaje", "Contexto"];
    const csvRows = [
      headers.join(','),
      ...filteredLogs.map(log => {
        const timestamp = `"${log.timestamp}"`;
        const level = `"${log.level}"`;
        const message = `"${log.message.replace(/"/g, '""')}"`;
        const context = `"${JSON.stringify(log.context).replace(/"/g, '""')}"`;
        return [timestamp, level, message, context].join(',');
      })
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
            <option value="Todos">Todos los niveles</option>
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
          <button className="btn-secondary" onClick={handleExport} disabled={filteredLogs.length === 0}>
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
              {loading ? (
                <tr><td colSpan="4" className="status-message">Cargando logs...</td></tr>
              ) : error ? (
                <tr><td colSpan="4" className="status-message error">{error}</td></tr>
              ) : filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                <tr key={index} className={`log-level-${log.level.toLowerCase()}`}>
                  <td className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</td>
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
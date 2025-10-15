// src/pages/ReportsPage.js

import React, { useState } from 'react';
import './ReportsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileCsv, faEye, faDownload, faTrash, faEdit, faPen } from '@fortawesome/free-solid-svg-icons';

// Mock Data
const initialRecentReports = [
  { id: 1, name: 'Usuarios Activos - Enero 2024', type: 'Usuarios', generatedBy: 'admin@sistema.com', date: '2024-01-12 10:30:15', size: '2.4 MB', status: 'COMPLETADO' },
  { id: 2, name: 'Actividad Semanal del Sistema', type: 'Actividad', generatedBy: 'supervisor@sistema.com', date: '2024-01-11 16:45:32', size: '1.8 MB', status: 'COMPLETADO' },
];

const initialScheduledReports = [
    { id: 1, name: 'Reporte Semanal de Usuarios', schedule: 'Se ejecuta todos los lunes a las 8:00 AM', nextRun: 'Lunes 15 Ene 2024, 8:00 AM' }
];

const ReportsPage = () => {
  // State for the form
  const [reportType, setReportType] = useState('');
  const [period, setPeriod] = useState('Hoy');
  const [format, setFormat] = useState('PDF');
  
  // State for the lists
  const [recentReports, setRecentReports] = useState(initialRecentReports);
  const [scheduledReports, setScheduledReports] = useState(initialScheduledReports);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (!reportType) {
      alert('Por favor, seleccione un tipo de reporte.');
      return;
    }

    // Simulate report generation
    const newReport = {
      id: recentReports.length + 1,
      name: `${reportType} - ${period} (${new Date().toLocaleDateString()})`,
      type: reportType,
      generatedBy: 'admin@sistema.com', // Assuming the current user
      date: new Date().toLocaleString('sv-SE'), // Format 'YYYY-MM-DD HH:MM:SS'
      size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      status: 'COMPLETADO'
    };
    
    setRecentReports([newReport, ...recentReports]);
    alert(`Reporte "${newReport.name}" generado exitosamente.`);
  };

  const handleDeleteRecent = (reportId) => {
    if(window.confirm('¿Está seguro de que desea eliminar este reporte?')) {
        setRecentReports(recentReports.filter(report => report.id !== reportId));
    }
  };

  const handleDeleteScheduled = (reportId) => {
    if(window.confirm('¿Está seguro de que desea eliminar este reporte programado?')) {
        setScheduledReports(scheduledReports.filter(report => report.id !== reportId));
    }
  };


  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reportes y Análisis</h1>
        <span className="breadcrumb">Inicio &gt; Reportes y Análisis</span>
      </div>

      {/* --- Generar Reporte Rápido --- */}
      <div className="card-container">
        <h3>Generar Reporte Rápido</h3>
        <form className="report-form" onSubmit={handleGenerateReport}>
          <div className="form-group">
            <label htmlFor="reportType">Tipo de Reporte</label>
            <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} required>
              <option value="" disabled>Seleccionar tipo de reporte</option>
              <option value="Usuarios">Reporte de Usuarios</option>
              <option value="Inventario">Reporte de Inventario</option>
              <option value="Entregas">Reporte de Entregas</option>
              <option value="Actividad">Reporte de Actividad</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="period">Período</label>
            <select id="period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>Hoy</option>
              <option>Ayer</option>
              <option>Últimos 7 días</option>
              <option>Este mes</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="format">Formato</label>
            <select id="format" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>PDF</option>
              <option>Excel (XLSX)</option>
              <option>CSV</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Generar Reporte</button>
        </form>
      </div>

      {/* --- Reportes Recientes --- */}
      <div className="card-container">
        <h3>Reportes Recientes</h3>
        <div className="reports-table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nombre del Reporte</th>
                        <th>Tipo</th>
                        <th>Generado Por</th>
                        <th>Fecha de Generación</th>
                        <th>Tamaño</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {recentReports.map(report => (
                        <tr key={report.id}>
                            <td>{report.name}</td>
                            <td>{report.type}</td>
                            <td>{report.generatedBy}</td>
                            <td>{report.date}</td>
                            <td>{report.size}</td>
                            <td>
                                <span className="status-badge completado">{report.status}</span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn icon-view" title="Ver"><FontAwesomeIcon icon={faEye} /></button>
                                    <button className="action-btn icon-download" title="Descargar"><FontAwesomeIcon icon={faDownload} /></button>
                                    <button className="action-btn icon-delete" title="Eliminar" onClick={() => handleDeleteRecent(report.id)}><FontAwesomeIcon icon={faTrash} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- Reportes Programados --- */}
      <div className="card-container">
        <h3>Reportes Programados</h3>
        {scheduledReports.map(report => (
            <div key={report.id} className="scheduled-report-item">
                <div className="scheduled-report-info">
                    <strong>{report.name}</strong>
                    <span>{report.schedule}</span>
                    <small>Próxima ejecución: {report.nextRun}</small>
                </div>
                <div className="action-buttons">
                    <button className="action-btn icon-edit" title="Editar"><FontAwesomeIcon icon={faPen} /></button>
                    <button className="action-btn icon-delete" title="Eliminar" onClick={() => handleDeleteScheduled(report.id)}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
            </div>
        ))}
      </div>

    </div>
  );
};

export default ReportsPage;
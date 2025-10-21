// src/pages/RespaldosPage.js

import React, { useState } from 'react';
import './BackupsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faSave, faSync, faDownload, faTrash, faHistory, faPlayCircle, faClock } from '@fortawesome/free-solid-svg-icons';

// Datos de ejemplo
const initialBackups = [
  { id: 'BKP-20251014-2359', date: '2025-10-14 23:59:59', type: 'Automático', status: 'COMPLETADO', size: '15.2 MB', initiatedBy: 'Sistema' },
  { id: 'BKP-20251014-0930', date: '2025-10-14 09:30:15', type: 'Manual', status: 'COMPLETADO', size: '15.1 MB', initiatedBy: 'admin@sistema.com' },
  { id: 'BKP-20251013-2359', date: '2025-10-13 23:59:59', type: 'Automático', status: 'FALLIDO', size: 'N/A', initiatedBy: 'Sistema' },
];

const RespaldosPage = () => {
  const [backups, setBackups] = useState(initialBackups);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('Diario');

  const handleCreateBackup = () => {
    if (window.confirm('¿Está seguro de que desea iniciar un respaldo manual en este momento?')) {
      setIsBackupInProgress(true);
      // Simula una operación de respaldo que dura 3 segundos
      setTimeout(() => {
        const now = new Date();
        const newBackup = {
          id: `BKP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${now.toTimeString().slice(0, 5).replace(':', '')}`,
          date: now.toLocaleString('sv-SE'),
          type: 'Manual',
          status: 'COMPLETADO',
          size: `${(15 + Math.random()).toFixed(1)} MB`,
          initiatedBy: 'admin@sistema.com'
        };
        setBackups([newBackup, ...backups]);
        setIsBackupInProgress(false);
        alert('Respaldo manual completado exitosamente.');
      }, 3000);
    }
  };

  const handleRestore = (backupId) => {
    const confirmation = prompt(`ACCIÓN PELIGROSA: Esta acción restaurará la base de datos al estado del respaldo ${backupId} y sobrescribirá todos los datos actuales.\n\nPara confirmar, escriba "RESTAURAR":`);
    if (confirmation === 'RESTAURAR') {
      alert(`Restauración desde ${backupId} iniciada. El sistema se reiniciará (simulación).`);
      // Aquí iría la lógica real de restauración
    } else {
      alert('Restauración cancelada.');
    }
  };

  const handleDelete = (backupId) => {
    if (window.confirm(`¿Está seguro de que desea eliminar permanentemente el respaldo ${backupId}? Esta acción no se puede deshacer.`)) {
      setBackups(backups.filter(b => b.id !== backupId));
    }
  };
  
  const handleSaveSettings = () => {
      alert('Configuración de respaldos automáticos guardada.');
  };

  return (
    <div className="page-container respaldos-page">
      <div className="page-header">
        <h1><FontAwesomeIcon icon={faDatabase} /> Administración de Respaldos</h1>
        <span className="breadcrumb">Inicio &gt; Herramientas &gt; Respaldos</span>
      </div>

      <div className="respaldos-layout">
        {/* --- Columna de Acciones --- */}
        <div className="card-container">
          <h3>Acciones Inmediatas</h3>
          <p>Crea un punto de restauración manual en cualquier momento.</p>
          <button className="btn-primary btn-full" onClick={handleCreateBackup} disabled={isBackupInProgress}>
            <FontAwesomeIcon icon={faPlayCircle} /> {isBackupInProgress ? 'Generando Respaldo...' : 'Crear Respaldo Ahora'}
          </button>
          {isBackupInProgress && <div className="backup-status">Proceso en curso, por favor no cierre esta ventana...</div>}
        </div>

        {/* --- Columna de Configuración --- */}
        <div className="card-container">
          <h3><FontAwesomeIcon icon={faClock} /> Respaldos Automáticos</h3>
          <p>Configura la creación automática de respaldos para garantizar la seguridad de los datos.</p>
          <div className="form-group checkbox-group">
            <input type="checkbox" id="enableBackups" checked={autoBackupEnabled} onChange={(e) => setAutoBackupEnabled(e.target.checked)} />
            <label htmlFor="enableBackups">Habilitar respaldos automáticos</label>
          </div>
          <div className="form-group">
            <label>Frecuencia</label>
            <select value={backupFrequency} onChange={(e) => setBackupFrequency(e.target.value)} disabled={!autoBackupEnabled}>
              <option>Diario (a las 23:59)</option>
              <option>Semanal (Domingo a las 23:59)</option>
            </select>
          </div>
           <button className="btn-save-section" onClick={handleSaveSettings}>
            <FontAwesomeIcon icon={faSave} /> Guardar Configuración
          </button>
        </div>
      </div>

      {/* --- Historial de Respaldos --- */}
      <div className="card-container">
        <h3><FontAwesomeIcon icon={faHistory} /> Historial de Respaldos</h3>
        <div className="reports-table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID del Respaldo</th>
                        <th>Fecha y Hora</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Tamaño</th>
                        <th>Iniciado Por</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {backups.map(backup => (
                        <tr key={backup.id}>
                            <td className="backup-id">{backup.id}</td>
                            <td>{backup.date}</td>
                            <td>{backup.type}</td>
                            <td>
                                <span className={`status-badge ${backup.status.toLowerCase()}`}>{backup.status}</span>
                            </td>
                            <td>{backup.size}</td>
                            <td>{backup.initiatedBy}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn icon-restore" title="Restaurar" onClick={() => handleRestore(backup.id)}>
                                        <FontAwesomeIcon icon={faSync} />
                                    </button>
                                    <button className="action-btn icon-download" title="Descargar">
                                        <FontAwesomeIcon icon={faDownload} />
                                    </button>
                                    <button className="action-btn icon-delete" title="Eliminar" onClick={() => handleDelete(backup.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default RespaldosPage;
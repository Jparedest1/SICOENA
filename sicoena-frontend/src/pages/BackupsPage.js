import React, { useState, useEffect, useCallback } from 'react';
import './BackupsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faSave, faSync, faDownload, faTrash, faHistory, faPlayCircle, faClock, faSpinner } from '@fortawesome/free-solid-svg-icons';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const POLLING_INTERVAL = 5000;
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const RespaldosPage = () => {
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('Diario');

  const fetchBackups = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/respaldos`, { headers: getAuthHeaders() });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar el historial.');
      }
      const data = await response.json();
      setBackups(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const isBackupInProgress = backups.some(b => b.status === 'EN PROGRESO');

    if (isBackupInProgress) {
      const intervalId = setInterval(() => {
        console.log('Polling: Verificando estado de respaldos...');
        fetchBackups();
      }, POLLING_INTERVAL);
      
      return () => clearInterval(intervalId);
    }
  }, [backups, fetchBackups]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/settings/respaldos`, { headers: getAuthHeaders() });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar la configuración.');
      }
      const settings = await response.json();
      setAutoBackupEnabled(settings.autoBackupEnabled);
      setBackupFrequency(settings.backupFrequency);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
    fetchSettings();
  }, [fetchBackups, fetchSettings]);

  const handleCreateBackup = async () => {
    if (window.confirm('¿Está seguro de que desea iniciar un respaldo manual?')) {
      setIsActionInProgress(true);
      try {
        const response = await fetch(`${API_URL}/respaldos`, { 
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || 'Error al iniciar el respaldo.');
        }
        alert('Respaldo manual iniciado. El estado se actualizará automáticamente.');
        
        await fetchBackups();
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setIsActionInProgress(false);
      }
    }
  };
  
  const handleRestore = async (backupId) => {
    const confirmation = prompt(`ACCIÓN PELIGROSA: Para restaurar desde ${backupId}, escriba "RESTAURAR":`);
    if (confirmation === 'RESTAURAR') {
      try {
        const response = await fetch(`${API_URL}/respaldos/${backupId}/restore`, { 
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falló el inicio de la restauración.');
        }
        alert(`Restauración desde ${backupId} iniciada.`);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    } else {
      alert('Restauración cancelada.');
    }
  };

  const handleDelete = async (backupId) => {
    if (window.confirm(`¿Seguro que desea eliminar el respaldo ${backupId}?`)) {
      try {
        const response = await fetch(`${API_URL}/respaldos/${backupId}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'No se pudo eliminar el respaldo.');
        }
        setBackups(backups.filter(b => b.id !== backupId));
        alert(`Respaldo ${backupId} eliminado.`);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    }
  };
  
  const handleDownload = (backupId) => {
      const token = sessionStorage.getItem('authToken');
      if (token) {
        fetch(`${API_URL}/respaldos/${backupId}/download`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
          if (!res.ok) throw new Error('Respuesta de red no fue satisfactoria.');
          return res.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `${backupId}.sql`; 
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch(() => alert('No se pudo descargar el archivo.'));
      }
  };

  const handleSaveSettings = async () => {
      try {
          const response = await fetch(`${API_URL}/settings/respaldos`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ autoBackupEnabled, backupFrequency })
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'No se pudo guardar la configuración.');
          }
          alert('Configuración guardada.');
      } catch (error) {
          console.error(error);
          alert(error.message);
      }
  };
  
  return (
    <div className="page-container respaldos-page">
      <div className="page-header">
        <h1><FontAwesomeIcon icon={faDatabase} /> Administración de Respaldos</h1>
        <span className="breadcrumb">Inicio &gt; Herramientas &gt; Respaldos</span>
      </div>

      <div className="respaldos-layout">
        <div className="card-container">
          <h3>Acciones Inmediatas</h3>
          <p>Crea un punto de restauración manual en cualquier momento.</p>
          <button className="btn-primary btn-full" onClick={handleCreateBackup} disabled={isActionInProgress}>
            <FontAwesomeIcon icon={isActionInProgress ? faSpinner : faPlayCircle} spin={isActionInProgress} /> {isActionInProgress ? 'Generando Respaldo...' : 'Crear Respaldo Ahora'}
          </button>
          {isActionInProgress && <div className="backup-status">Proceso en curso, por favor no cierre esta ventana...</div>}
        </div>

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
              <option value="Diario">Diario (a las 23:59)</option>
              <option value="Semanal">Semanal (Domingo a las 23:59)</option>
            </select>
          </div>
           <button className="btn-save-section" onClick={handleSaveSettings}>
            <FontAwesomeIcon icon={faSave} /> Guardar Configuración
          </button>
        </div>
      </div>

      <div className="card-container">
        <h3><FontAwesomeIcon icon={faHistory} /> Historial de Respaldos</h3>
        <div className="reports-table-container">
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <FontAwesomeIcon icon={faSpinner} spin size="3x" />
                    <p>Cargando historial...</p>
                </div>
            ) : (
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
                        {backups.length > 0 ? backups.map(backup => (
                            <tr key={backup.id}>
                                <td className="backup-id">{backup.id}</td>
                                <td>{new Date(backup.date).toLocaleString('sv-SE')}</td>
                                <td>{backup.type}</td>
                                <td>
                                    <span className={`status-badge ${backup.status.toLowerCase()}`}>{backup.status}</span>
                                </td>
                                <td>{backup.size}</td>
                                <td>{backup.initiatedBy}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="action-btn icon-restore" title="Restaurar" onClick={() => handleRestore(backup.id)} disabled={backup.status !== 'COMPLETADO'}>
                                            <FontAwesomeIcon icon={faSync} />
                                        </button>
                                        <button className="action-btn icon-download" title="Descargar" onClick={() => handleDownload(backup.id)} disabled={backup.status !== 'COMPLETADO'}>
                                            <FontAwesomeIcon icon={faDownload} />
                                        </button>
                                        <button className="action-btn icon-delete" title="Eliminar" onClick={() => handleDelete(backup.id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>No hay respaldos registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default RespaldosPage;
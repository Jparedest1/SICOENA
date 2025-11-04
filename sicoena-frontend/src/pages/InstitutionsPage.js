import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './InstitutionsPage.css'; 
import AddInstitutionModal from '../components/AddInstitutionModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faBuilding, faSearch } from '@fortawesome/free-solid-svg-icons';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const InstitutionsPage = () => {
  const [institutions, setInstitutions] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInstitutionToEdit, setCurrentInstitutionToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [locationFilter, setLocationFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('ACTIVA'); 

  const fetchInstitutions = useCallback(async (
    currentSearchTerm = '',
    currentTypeFilter = 'todos',
    currentLocationFilter = 'todos',
    currentStatusFilter = 'ACTIVA' 
  ) => {
    setIsLoading(true);
    setError(null);
    const token = sessionStorage.getItem('authToken');

    if (!token) {
        setError('No autorizado. Por favor, inicie sesión.');
        setIsLoading(false);
        navigate('/login');
        return;
    }

    let url = `${API_URL}/institucion?`;
    const params = [];
    if (currentSearchTerm) {
      params.push(`search=${encodeURIComponent(currentSearchTerm)}`);
    }
    if (currentTypeFilter !== 'todos') {
      params.push(`tipo=${encodeURIComponent(currentTypeFilter)}`); 
    }
    if (currentLocationFilter !== 'todos') {
      params.push(`ubicacion=${encodeURIComponent(currentLocationFilter)}`); 
    }
    if (currentStatusFilter !== 'todos') {
        params.push(`estado=${encodeURIComponent(currentStatusFilter)}`); 
    }
    url += params.join('&');

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) { 
        sessionStorage.removeItem('authToken');
        throw new Error('Sesión inválida o expirada.');
      }
      if (!response.ok) { 
        throw new Error(`Error al cargar las instituciones (${response.status})`);
      }

      const data = await response.json();
      const mappedData = data.map(inst => ({
          id: inst.id_escuela, 
          codigo: inst.codigo_escuela, 
          nombre: inst.nombre_escuela, 
          direccion: inst.direccion,
          municipio: inst.municipio,
          departamento: inst.departamento,
          telefono: inst.telefono,
          correo: inst.correo,
          director: inst.director,
          estudiantes: inst.cant_estudiantes,
          observaciones: inst.observaciones,
          estado: inst.estado,
      }));
      setInstitutions(mappedData);

    } catch (err) {
      setError(err.message);
      if (err.message.includes('Sesión inválida')) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchInstitutions(searchTerm, typeFilter, locationFilter, statusFilter);
  }, [fetchInstitutions]); 

  const handleSearch = () => {
    fetchInstitutions(searchTerm, typeFilter, locationFilter, statusFilter);
  };

  const handleEdit = (institution) => {
    setCurrentInstitutionToEdit(institution);
    setIsModalOpen(true);
  };

  const handleDelete = async (institutionId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado de esta institución a INACTIVA?')) {
      const token = sessionStorage.getItem('authToken');
      setError(null);
      try {
        const response = await fetch(`${API_URL}/institucion/${institutionId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'INACTIVO' }), 
        });
        if (!response.ok) throw new Error('Error al desactivar la institución.');

        fetchInstitutions(searchTerm, typeFilter, locationFilter, statusFilter); 
        alert('Institución desactivada con éxito.');

      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddNewInstitution = () => {
    setCurrentInstitutionToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveInstitution = async (institutionDataFromModal) => {
    const token = sessionStorage.getItem('authToken');
    setError(null);
    
    const payload = {
        nombre_escuela: institutionDataFromModal.nombre,
        codigo_escuela: institutionDataFromModal.codigo,
        telefono: institutionDataFromModal.telefono,
        correo: institutionDataFromModal.email, 
        direccion: institutionDataFromModal.direccion,
        departamento: institutionDataFromModal.departamento,
        municipio: institutionDataFromModal.municipio,
        cant_estudiantes: institutionDataFromModal.estudiantes,
        director: institutionDataFromModal.director,
        observaciones: institutionDataFromModal.observaciones,
        estado: institutionDataFromModal.estado.toUpperCase(), 
    };

    const url = currentInstitutionToEdit
                ? `${API_URL}/institucion/${currentInstitutionToEdit.id}` 
                : `${API_URL}/institucion`; 
    const method = currentInstitutionToEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let data;
      try { data = await response.json(); } 
      catch (e) { throw new Error(`Error ${response.status}: ${response.statusText}`); }
      
      if (!response.ok) throw new Error(data.message || `Error al ${currentInstitutionToEdit ? 'actualizar' : 'crear'} la institución.`);
      
      fetchInstitutions(searchTerm, typeFilter, locationFilter, statusFilter);
      setIsModalOpen(false);
      alert(`Institución ${currentInstitutionToEdit ? 'actualizada' : 'creada'} con éxito.`);

    } catch (err) {
      setError(err.message);
    }
  };

  const totalInstitutions = institutions.length; 
  const activeInstitutions = institutions.filter(inst => inst.estado === 'ACTIVA').length;
  const inactiveInstitutions = institutions.filter(inst => inst.estado === 'INACTIVA').length; 

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Instituciones</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleAddNewInstitution}>Nueva Institución</button>
        </div>
      </div>

      {error && <div className="page-error-message">{error}</div>}

      <div className="filters-bar">
        <input 
          type="text" 
          placeholder="Buscar por nombre, código..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          />

        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="todos">Todas las ubicaciones</option>
            <option value="Sumpango">Sumpango</option>
            <option value="Antigua Guatemala">Antigua Guatemala</option>
        </select>
         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ACTIVA">Activas</option>
            <option value="INACTIVA">Inactivas</option>
            <option value="todos">Todas</option>
        </select>
        <button className="btn-primary" onClick={handleSearch}><FontAwesomeIcon icon={faSearch} /> Aplicar Filtro</button>
        <button className="btn-tertiary" onClick={() => {
            setSearchTerm(''); setTypeFilter('todos'); setLocationFilter('todos'); setStatusFilter('ACTIVA');
            fetchInstitutions('', 'todos', 'todos', 'ACTIVA'); 
        }}>Limpiar</button>
      </div>

      <div className="stats-cards-container">
        <div className="stat-card-item">
          <span className="stat-value">{isLoading ? '...' : totalInstitutions}</span> 
          <span className="stat-label">Total Instituciones</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{isLoading ? '...' : activeInstitutions}</span>
          <span className="stat-label">Activas</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{isLoading ? '...' : inactiveInstitutions}</span> 
          <span className="stat-label">Inactivas</span> 
        </div>
      </div>

      <div className="table-container">
         <div className="table-header">
            <span>Lista de Instituciones</span>
        </div>
        {isLoading ? ( <p>Cargando instituciones...</p> ) : (
          <table>
            <thead>
              <tr>
                <th>Codigo Institucion</th> 
                <th>Nombre Institución</th>
                <th>Encargado</th>
                <th>Dirección</th> 
                <th>Teléfono</th> 
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <tr key={inst.id}>
                  <td>{inst.codigo}</td>
                  <td>{inst.nombre}</td>
                  <td>{inst.director}</td>
                  <td>{inst.direccion}</td>
                  <td>{inst.telefono}</td>
                  <td>
                    <span className={`status-badge ${inst.estado.toLowerCase().replace(' ', '-')}`}>
                      {inst.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(inst)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {inst.estado === 'ACTIVA' && (
                        <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(inst.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
               {institutions.length === 0 && !isLoading && (
                  <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                          No se encontraron instituciones con los filtros aplicados.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {isModalOpen && (
        <AddInstitutionModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveInstitution}
          currentInstitution={currentInstitutionToEdit} 
        />
      )}
    </div>
  );
};

export default InstitutionsPage;
// src/pages/InstitutionsPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './InstitutionsPage.css'; // Asegúrate de tener los estilos
import AddInstitutionModal from '../components/AddInstitutionModal'; // Modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faBuilding, faSearch } from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:5000/api'; // URL de tu backend

const InstitutionsPage = () => {
  const [institutions, setInstitutions] = useState([]); // Inicia vacío
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInstitutionToEdit, setCurrentInstitutionToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- ESTADOS PARA FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [locationFilter, setLocationFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('ACTIVA'); // Filtro de estado

  // --- FUNCIÓN PARA OBTENER INSTITUCIONES DEL BACKEND ---
  const fetchInstitutions = useCallback(async (
    currentSearchTerm = '',
    currentTypeFilter = 'todos',
    currentLocationFilter = 'todos',
    currentStatusFilter = 'ACTIVA' // Añadido filtro de estado
  ) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
        setError('No autorizado. Por favor, inicie sesión.');
        setIsLoading(false);
        navigate('/login');
        return;
    }

    // Construye la URL con query parameters
    // Asume que tu endpoint de backend es /api/escuela
    let url = `${API_URL}/institucion?`;
    const params = [];
    if (currentSearchTerm) {
      params.push(`search=${encodeURIComponent(currentSearchTerm)}`);
    }
    if (currentTypeFilter !== 'todos') {
      params.push(`tipo=${encodeURIComponent(currentTypeFilter)}`); // 'tipo' según tu tabla
    }
    if (currentLocationFilter !== 'todos') {
      params.push(`ubicacion=${encodeURIComponent(currentLocationFilter)}`); // 'direccion' o 'municipio'? Ajusta según backend
    }
    if (currentStatusFilter !== 'todos') {
        params.push(`estado=${encodeURIComponent(currentStatusFilter)}`); // Añadido
    }
    url += params.join('&');

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) { /* ... (manejo de token inválido) ... */
        localStorage.removeItem('authToken');
        throw new Error('Sesión inválida o expirada.');
      }
      if (!response.ok) { /* ... (manejo de otros errores de fetch) ... */
        throw new Error(`Error al cargar las instituciones (${response.status})`);
      }

      const data = await response.json();
      // Mapea los nombres de columna del backend a los esperados por el frontend si son diferentes
      // Ejemplo: si el backend devuelve id_escuela, nombre_escuela
      const mappedData = data.map(inst => ({
          id: inst.id_escuela, // Mapea id_escuela a id
          codigo: inst.codigo_escuela, // Mapea codigo_escuela a codigo
          nombre: inst.nombre_escuela, // Mapea nombre_escuela a nombre
          direccion: inst.direccion,
          municipio: inst.municipio,
          departamento: inst.departamento,
          telefono: inst.telefono,
          correo: inst.correo,
          director: inst.director,
          estudiantes: inst.cant_estudiantes,
          observaciones: inst.observaciones,
          estado: inst.estado,
          
          // Añade otros campos necesarios para la tabla o el modal de edición
          
          
          // ...otros campos...
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

  // Carga inicial (filtrando por activos)
  useEffect(() => {
    fetchInstitutions(searchTerm, typeFilter, locationFilter, statusFilter);
  }, [fetchInstitutions]); // fetchInstitutions es estable

  // --- FUNCIÓN PARA BUSCAR/FILTRAR ---
  const handleSearch = () => {
    fetchInstitutions(searchTerm, typeFilter, locationFilter, statusFilter);
  };

  const handleEdit = (institution) => {
    // Pasa la institución mapeada al modal
    setCurrentInstitutionToEdit(institution);
    setIsModalOpen(true);
  };

  // --- FUNCIÓN PARA CAMBIAR ESTADO A INACTIVO ---
  const handleDelete = async (institutionId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado de esta institución a INACTIVA?')) {
      const token = localStorage.getItem('authToken');
      setError(null);
      try {
        // Asume un endpoint PUT /api/escuela/:id/status
        const response = await fetch(`${API_URL}/institucion/${institutionId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'INACTIVO' }), // Envía INACTIVO
        });
        if (!response.ok) throw new Error('Error al desactivar la institución.');

        fetchInstitutions(searchTerm, typeFilter, locationFilter, statusFilter); // Recarga la lista
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

  // --- FUNCIÓN PARA GUARDAR (CREAR/EDITAR) ---
  const handleSaveInstitution = async (institutionDataFromModal) => {
    const token = localStorage.getItem('authToken');
    setError(null);
    
    // Mapea los nombres del modal a los esperados por el backend (según tu tabla escuela)
    const payload = {
        nombre_escuela: institutionDataFromModal.nombre,
        codigo_escuela: institutionDataFromModal.codigo,
        telefono: institutionDataFromModal.telefono,
        correo: institutionDataFromModal.email, // Asume que el modal usa 'email' para 'correo'
        direccion: institutionDataFromModal.direccion,
        departamento: institutionDataFromModal.departamento,
        municipio: institutionDataFromModal.municipio,
        cant_estudiantes: institutionDataFromModal.estudiantes,
        director: institutionDataFromModal.director,
        observaciones: institutionDataFromModal.observaciones,
        estado: institutionDataFromModal.estado.toUpperCase(), // Asegura mayúsculas
    };

    const url = currentInstitutionToEdit
                ? `${API_URL}/institucion/${currentInstitutionToEdit.id}` // PUT para editar
                : `${API_URL}/institucion`; // POST para crear
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
      
      fetchInstitutions(searchTerm, typeFilter, locationFilter, statusFilter); // Recarga
      setIsModalOpen(false);
      alert(`Institución ${currentInstitutionToEdit ? 'actualizada' : 'creada'} con éxito.`);

    } catch (err) {
      setError(err.message);
    }
  };

  // --- Cálculos Estadísticas --- (Ajustados)
  // Nota: Estos cálculos ahora dependen de los datos *después* del mapeo
  const totalInstitutions = institutions.length; // Podrías obtener el total real del backend si hay paginación
  const activeInstitutions = institutions.filter(inst => inst.estado === 'ACTIVA').length;
  const inactiveInstitutions = institutions.filter(inst => inst.estado === 'INACTIVA').length; // Cambiado

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Instituciones</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleAddNewInstitution}>Nueva Institución</button>
        </div>
      </div>

      {error && <div className="page-error-message">{error}</div>}

      {/* --- Filtros --- */}
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
            {/* Añade más ubicaciones */}
        </select>
         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ACTIVA">Activas</option>
            <option value="INACTIVA">Inactivas</option>
            <option value="todos">Todas</option>
        </select>
        <button className="btn-primary" onClick={handleSearch}><FontAwesomeIcon icon={faSearch} /> Aplicar Filtro</button>
        <button className="btn-tertiary" onClick={() => {
            setSearchTerm(''); setTypeFilter('todos'); setLocationFilter('todos'); setStatusFilter('ACTIVA');
            fetchInstitutions('', 'todos', 'todos', 'ACTIVA'); // Limpia y recarga activos
        }}>Limpiar</button>
      </div>

      {/* --- Estadísticas --- */}
      <div className="stats-cards-container">
        <div className="stat-card-item">
          <span className="stat-value">{isLoading ? '...' : totalInstitutions}</span> {/* Muestra total (puede ser de la página actual si hay paginación) */}
          <span className="stat-label">Total Instituciones</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{isLoading ? '...' : activeInstitutions}</span>
          <span className="stat-label">Activas</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{isLoading ? '...' : inactiveInstitutions}</span> 
          <span className="stat-label">Inactivas</span> {/* Cambiado */}
        </div>
      </div>

      {/* --- Tabla --- */}
      <div className="table-container">
         <div className="table-header">
            <span>Lista de Instituciones</span>
        </div>
        {isLoading ? ( <p>Cargando instituciones...</p> ) : (
          <table>
            <thead>
              <tr>
                <th>Codigo Institucion</th> {/* Ajustado a tabla */}
                <th>Nombre Institución</th>
                <th>Encargado</th>
                <th>Dirección</th> {/* Ajustado a tabla */}
                <th>Teléfono</th> {/* Ajustado a tabla */}
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
                    {/* Asegúrate que el CSS tenga clase 'inactiva' */}
                    <span className={`status-badge ${inst.estado.toLowerCase().replace(' ', '-')}`}>
                      {inst.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(inst)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {/* Mostrar desactivar solo si está ACTIVA */}
                      {inst.estado === 'ACTIVA' && (
                        <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(inst.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                      {/* Opcional: Botón para Reactivar */}
                      {/* {inst.estado === 'INACTIVA' && ( <button>Reactivar</button> )} */}
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
      
      {/* Modal (sin cambios en cómo se llama) */}
      {isModalOpen && (
        <AddInstitutionModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveInstitution}
          currentInstitution={currentInstitutionToEdit} // Pasa el objeto mapeado
        />
      )}
    </div>
  );
};

export default InstitutionsPage;
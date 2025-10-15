// src/pages/InstitutionsPage.js

import React, { useState } from 'react';
import './InstitutionsPage.css'; // Estilos específicos para esta página
import AddInstitutionModal from '../components/AddInstitutionModal'; // Modal para añadir/editar
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faBuilding } from '@fortawesome/free-solid-svg-icons';

// Datos de ejemplo basados en tu imagen
const mockInstitutions = [
  { id: 'INST-001', logo: null, nombre: 'Escuela No. 1', tipo: 'Escuela', codigo: 'J-123', nit: '20123456789', ubicacion: 'Sumpango, Sacatepéquez', empleados: 12, departamento: 'Sacatepéquez', municipio: 'Sumpango', fecha_registro: '2023-01-15', estado: 'ACTIVA', poblacion: 150, encargado: 'Director A' },
  { id: 'INST-002', logo: null, nombre: 'Escuela Oficial Bilingue', tipo: 'Escuela', codigo: 'J-456', nit: '20987654321', ubicacion: 'Sumpango, Sacatepéquez', empleados: 3, departamento: 'Sacatepéquez', municipio: 'Sumpango', fecha_registro: '2023-03-22', estado: 'ACTIVA', poblacion: 80, encargado: 'Directora B' },
  { id: 'INST-003', logo: null, nombre: 'Escuela El Castillo AEOUM', tipo: 'Escuela', codigo: 'J-789', nit: '20456789123', ubicacion: 'Santo Domingo Xenacoj, Sacatepéquez', empleados: 8, departamento: 'Sacatepéquez', municipio: 'Santo Domingo Xenacoj', fecha_registro: '2023-05-10', estado: 'EN REVISIÓN', poblacion: 120, encargado: 'Director C' },
];

const InstitutionsPage = () => {
  const [institutions, setInstitutions] = useState(mockInstitutions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInstitutionToEdit, setCurrentInstitutionToEdit] = useState(null);

  const handleEdit = (institution) => {
    setCurrentInstitutionToEdit(institution);
    setIsModalOpen(true);
  };

  const handleDelete = (institutionId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado de esta institución a INACTIVA?')) {
      setInstitutions(institutions.map(inst => 
        inst.id === institutionId ? { ...inst, estado: 'INACTIVA' } : inst
      ));
    }
  };

  const handleAddNewInstitution = () => {
    setCurrentInstitutionToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveInstitution = (institutionData) => {
    if (currentInstitutionToEdit) {
      setInstitutions(institutions.map(inst => 
        inst.id === currentInstitutionToEdit.id ? { ...inst, ...institutionData } : inst
      ));
    } else {
      const newInstitution = { 
        ...institutionData, 
        id: `INST-00${institutions.length + 1}`,
        fecha_registro: new Date().toISOString().slice(0, 10),
      };
      setInstitutions([...institutions, newInstitution]);
    }
    setIsModalOpen(false);
  };

  // Cálculos para las tarjetas de estadísticas
  const totalInstitutions = institutions.length;
  const activeInstitutions = institutions.filter(inst => inst.estado === 'ACTIVA').length;
  const inReviewInstitutions = institutions.filter(inst => inst.estado === 'EN REVISIÓN').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Instituciones</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleAddNewInstitution}>Nueva Institución</button>
          <button className="btn-secondary">Importar Datos</button>
        </div>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Buscar institución por nombre o código..." className="search-input" />
        <select><option>Todos los tipos</option></select>
        <select><option>Todas las ubicaciones</option></select>
        <button className="btn-primary">Aplicar Filtro</button>
        <button className="btn-tertiary">Limpiar</button>
      </div>

      <div className="stats-cards-container">
        <div className="stat-card-item">
          <span className="stat-value">{totalInstitutions}</span>
          <span className="stat-label">Total Instituciones</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{activeInstitutions}</span>
          <span className="stat-label">Activas</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{inReviewInstitutions}</span>
          <span className="stat-label">En Revisión</span>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
            <span>Lista de Instituciones</span>
            <div className="table-actions">
                <button className="btn-tertiary">Acciones en lote</button>
                <button className="btn-tertiary">Exportar</button>
            </div>
        </div>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Código</th>
              <th>Logo</th>
              <th>Nombre Institución</th>
              <th>Tipo</th>
              <th>NIT</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.id}>
                <td><input type="checkbox" /></td>
                <td>{inst.id}</td>
                <td>
                  <div className="logo-placeholder">
                    <FontAwesomeIcon icon={faBuilding} />
                  </div>
                </td>
                <td>{inst.nombre}</td>
                <td>{inst.tipo}</td>
                <td>{inst.nit}</td>
                <td>{inst.ubicacion}</td>
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
                    <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(inst.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
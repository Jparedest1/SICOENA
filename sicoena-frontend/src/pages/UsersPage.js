// src/pages/UsersPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersPage.css';
import AddUserModal from '../components/AddUserModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:5000/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('ACTIVO');

  // ✅ ACTUALIZADO: Ahora usa los valores actuales del estado
  const fetchUsers = useCallback(async (
    currentSearchTerm = '',
    currentRoleFilter = 'todos',
    currentStatusFilter = 'ACTIVO'
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

    let url = `${API_URL}/usuario?`;
    const params = [];
    
    if (currentSearchTerm) {
      params.push(`search=${encodeURIComponent(currentSearchTerm)}`);
    }
    if (currentRoleFilter !== 'todos') {
      params.push(`rol=${encodeURIComponent(currentRoleFilter)}`);
    }
    if (currentStatusFilter !== 'todos') {
      params.push(`estado=${encodeURIComponent(currentStatusFilter)}`);
    }
    
    url += params.join('&');

    console.log('📡 Fetching URL:', url);
    console.log('🔑 Token:', token.substring(0, 20) + '...');

    try {
      const response = await fetch(url, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });

      console.log('📊 Response status:', response.status);

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Sesión inválida o expirada. Por favor, inicie sesión de nuevo.');
      }
      if (!response.ok) {
        let errorData = { message: `Error al cargar los usuarios (${response.status})` };
        try {
          errorData = await response.json();
        } catch(e) { /* No hacer nada si no es JSON */ }
        throw new Error(errorData.message);
      }

      const data = await response.json();
      console.log('✅ Usuarios obtenidos:', data);
      setUsers(data);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      if (err.message.includes('Sesión inválida')) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ✅ ACTUALIZADO: Carga inicial con statusFilter del estado
  useEffect(() => {
    fetchUsers(searchTerm, roleFilter, statusFilter);
  }, [statusFilter, fetchUsers]); // Ahora incluye statusFilter como dependencia

  const handleSearch = () => {
    fetchUsers(searchTerm, roleFilter, statusFilter);
  };

  const handleEdit = (user) => {
    setCurrentUserToEdit(user);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (userId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado de este usuario a INACTIVO?')) {
      const token = localStorage.getItem('authToken');
      setError(null);
      try {
        const response = await fetch(`${API_URL}/usuario/${userId}/status`, {
          method: 'PUT', 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'INACTIVO' }),
        });
        if (!response.ok) throw new Error('Error al desactivar el usuario.');
        fetchUsers(searchTerm, roleFilter, statusFilter);
        alert('Usuario desactivado con éxito.');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddNewUser = () => {
    setCurrentUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userDataFromModal) => {
    const token = localStorage.getItem('authToken');
    setError(null);
    const url = currentUserToEdit 
                ? `${API_URL}/usuario/${currentUserToEdit.id}` 
                : `${API_URL}/usuario`;
    const method = currentUserToEdit ? 'PUT' : 'POST';
    
    const payload = {
      nombre: userDataFromModal.nombre,
      email: userDataFromModal.email,
      rol: userDataFromModal.rol,
      telefono: userDataFromModal.telefono,
      estado: userDataFromModal.estado
    };

    if (method === 'POST' && userDataFromModal.contrasena) {
      payload.contrasena = userDataFromModal.contrasena;
    }

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
      try {
        data = await response.json();
      } catch (jsonError){
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.message || `Error al ${currentUserToEdit ? 'actualizar' : 'crear'} el usuario.`);
      }
      
      fetchUsers(searchTerm, roleFilter, statusFilter);
      setIsModalOpen(false);
      alert(`Usuario ${currentUserToEdit ? 'actualizado' : 'creado'} con éxito.`);

    } catch (err) {
      console.error("Error en handleSaveUser:", err);
      setError(err.message);
    }
  };

  return (
    <div className="users-page-container">
      <div className="users-header">
        <h1>Gestión de Usuarios</h1>
        <button className="add-user-btn" onClick={handleAddNewUser}>Nuevo Usuario</button>
      </div>

      {error && <div className="page-error-message">{error}</div>}

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="todos">Todos los Roles</option>
          <option value="Administrador">Administrador</option>
          <option value="Usuario">Usuario</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
        <button className="search-btn" onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} /> Buscar
        </button>
      </div>

      <div className="users-table-container">
        {isLoading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NOMBRE</th>
                <th>EMAIL</th>
                <th>ROL</th>
                <th>ESTADO</th>
                <th>ÚLTIMA CONEXIÓN</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nombre}</td>
                  <td>{user.email}</td>
                  <td>{user.rol}</td>
                  <td>
                    <span className={`status-badge ${user.estado?.toLowerCase()}`}>
                      {user.estado}
                    </span>
                  </td>
                  <td>{user.ultima_conexion ? new Date(user.ultima_conexion).toLocaleString('sv-SE') : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(user)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {user.estado === 'ACTIVO' && (
                        <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(user.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <AddUserModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          currentUser={currentUserToEdit}
        />
      )}
    </div>
  );
};

export default UsersPage;
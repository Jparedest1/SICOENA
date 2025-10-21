// src/pages/UsersPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // To redirect if unauthorized
import './UsersPage.css';
import AddUserModal from '../components/AddUserModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:5000/api'; 

const UsersPage = () => {
  const [users, setUsers] = useState([]); // Start with empty array
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState(null);       // Error state
  const navigate = useNavigate();                   // Hook for redirection

  // Function to fetch users from the backend
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('No autorizado. Por favor, inicie sesión.');
      setIsLoading(false);
      navigate('/login'); // Redirect to login if no token
      return;
    }

    try {
      const response = await fetch(`${API_URL}/usuario`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token
        },
      });

      if (response.status === 401) { // Handle unauthorized specifically
        localStorage.removeItem('authToken'); // Remove invalid token
        throw new Error('Sesión inválida o expirada. Por favor, inicie sesión de nuevo.');
      }
      if (!response.ok) {
        throw new Error('Error al cargar los usuarios.');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Sesión inválida')) {
        navigate('/login'); // Redirect if token is invalid
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means run once on mount

  const handleEdit = (user) => {
    setCurrentUserToEdit(user);
    setIsModalOpen(true);
  };
  
  // Handles "soft delete" (changing status to INACTIVO) via API
  const handleDelete = async (userId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado de este usuario a INACTIVO?')) {
      const token = localStorage.getItem('authToken');
      setError(null);
      try {
        const response = await fetch(`${API_URL}/usuarios/${userId}/status`, { // Assuming an endpoint like this
          method: 'PUT', // Or PATCH
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'INACTIVO' }),
        });

        if (!response.ok) {
          throw new Error('Error al desactivar el usuario.');
        }

        // Update the user list locally or refetch
        setUsers(users.map(user => 
          user.id === userId ? { ...user, estado: 'INACTIVO' } : user
        ));
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

  // Handles both creating and updating users via API
  const handleSaveUser = async (userData) => {
    const token = localStorage.getItem('authToken');
    setError(null);
    const url = currentUserToEdit 
                ? `${API_URL}/usuarios/${currentUserToEdit.id}` // Update URL
                : `${API_URL}/usuarios`; // Create URL
    const method = currentUserToEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error al ${currentUserToEdit ? 'actualizar' : 'crear'} el usuario.`);
      }

      // Refresh the user list to show changes/new user
      fetchUsers(); 
      setIsModalOpen(false);
      alert(`Usuario ${currentUserToEdit ? 'actualizado' : 'creado'} con éxito.`);

    } catch (err) {
      setError(err.message);
      // Keep modal open if there was an error saving
    }
  };

  return (
    <div className="users-page-container">
      <div className="users-header">
        <h1>Gestión de Usuarios</h1>
        <button className="add-user-btn" onClick={handleAddNewUser}>
          Nuevo Usuario
        </button>
      </div>

      {/* --- Error Display --- */}
      {error && <div className="page-error-message">{error}</div>}

      <div className="filters-bar">
        {/* ... (Your filter inputs - consider adding state and onChange handlers for them) ... */}
         <input type="text" placeholder="Buscar usuario..." />
        <select>
          <option value="todos">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="usuario">Usuario</option>
        </select>
        <button className="search-btn">Buscar</button>
      </div>

      <div className="users-table-container">
        {isLoading ? (
          <p>Cargando usuarios...</p> 
        ) : (
          <table>
            <thead>
              {/* ... (table headers) ... */}
              <tr>
              <th>ID</th><th>NOMBRE</th><th>EMAIL</th><th>ROL</th><th>ESTADO</th><th>ÚLTIMA CONEXIÓN</th><th>ACCIONES</th>
            </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  {/* ... (table data cells for user info) ... */}
                  <td>{user.id}</td>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td>{user.rol}</td>
                <td>
                  <span className={`status-badge ${user.estado.toLowerCase()}`}>
                    {user.estado}
                  </span>
                </td>
                <td>{user.ultima_conexion ? new Date(user.ultima_conexion).toLocaleString('sv-SE') : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(user)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {/* Only show delete/deactivate if user is active */}
                      {user.estado === 'ACTIVO' && (
                        <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(user.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
// src/pages/UsersPage.js

import React, { useState, useEffect, useCallback } from 'react'; // Importa useCallback
import { useNavigate } from 'react-router-dom';
import './UsersPage.css';
import AddUserModal from '../components/AddUserModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons'; // Importa faSearch

const API_URL = 'http://localhost:5000/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- NUEVOS ESTADOS PARA FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('ACTIVO'); // <-- NUEVO ESTADO (por defecto muestra activos)

  // --- MODIFICACIÓN: fetchUsers ahora acepta parámetros ---
  // Usamos useCallback para memorizar la función y evitar re-renders innecesarios
const fetchUsers = useCallback(async (
    currentSearchTerm = '',
    currentRoleFilter = 'todos',
    currentStatusFilter = 'ACTIVO' // <-- NUEVO PARÁMETRO
  ) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    if (!token) { /* ... (manejo de token ausente) ... */
        setError('No autorizado. Por favor, inicie sesión.');
        setIsLoading(false);
        navigate('/login');
        return;
    }

    // Construye la URL con query parameters
let url = `${API_URL}/usuario?`;
    const params = [];
    if (currentSearchTerm) {
      params.push(`search=${encodeURIComponent(currentSearchTerm)}`);
    }
    if (currentRoleFilter !== 'todos') {
      params.push(`rol=${encodeURIComponent(currentRoleFilter)}`);
    }
    // --- AÑADE EL FILTRO DE ESTADO SI NO ES 'todos' ---
    if (currentStatusFilter !== 'todos') {
        params.push(`estado=${encodeURIComponent(currentStatusFilter)}`);
    }
    url += params.join('&');

    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        throw new Error('Sesión inválida o expirada. Por favor, inicie sesión de nuevo.');
      }
      if (!response.ok) {
        // Intenta obtener un mensaje de error del backend si es JSON
        let errorData = { message: `Error al cargar los usuarios (${response.status})` };
        try {
            errorData = await response.json();
        } catch(e) { /* No hacer nada si no es JSON */ }
        throw new Error(errorData.message);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Sesión inválida')) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // --- Carga inicial de usuarios ---
  useEffect(() => {
    fetchUsers(); // Llama a fetchUsers sin parámetros la primera vez
  }, [fetchUsers]); // fetchUsers ahora es una dependencia estable gracias a useCallback

  // --- NUEVA FUNCIÓN: Se activa al hacer clic en Buscar ---
  const handleSearch = () => {
    fetchUsers(searchTerm, roleFilter, statusFilter); // <-- Pasa el filtro de estado
  };

  // --- (handleEdit, handleDelete, handleAddNewUser, handleSaveUser sin cambios significativos) ---
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
        // Refresca la lista después de desactivar para reflejar el cambio si es necesario
        // O simplemente actualiza el estado localmente si prefieres
        fetchUsers(searchTerm, roleFilter); // Recarga con los filtros actuales
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

    const handleSaveUser = async (userDataFromModal) => { // Renombrado para claridad
    const token = localStorage.getItem('authToken');
    setError(null);
    const url = currentUserToEdit 
                ? `${API_URL}/usuario/${currentUserToEdit.id}` 
                : `${API_URL}/usuario`;
    const method = currentUserToEdit ? 'PUT' : 'POST';
    // --- CONSTRUCCIÓN DEL PAYLOAD PARA EL BACKEND ---
    const payload = {
        nombre: userDataFromModal.nombre, // El backend separa nombres/apellidos
        email: userDataFromModal.email,   // Tu backend actual usa 'email', mantenlo así por ahora
        // correo: userDataFromModal.email, // Si cambias el backend para esperar 'correo', usa esta línea
        rol: userDataFromModal.rol,
        telefono: userDataFromModal.telefono,
        estado: userDataFromModal.estado
        // Excluimos 'cui' porque no está en la tabla
    };

    // Solo añadimos la contraseña si estamos CREANDO (POST)
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
        body: JSON.stringify(payload), // Envía el payload adaptado
      });
      let data; 
      try {
          data = await response.json();
      } catch (jsonError){
          // Si la respuesta no es JSON (como un HTML de error 500), crea un objeto error
          throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      if (!response.ok) {
        // Usa el mensaje del backend si existe, si no, uno genérico
        throw new Error(data.message || `Error al ${currentUserToEdit ? 'actualizar' : 'crear'} el usuario.`);
      }
      
      fetchUsers(searchTerm, roleFilter); // Recarga la lista con filtros actuales
      setIsModalOpen(false);
      alert(`Usuario ${currentUserToEdit ? 'actualizado' : 'creado'} con éxito.`);

    } catch (err) {
      console.error("Error en handleSaveUser:", err); // Loguea el error completo
      setError(err.message); 
      // Mantenemos el modal abierto si hubo error
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
        {/* --- NUEVO SELECT PARA ESTADO --- */}
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            >
          {/* <option value="todos">Todos los Estados</option> */} {/* Opcional: si quieres mostrar todos */}
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
        <button className="search-btn" onClick={handleSearch}>
            <FontAwesomeIcon icon={faSearch} /> Buscar
        </button>
      </div>

      <div className="users-table-container">
        {isLoading ? ( <p>Cargando usuarios...</p> ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>NOMBRE</th><th>EMAIL</th><th>ROL</th><th>ESTADO</th><th>ÚLTIMA CONEXIÓN</th><th>ACCIONES</th>
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
                    <span className={`status-badge ${user.estado?.toLowerCase()}`}> {/* Añadí ? por seguridad */}
                      {user.estado}
                    </span>
                  </td>
                  <td>{user.ultima_conexion ? new Date(user.ultima_conexion).toLocaleString('sv-SE') : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(user)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      {/* El botón de eliminar/desactivar solo tiene sentido para usuarios activos */}
                      {user.estado === 'ACTIVO' && (
                        <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(user.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                      {/* Podrías añadir un botón para reactivar si estás viendo inactivos */}
                      {/* {user.estado === 'INACTIVO' && ( <button>Reactivar</button> )} */}
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
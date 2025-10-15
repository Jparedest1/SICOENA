// src/pages/UsersPage.js
import React, { useState } from 'react'; // <-- CORREGIDO AQUÍ
import './UsersPage.css';
import AddUserModal from '../components/AddUserModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const mockUsers = [
  { id: '001', nombre: 'Juan Pérez', email: 'juan@empresa.com', rol: 'Administrador', estado: 'ACTIVO', ultima_conexion: '2024-01-12 10:30' },
  { id: '002', nombre: 'María García', email: 'maria@empresa.com', rol: 'Usuario', estado: 'INACTIVO', ultima_conexion: '2024-01-10 15:45' },
];

const UsersPage = () => {
  // --- CORREGIDO AQUÍ (useState en lugar de in_stock) ---
  const [users, setUsers] = useState(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);

  const handleEdit = (user) => {
    setCurrentUserToEdit(user);
    setIsModalOpen(true);
  };
  
  const handleDelete = (userId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado de este usuario a INACTIVO?')) {
      setUsers(users.map(user => 
        user.id === userId ? { ...user, estado: 'INACTIVO' } : user
      ));
    }
  };

  const handleAddNewUser = () => {
    setCurrentUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData) => {
    if (currentUserToEdit) {
      setUsers(users.map(user => 
        user.id === currentUserToEdit.id ? { ...user, ...userData, ultima_conexion: currentUserToEdit.ultima_conexion } : user
      ));
    } else {
      const newUser = { 
        ...userData, 
        id: `00${users.length + 1}`,
        ultima_conexion: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  // ... (El resto del return JSX se queda igual)
  return (
    <div className="users-page-container">
      <div className="users-header">
        <h1>Gestión de Usuarios</h1>
        <button className="add-user-btn" onClick={handleAddNewUser}>
          Nuevo Usuario
        </button>
      </div>
      <div className="filters-bar">
        <input type="text" placeholder="Buscar usuario..." />
        <select>
          <option value="todos">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="usuario">Usuario</option>
        </select>
        <button className="search-btn">Buscar</button>
      </div>
      <div className="users-table-container">
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
                  <span className={`status-badge ${user.estado.toLowerCase()}`}>
                    {user.estado}
                  </span>
                </td>
                <td>{user.ultima_conexion}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(user)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(user.id)}>
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
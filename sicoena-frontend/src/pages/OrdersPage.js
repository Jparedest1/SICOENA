// src/pages/OrdersPage.js

import React, { useState, useEffect } from 'react';
import './OrdersPage.css';
import AddEditOrderModal from '../components/AddEditOrderModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';


const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrderToEdit, setCurrentOrderToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${apiUrl}/api/orden`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener órdenes');
      }

      const data = await response.json();
      setOrders(data || []);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('No se pudieron cargar las órdenes');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (order) => {
    setCurrentOrderToEdit(order);
    setIsModalOpen(true);
  };

  const handleDelete = (orderId) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta orden?')) {
      setOrders(orders.map(order => 
        order.id_orden === orderId ? { ...order, estado: 'CANCELADO' } : order
      ));
    }
  };

  const handleAddNewOrder = () => {
    setCurrentOrderToEdit(null);
    setIsModalOpen(true);
  };

    const handleSaveOrder = (orderData) => {
    // Recargar las órdenes después de guardar
    fetchOrders();
    setIsModalOpen(false);
  };

  // --- Statistics Calculations ---
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.estado === 'PENDIENTE').length;
  const deliveredOrders = orders.filter(o => o.estado === 'ENTREGADO').length;
  const inProcessOrders = orders.filter(o => o.estado === 'EN PROCESO').length;
  const totalValue = orders.reduce((sum, o) => sum + (o.valor_total || 0), 0);

  // ✅ FUNCIÓN AUXILIAR para obtener la clase CSS del estado (con validación)
  const getStatusClass = (estado) => {
    if (!estado) return 'pending'; // Valor por defecto
    return estado.toLowerCase().replace(' ', '-');
  };

  if (isLoading) {
    return (
      <div className="page-container orders-page">
        <div className="page-header">
          <h1>Gestión de Órdenes de Entrega</h1>
        </div>
        <p style={{ textAlign: 'center', padding: '40px' }}>Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Entregas/Ordenes</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleAddNewOrder}>
            <FontAwesomeIcon icon={faPlus} /> Nueva Orden
          </button>
          <button className="btn-secondary">Programar Entregas</button>
          <button className="btn-secondary">Exportar Ordenes</button>
        </div>
      </div>

      {/* --- Statistics Cards --- */}
      <div className="stats-cards-container">
        <div className="stat-card-item">
          <span className="stat-value">{totalOrders}</span>
          <span className="stat-label">Total Órdenes</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{pendingOrders}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{deliveredOrders}</span>
          <span className="stat-label">Entregadas</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{inProcessOrders}</span>
          <span className="stat-label">En Proceso</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">12</span> {/* Static for now */}
          <span className="stat-label">Escuelas Activas</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">Q{totalValue.toLocaleString('es-GT')}</span>
          <span className="stat-label">Valor Total Mes</span>
        </div>
      </div>

      {/* --- Filters Bar --- */}
      <div className="filters-bar">
        <input type="text" placeholder="Buscar orden por código, escuela o responsable..." className="search-input" />
        <select><option>Todas las escuelas</option></select>
        <select><option>Todos los estados</option></select>
        <select><option>Todas las fechas</option></select>
        <button className="btn-primary">Aplicar Filtro</button>
        <button className="btn-tertiary">Limpiar</button>
      </div>

      {/* --- Orders Table --- */}
      <div className="table-container">
        <div className="table-header">
            <span>Lista de Ordenes de Entrega</span>
        </div>
        <table>
  <thead>
    <tr>
      <th><input type="checkbox" /></th>
      <th>Código</th>
      <th>Escuela</th>
      <th>Menú</th>
      <th>Alumnos</th>
      <th>Duración</th>
      <th>Valor Total</th>
      <th>Estado</th>
      <th>F. Creación</th>
      <th>F. Entrega</th>
      <th>Acciones</th>
    </tr>
  </thead>
  <tbody>
    {orders.map((order) => (
      <tr key={order.id_orden}>
        <td><input type="checkbox" /></td>
        <td><strong>{order.codigo_orden || '-'}</strong></td>
        <td>{order.nombre_escuela || '-'}</td>
        <td>{order.nombre_menu || '-'}</td>
        <td>{order.cantidad_alumnos || '-'}</td>
        <td>{order.dias_duracion ? `${order.dias_duracion} días` : '-'}</td>
        <td>Q{(order.valor_total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
        <td>
          <span className={`status-badge ${getStatusClass(order.estado)}`}>
            {order.estado || 'SIN ESTADO'}
          </span>
        </td>
        <td>
          {order.fecha_creacion 
            ? new Date(order.fecha_creacion).toLocaleDateString('es-GT')
            : '-'
          }
        </td>
        <td>
          {order.fecha_entrega 
            ? new Date(order.fecha_entrega).toLocaleDateString('es-GT')
            : '-'
          }
        </td>
        <td>
          <div className="action-buttons">
            <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(order)}>
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button className="action-btn icon-delete" title="Cancelar Orden" onClick={() => handleDelete(order.id_orden)}>
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
        <AddEditOrderModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOrder}
          currentOrder={currentOrderToEdit}
        />
      )}
    </div>
  );
};

export default OrdersPage;
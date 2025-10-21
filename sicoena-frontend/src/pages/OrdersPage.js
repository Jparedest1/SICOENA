// src/pages/OrdersPage.js

import React, { useState } from 'react';
import './OrdersPage.css'; // We'll create this CSS file next
import AddEditOrderModal from '../components/AddEditOrderModal'; // The modal for this module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

// Mock data based on your screenshot
const mockOrders = [
  { id: 'ORD-2025-001', escuela: 'Escuela No. 1 Nivel Primario', menu: 'Menú Especial', alumnos: 280, duracion: '60 días', productos: 6, valor_total: 15680.00, estado: 'ENTREGADO', fecha_creacion: '2025-01-12', fecha_entrega: '2025-01-18', responsable: 'Juan Pérez' },
  { id: 'ORD-2025-002', escuela: 'Escuela Oficial Bilingue', menu: 'Menú Regular', alumnos: 150, duracion: '30 días', productos: 4, valor_total: 8200.50, estado: 'PENDIENTE', fecha_creacion: '2025-02-01', fecha_entrega: '2025-02-05', responsable: 'María García' },
  { id: 'ORD-2025-003', escuela: 'Escuela El Castillo AEOUM', menu: 'Menú Reforzado', alumnos: 320, duracion: '45 días', productos: 8, valor_total: 21500.00, estado: 'EN PROCESO', fecha_creacion: '2025-02-10', fecha_entrega: '2025-02-15', responsable: 'Juan Pérez' },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrderToEdit, setCurrentOrderToEdit] = useState(null);

  const handleEdit = (order) => {
    setCurrentOrderToEdit(order);
    setIsModalOpen(true);
  };

  const handleDelete = (orderId) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta orden?')) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, estado: 'CANCELADO' } : order
      ));
    }
  };

  const handleAddNewOrder = () => {
    setCurrentOrderToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveOrder = (orderData) => {
    if (currentOrderToEdit) {
      setOrders(orders.map(order => 
        order.id === currentOrderToEdit.id ? { ...order, ...orderData } : order
      ));
    } else {
      const newOrder = { 
        ...orderData, 
        id: `ORD-2025-00${orders.length + 1}`,
        fecha_creacion: new Date().toISOString().slice(0, 10),
      };
      setOrders([...orders, newOrder]);
    }
    setIsModalOpen(false);
  };

  // --- Statistics Calculations ---
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.estado === 'PENDIENTE').length;
  const deliveredOrders = orders.filter(o => o.estado === 'ENTREGADO').length;
  const inProcessOrders = orders.filter(o => o.estado === 'EN PROCESO').length;
  const totalValue = orders.reduce((sum, o) => sum + o.valor_total, 0);

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
            <div className="table-actions">
                <button className="btn-tertiary">Acciones en lote</button>
                <button className="btn-tertiary">Exportar Lista</button>
            </div>
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
              <th>Productos</th>
              <th>Valor Total</th>
              <th>Estado</th>
              <th>F. Creación</th>
              <th>F. Entrega</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td><input type="checkbox" /></td>
                <td>{order.id}</td>
                <td>{order.escuela}</td>
                <td>{order.menu}</td>
                <td>{order.alumnos}</td>
                <td>{order.duracion}</td>
                <td>{order.productos} productos</td>
                <td>Q{order.valor_total.toLocaleString('es-GT')}</td>
                <td>
                  <span className={`status-badge ${order.estado.toLowerCase().replace(' ', '-')}`}>
                    {order.estado}
                  </span>
                </td>
                <td>{order.fecha_creacion}</td>
                <td>{order.fecha_entrega}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(order)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="action-btn icon-delete" title="Cancelar Orden" onClick={() => handleDelete(order.id)}>
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
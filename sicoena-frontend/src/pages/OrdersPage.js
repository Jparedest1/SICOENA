import React, { useState, useEffect } from 'react';
import './OrdersPage.css';
import AddEditOrderModal from '../components/AddEditOrderModal';
import ViewOrderModal from '../components/ViewOrderModal';
import ChangeOrderStatusModal from '../components/ChangeOrderStatusModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faFilePdf, faEye, faExchangeAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrderToEdit, setCurrentOrderToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentOrderToView, setCurrentOrderToView] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentOrderToChangeStatus, setCurrentOrderToChangeStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEscuela, setFilterEscuela] = useState('todas');
  const [filterMenu, setFilterMenu] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [escuelas, setEscuelas] = useState([]);
  const [menus, setMenus] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    fetchOrders();
    fetchFiltersData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, filterEscuela, filterMenu, filterEstado]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('authToken');
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
      console.log('Órdenes cargadas:', data.length);
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
      setError('No se pudieron cargar las órdenes');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    setIsLoadingFilters(true);
    const token = sessionStorage.getItem('authToken');

    try {
      const escuelasResponse = await fetch(`${apiUrl}/api/institucion/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (escuelasResponse.ok) {
        const escuelasData = await escuelasResponse.json();
        setEscuelas(escuelasData.schools || []);
      }

      const menusResponse = await fetch(`${apiUrl}/api/producto/active-menus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (menusResponse.ok) {
        const menusData = await menusResponse.json();
        setMenus(menusData.menus || []);
      }
    } catch (err) {
      console.error('Error al cargar datos de filtros:', err);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.codigo_orden?.toLowerCase().includes(search) ||
        order.nombre_escuela?.toLowerCase().includes(search) ||
        order.nombre_menu?.toLowerCase().includes(search) ||
        order.nombre_responsable?.toLowerCase().includes(search)
      );
    }

    if (filterEscuela !== 'todas') {
      filtered = filtered.filter(order => order.id_escuela === parseInt(filterEscuela));
    }

    if (filterMenu !== 'todos') {
      filtered = filtered.filter(order => order.id_menu === parseInt(filterMenu));
    }

    if (filterEstado !== 'todos') {
      filtered = filtered.filter(order => order.estado === filterEstado);
    }

    setFilteredOrders(filtered);
    console.log(`Órdenes filtradas: ${filtered.length}/${orders.length}`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterEscuela('todas');
    setFilterMenu('todos');
    setFilterEstado('todos');
  };

  const handleViewOrder = (order) => {
    setCurrentOrderToView(order);
    setIsViewModalOpen(true);
  };

  const handleChangeStatus = (order) => {
    setCurrentOrderToChangeStatus(order);
    setIsStatusModalOpen(true);
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

  const handleSaveOrder = () => {
    fetchOrders();
    setIsModalOpen(false);
  };

  const handleStatusChanged = () => {
    fetchOrders();
  };

  const handleExportPDF = () => {
    if (filteredOrders.length === 0) {
      alert("No hay órdenes para exportar.");
      return;
    }

    const doc = new jsPDF();
    
    doc.text("Reporte de Órdenes de Entrega - SICOENA", 14, 16);
    
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-GT')}`, 14, 24);

    const head = [[
      'Código', 'Escuela', 'Menú', 'Alumnos', 'Días', 'Valor Total', 'Estado', 'F. Creación', 'F. Entrega'
    ]];

    const body = filteredOrders.map(order => [
      order.codigo_orden || '-',
      order.nombre_escuela || '-',
      order.nombre_menu || '-',
      order.cantidad_alumnos || '-',
      order.dias_duracion ? `${order.dias_duracion}` : '-',
      `Q${(order.valor_total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      order.estado || '-',
      order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString('es-GT') : '-',
      order.fecha_entrega ? new Date(order.fecha_entrega).toLocaleDateString('es-GT') : '-'
    ]);

    autoTable(doc, {
      startY: 30,
      head,
      body,
      theme: 'grid',
      headStyles: { 
        fillColor: [44, 62, 80],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        5: { halign: 'right' },
        0: { halign: 'center' }
      },
      margin: { top: 30 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Total de Órdenes: ${filteredOrders.length}`, 14, finalY);
    
    const totalValor = filteredOrders.reduce((sum, o) => {
      const valor = parseFloat(o.valor_total) || 0;
      return sum + valor;
    }, 0);
    doc.text(`Valor Total: Q${totalValor.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, finalY + 8);

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, 'ReporteOrdenes', 'width=1000,height=700,resizable=yes,scrollbars=yes');
  };

  const getStatusClass = (estado) => {
    if (!estado) return 'pendiente';
    return estado.toLowerCase().replace(' ', '-');
  };

  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.estado === 'PENDIENTE').length;
  const deliveredOrders = filteredOrders.filter(o => o.estado === 'ENTREGADO').length;
  const inProcessOrders = filteredOrders.filter(o => o.estado === 'EN PROCESO').length;
  const totalValue = filteredOrders.reduce((sum, o) => {
  const valor = parseFloat(o.valor_total) || 0;
  return sum + valor;
}, 0);

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
        <h1>Gestión de Entregas/Órdenes</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleAddNewOrder}>
            <FontAwesomeIcon icon={faPlus} /> Nueva Orden
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fee', borderRadius: '4px', color: '#c00' }}>
          ⚠️ {error}
        </div>
      )}

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
          <span className="stat-value">{inProcessOrders}</span>
          <span className="stat-label">En Proceso</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">{deliveredOrders}</span>
          <span className="stat-label">Entregadas</span>
        </div>
        <div className="stat-card-item">
          <span className="stat-value">Q{totalValue.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="stat-label">Valor Total</span>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por código, escuela, menú o responsable..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={filterEscuela} 
          onChange={(e) => setFilterEscuela(e.target.value)}
          disabled={isLoadingFilters}
        >
          <option value="todas">Todas las Escuelas</option>
          {escuelas.map(escuela => (
            <option key={escuela.id_escuela} value={escuela.id_escuela}>
              {escuela.nombre_escuela}
            </option>
          ))}
        </select>

        <select 
          value={filterMenu} 
          onChange={(e) => setFilterMenu(e.target.value)}
          disabled={isLoadingFilters}
        >
          <option value="todos">Todos los Menús</option>
          {menus.map(menu => (
            <option key={menu.id_menu} value={menu.id_menu}>
              {menu.nombre}
            </option>
          ))}
        </select>

        <select 
          value={filterEstado} 
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="todos">Todos los Estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN PROCESO">En Proceso</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <button className="btn-tertiary" onClick={handleClearFilters}>
          Limpiar Filtros
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span>
            Lista de Órdenes de Entrega 
            {filteredOrders.length !== orders.length && (
              <span className="filter-info"> ({filteredOrders.length} de {orders.length})</span>
            )}
          </span>
          <div className="table-actions">
            <button className="btn-tertiary" onClick={handleExportPDF} disabled={filteredOrders.length === 0}>
              <FontAwesomeIcon icon={faFilePdf} /> Exportar Lista
            </button>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            {orders.length === 0 
              ? 'No hay órdenes registradas. Crea una nueva orden para comenzar.'
              : 'No se encontraron órdenes con los filtros seleccionados.'
            }
          </p>
        ) : (
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
              {filteredOrders.map((order) => (
                <tr key={order.id_orden}>
                  <td><input type="checkbox" /></td>
                  <td><strong>{order.codigo_orden || '-'}</strong></td>
                  <td>{order.nombre_escuela || '-'}</td>
                  <td>{order.nombre_menu || '-'}</td>
                  <td>{order.cantidad_alumnos || '-'}</td>
                  <td>{order.dias_duracion ? `${order.dias_duracion} días` : '-'}</td>
                  <td>Q{parseFloat(order.valor_total || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                      <button 
                        className="action-btn icon-view" 
                        title="Visualizar" 
                        onClick={() => handleViewOrder(order)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button 
                        className="action-btn icon-status" 
                        title="Cambiar Estado" 
                        onClick={() => handleChangeStatus(order)}
                      >
                        <FontAwesomeIcon icon={faExchangeAlt} />
                      </button>
                      <button 
                        className="action-btn icon-edit" 
                        title="Editar" 
                        onClick={() => handleEdit(order)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="action-btn icon-delete" 
                        title="Cancelar Orden" 
                        onClick={() => handleDelete(order.id_orden)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <AddEditOrderModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveOrder}
          currentOrder={currentOrderToEdit}
        />
      )}

      {isViewModalOpen && (
        <ViewOrderModal
          onClose={() => setIsViewModalOpen(false)}
          orderId={currentOrderToView?.id_orden}
          orderData={currentOrderToView}
        />
      )}

      {isStatusModalOpen && (
        <ChangeOrderStatusModal
          onClose={() => setIsStatusModalOpen(false)}
          onStatusChanged={handleStatusChanged}
          order={currentOrderToChangeStatus}
        />
      )}
    </div>
  );
};

export default OrdersPage;
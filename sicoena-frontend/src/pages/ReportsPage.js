import React, { useState, useEffect } from 'react';
import './ReportsPage.css';
import DashboardKPIs from '../components/Reports/DashboardKPIs';
import ReportFilters from '../components/Reports/ReportFilters';
import OrdersReportTable from '../components/Reports/OrdersReportTable';
import ReportCharts from '../components/Reports/ReportCharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';

const ReportsPage = () => {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateFrom, setDateFrom] = useState(getTodayDate());
  const [dateTo, setDateTo] = useState(getTodayDate());
  const [filterEscuela, setFilterEscuela] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterMenu, setFilterMenu] = useState('todos');

  const [escuelas, setEscuelas] = useState([]);
  const [menus, setMenus] = useState([]);
  const [ordersWithProducts, setOrdersWithProducts] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    fetchOrders();
    fetchFilterData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, dateFrom, dateTo, filterEscuela, filterEstado, filterMenu]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    const token = sessionStorage.getItem('authToken');

    try {
      const response = await fetch(`${apiUrl}/orden`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al obtener órdenes');

      const data = await response.json();
      setOrders(data || []);

      const ordersWithDetails = await Promise.all(
        (data || []).map(async (order) => {
          try {
            const detailResponse = await fetch(`${apiUrl}/orden/${order.id_orden}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (detailResponse.ok) {
              const detail = await detailResponse.json();
              return {
                ...order,
                productos: detail.productos || []
              };
            }
            return order;
          } catch (err) {
            console.error(`Error cargando detalles de orden ${order.id_orden}:`, err);
            return order;
          }
        })
      );

      setOrdersWithProducts(ordersWithDetails);
      console.log('Órdenes cargadas:', data.length);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los datos de órdenes');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterData = async () => {
    const token = sessionStorage.getItem('authToken');

    try {
      const escuelasRes = await fetch(`${apiUrl}/institucion/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (escuelasRes.ok) {
        const data = await escuelasRes.json();
        setEscuelas(data.schools || []);
      }

      const menusRes = await fetch(`${apiUrl}/producto/active-menus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (menusRes.ok) {
        const data = await menusRes.json();
        setMenus(data.menus || []);
      }
    } catch (err) {
      console.error('Error cargando filtros:', err);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    if (dateFrom && dateTo) {
      filtered = filtered.filter(order => {
        if (!order.fecha_creacion) return false;
        
        const orderDate = order.fecha_creacion.split('T')[0];
        
        return orderDate >= dateFrom && orderDate <= dateTo;
      });

      console.log(`Filtro de fechas: ${dateFrom} a ${dateTo} - Órdenes encontradas: ${filtered.length}`);
    }

    if (filterEscuela !== 'todas') {
      filtered = filtered.filter(o => o.id_escuela === parseInt(filterEscuela));
    }

    if (filterEstado !== 'todos') {
      filtered = filtered.filter(o => o.estado === filterEstado);
    }

    if (filterMenu !== 'todos') {
      filtered = filtered.filter(o => o.id_menu === parseInt(filterMenu));
    }

    setFilteredOrders(filtered);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Reportes</h1>
        </div>
        <p style={{ textAlign: 'center', padding: '40px' }}>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="page-container reports-page">
      <div className="page-header">
        <h1>
          <FontAwesomeIcon icon={faChartBar} /> Reportes y Análisis
        </h1>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="dashboard-section">
        <h2>Dashboard de Análisis</h2>
        <DashboardKPIs orders={filteredOrders} />
      </div>

      <ReportFilters
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        filterEscuela={filterEscuela}
        setFilterEscuela={setFilterEscuela}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        filterMenu={filterMenu}
        setFilterMenu={setFilterMenu}
        escuelas={escuelas}
        menus={menus}
      />

      <div className="charts-section">
        <h2>Análisis Visual</h2>
        <ReportCharts orders={filteredOrders} />
      </div>

      <div className="table-section">
        <h2>Detalle de Órdenes</h2>
        <OrdersReportTable orders={filteredOrders} allOrdersWithProducts={ordersWithProducts} />
      </div>
    </div>
  );
};

export default ReportsPage;
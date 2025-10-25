// src/pages/InventoryPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './InventoryPage.css'; // Asegúrate de tener los estilos
import AddEditProductModal from '../components/AddEditProductModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faBox, faBoxes, faClipboardList, faChartLine, faExclamationTriangle, faBarcode, faSearch, faCoins } from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:5000/api'; // URL de tu backend

const InventoryPage = () => {
  const [products, setProducts] = useState([]); // Inicia vacío
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductToEdit, setCurrentProductToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- Estados para filtros ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [warehouseFilter, setWarehouseFilter] = useState('todos'); // Mapea a id_bodega
  const [statusFilter, setStatusFilter] = useState('ACTIVO'); // Mapea a estado
  const [stockFilter, setStockFilter] = useState('todos'); // 'bajo' o 'todos'

  // --- FUNCIÓN PARA OBTENER PRODUCTOS ---
  const fetchProducts = useCallback(async (
      currentSearch = '',
      currentCategory = 'todos',
      currentWarehouse = 'todos',
      currentStatus = 'ACTIVO',
      currentStock = 'todos'
  ) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');

    if (!token) { /* ... (manejo token ausente) ... */
        setError('No autorizado. Por favor, inicie sesión.');
        setIsLoading(false);
        navigate('/login');
        return;
    }

    // Construye URL con query parameters (usa nombres de backend)
    let url = `${API_URL}/producto?`; // Endpoint de productos
    const params = [];
    if (currentSearch) params.push(`search=${encodeURIComponent(currentSearch)}`);
    if (currentCategory !== 'todos') params.push(`categoria=${encodeURIComponent(currentCategory)}`);
    if (currentWarehouse !== 'todos') params.push(`bodega=${encodeURIComponent(currentWarehouse)}`); // id_bodega
    if (currentStatus !== 'todos') params.push(`estado=${encodeURIComponent(currentStatus)}`);
    if (currentStock === 'bajo') params.push(`stock=bajo`); // Indica al backend filtrar por stock bajo
    url += params.join('&');

    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401) { /* ... (manejo 401) ... */ }
      if (!response.ok) { /* ... (manejo otros errores fetch) ... */ }

      const data = await response.json();

      // Mapea los datos del backend a la estructura del frontend
      const mappedData = data.map(prod => ({
          id: prod.id_producto, // id_producto -> id
          nombre: prod.nombre_producto, // nombre_producto -> nombre
          categoria: prod.categoria,
          stock_actual: prod.stock_disponible, // stock_disponible -> stock_actual
          stock_min: prod.stock_minimo, // stock_minimo -> stock_min
          unidad: prod.unidad_medida, // unidad_medida -> unidad (¿ajustar tipo?)
          precio_uni: parseFloat(prod.precio_unitario) || 0, // precio_unitario -> precio_uni
          fecha_vencimiento: prod.fecha_vencimiento ? prod.fecha_vencimiento.split('T')[0] : null, // Formato YYYY-MM-DD
          proveedor: prod.id_proveedor, // Guardamos el ID por ahora
          descripcion: prod.descripcion,
          perecedero: Boolean(prod.perecedero), // tinyint -> boolean
          // Asume que el backend también devuelve id_bodega y estado
          almacen: prod.id_bodega, // Guardamos el ID de la bodega
          estado: prod.estado || 'ACTIVO', // Estado (asumiendo que existe)
          // Calcula valor_total en el frontend
          valor_total: (parseFloat(prod.precio_unitario) || 0) * (prod.stock_disponible || 0),
          // Puedes necesitar campos adicionales del backend aquí
      }));
      setProducts(mappedData);

    } catch (err) { /* ... (manejo de errores) ... */ }
    finally { setIsLoading(false); }
  }, [navigate]);

  // Carga inicial
  useEffect(() => {
    fetchProducts(searchTerm, categoryFilter, warehouseFilter, statusFilter, stockFilter);
  }, [fetchProducts]);

  // --- BUSCAR/FILTRAR ---
  const handleSearch = () => {
    fetchProducts(searchTerm, categoryFilter, warehouseFilter, statusFilter, stockFilter);
  };

  // --- EDITAR ---
  const handleEdit = (product) => {
    // Pasa el objeto mapeado del frontend al modal
    setCurrentProductToEdit(product);
    setIsModalOpen(true);
  };

  // --- DESACTIVAR (SOFT DELETE) ---
  const handleDelete = async (productId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado a INACTIVO?')) {
      const token = localStorage.getItem('authToken');
      setError(null);
      try {
        // Asume endpoint PUT /api/producto/:id/status
        const response = await fetch(`${API_URL}/producto/${productId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'INACTIVO' }), // Pasa estado INACTIVO
        });
        if (!response.ok) throw new Error('Error al desactivar.');
        
        fetchProducts(searchTerm, categoryFilter, warehouseFilter, statusFilter, stockFilter); // Recarga
        alert('Producto desactivado.');
      } catch (err) { setError(err.message); }
    }
  };

  const handleAddNewProduct = () => {
    setCurrentProductToEdit(null);
    setIsModalOpen(true);
  };

  // --- GUARDAR (CREAR/EDITAR) ---
  const handleSaveProduct = async (productDataFromModal) => {
    const token = localStorage.getItem('authToken');
    setError(null);

    // Mapea los datos del modal a los nombres de columna de la BD
    const payload = {
        nombre_producto: productDataFromModal.nombre,
        categoria: productDataFromModal.categoria,
        unidad_medida: productDataFromModal.unidad, // Ajusta si el tipo es diferente
        precio_unitario: productDataFromModal.precio_uni,
        stock_disponible: productDataFromModal.stock_actual, // Modal usa stock_actual
        stock_minimo: productDataFromModal.stock_min,
        fecha_vencimiento: productDataFromModal.fecha_vencimiento || null, // Permite nulo
        id_proveedor: productDataFromModal.proveedor || null, // Asume que el modal devuelve el ID
        id_bodega: productDataFromModal.almacen || null, // Asume que el modal devuelve el ID
        descripcion: productDataFromModal.descripcion,
        perecedero: productDataFromModal.perecedero ? 1 : 0, // Boolean a 1/0
        estado: productDataFromModal.estado.toUpperCase(), // Asegura mayúsculas
    };

    const url = currentProductToEdit
                ? `${API_URL}/producto/${currentProductToEdit.id}` // PUT
                : `${API_URL}/producto`; // POST
    const method = currentProductToEdit ? 'PUT' : 'POST';

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
      if (!response.ok) throw new Error(data.message || `Error al guardar producto.`);

      fetchProducts(searchTerm, categoryFilter, warehouseFilter, statusFilter, stockFilter); // Recarga
      setIsModalOpen(false);
      alert(`Producto ${currentProductToEdit ? 'actualizado' : 'creado'} con éxito.`);

    } catch (err) { setError(err.message); }
  };

   // --- Cálculos para estadísticas (AHORA USAN DATOS DEL ESTADO 'products') ---
  const totalProducts = products.length; // Puede ser solo el total de la página actual si hay paginación
  const categories = [...new Set(products.map(p => p.categoria))].length;
  const warehouses = [...new Set(products.map(p => p.almacen))].length; // Usa IDs de bodega
  const totalValue = products.reduce((sum, p) => sum + p.valor_total, 0);
  const lowStockProductsCount = products.filter(p => p.stock_actual <= p.stock_min && p.estado === 'ACTIVO').length;
  const productsWithLowStock = products.filter(p => p.stock_actual <= p.stock_min && p.estado === 'ACTIVO');

  return (
    <div className="inventory-page-container">
      {/* --- Encabezado --- */}
      <div className="page-header">
        <h1>Gestión de Inventarios</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleAddNewProduct}>Nuevo Producto</button>
        </div>
      </div>

      {error && <div className="page-error-message">{error}</div>}

      {/* --- Alerta de Stock Bajo --- */}
      {productsWithLowStock.length > 0 && (
        <div className="low-stock-alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="alert-icon" />
          <p>
            <strong>Productos con stock bajo:</strong> {productsWithLowStock.length} producto(s) está(n) por debajo del mínimo.
          </p>
          <button className="btn-tertiary" onClick={() => { setStockFilter('bajo'); handleSearch(); }}>Ver Detalles</button>
        </div>
      )}

      {/* --- Tarjetas de Estadísticas (Ahora dinámicas) --- */}
      <div className="stats-cards-container">
        {/* ... (Tarjeta Total Productos) ... */}
        <div className="stat-card-item">
          <FontAwesomeIcon icon={faBoxes} className="stat-card-icon" />
          <span className="stat-value">{isLoading ? '...' : totalProducts}</span>
          <span className="stat-label">Total Productos</span>
        </div>
        <div className="stat-card-item">
            <FontAwesomeIcon icon={faClipboardList} className="stat-card-icon" />
            <span className="stat-value">{isLoading ? '...' : categories}</span>
            <span className="stat-label">Categorías</span>
        </div>
         <div className="stat-card-item">
            <FontAwesomeIcon icon={faBox} className="stat-card-icon" />
            <span className="stat-value">{isLoading ? '...' : warehouses}</span>
            <span className="stat-label">Bodegas</span> {/* Cambiado */}
        </div>
         <div className="stat-card-item">
            <FontAwesomeIcon icon={faCoins} className="stat-card-icon" />
            <span className="stat-value">{isLoading ? '...' : `Q${totalValue.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            <span className="stat-label">Valor Total</span>
        </div>
         <div className="stat-card-item">
            <FontAwesomeIcon icon={faExclamationTriangle} className="stat-card-icon" />
            <span className="stat-value">{isLoading ? '...' : lowStockProductsCount}</span>
            <span className="stat-label">Stock Bajo</span>
        </div>
         <div className="stat-card-item">
            <FontAwesomeIcon icon={faChartLine} className="stat-card-icon" />
            <span className="stat-value">...</span> {/* Simulado o requiere endpoint */}
            <span className="stat-label">Movimientos Hoy</span>
        </div>
      </div>

      {/* --- Barra de Filtros --- */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* <button className="search-btn"><FontAwesomeIcon icon={faSearch} /></button> */} {/* Botón Aplicar hace la búsqueda */}
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="todos">Todas las categorías</option>
          {/* Carga categorías dinámicamente si es posible */}
        </select>
        <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
          <option value="todos">Todas las bodegas</option>
          {/* Carga bodegas dinámicamente (ej: 1, 2, 3) */}
          <option value="1">Bodega Principal</option>
          <option value="2">Bodega Secundaria</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
          <option value="todos">Todos</option>
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="todos">Stock</option>
          <option value="bajo">Stock Bajo</option>
        </select>
        <button className="btn-primary" onClick={handleSearch}><FontAwesomeIcon icon={faSearch} /> Aplicar Filtros</button>
        <button className="btn-tertiary" onClick={() => {
            setSearchTerm(''); setCategoryFilter('todos'); setWarehouseFilter('todos'); setStatusFilter('ACTIVO'); setStockFilter('todos');
            fetchProducts('', 'todos', 'todos', 'ACTIVO', 'todos'); // Limpia y recarga
        }}>Limpiar</button>
      </div>

      {/* --- Tabla de Productos --- */}
      <div className="table-container">
        <div className="table-header">
            <span>Inventario de Productos</span>
            <div className="table-actions">
                 {/* ... (botones de acciones en lote) ... */}
                 <button className="btn-tertiary">Acciones en lote</button>
                <button className="btn-tertiary">Exportar Inventario</button>
                <button className="btn-tertiary">Códigos de Barras <FontAwesomeIcon icon={faBarcode} /></button>
            </div>
        </div>
        {isLoading ? ( <p>Cargando productos...</p> ) : (
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>ID</th>
                {/* <th>Imagen</th> */}
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Disp.</th> {/* Ajustado */}
                <th>Stock Min.</th>
                <th>Unidad Med.</th> {/* Ajustado */}
                <th>Precio Uni.</th>
                <th>Valor Total</th>
                <th>Bodega</th> {/* Ajustado */}
                <th>Perecedero</th> {/* Añadido */}
                <th>Fec. Venc.</th> {/* Añadido */}
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><input type="checkbox" /></td>
                  <td>{product.id}</td>
                  {/* <td> ... (imagen) ... </td> */}
                  <td>{product.nombre}</td>
                  <td>{product.categoria}</td>
                  <td className={product.stock_actual <= product.stock_min ? 'low-stock-cell' : ''}>
                      {product.stock_actual}
                  </td>
                  <td>{product.stock_min}</td>
                  <td>{product.unidad}</td>
                  <td>Q{product.precio_uni.toFixed(2)}</td>
                  <td>Q{product.valor_total.toFixed(2)}</td>
                  <td>Bodega {product.almacen}</td> {/* Muestra ID o nombre si lo obtienes */}
                  <td>{product.perecedero ? 'Sí' : 'No'}</td>
                  <td>{product.fecha_vencimiento || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${product.estado.toLowerCase()}`}>
                      {product.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(product)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                       {product.estado === 'ACTIVO' && (
                        <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(product.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                  <tr><td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron productos.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* --- Paginación (sin cambios) --- */}
      <div className="pagination"> {/* ... */} </div>

      {/* --- Modal --- */}
      {isModalOpen && (
        <AddEditProductModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          currentProduct={currentProductToEdit} // Pasa el objeto mapeado del frontend
        />
      )}
    </div>
  );
};

export default InventoryPage;
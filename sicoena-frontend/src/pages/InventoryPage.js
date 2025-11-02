// sicoena-frontend/src/pages/InventoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './InventoryPage.css';
import AddEditProductModal from '../components/AddEditProductModal';
import AddProveedorModal from '../components/AddProveedorModal';
import AddBodegaModal from '../components/AddBodegaModal';
import ListModal from '../components/ListModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTruckLoading, faBox, faBoxes, faChartLine, faExclamationTriangle, faSearch, faFilePdf, faFileExcel, faCoins, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
// --- CAMBIO: Se eliminan las importaciones de jsPDF que ya no se usan para este botón ---
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const API_URL = 'http://localhost:5000/api';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductToEdit, setCurrentProductToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- Estados para filtros ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [warehouseFilter, setWarehouseFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [stockFilter, setStockFilter] = useState('todos');
  const [categoriesList, setCategoriesList] = useState([]);
  
  const [movementsToday, setMovementsToday] = useState({
    entries: 0,
    exits: 0,
    total: 0
  });

  const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false);
  const [isBodegaModalOpen, setIsBodegaModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [bodegasList, setBodegasList] = useState([]);
  const [proveedoresList, setProveedoresList] = useState([]);
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(true);

  const fetchProducts = useCallback(async (
    currentSearch = '',
    currentCategory = 'todos',
    currentWarehouse = 'todos',
    currentStatus = 'todos',
    currentStock = 'todos'
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

    let url = `${API_URL}/producto?`;
    const params = [];
    if (currentSearch) params.push(`search=${encodeURIComponent(currentSearch)}`);
    if (currentCategory !== 'todos') params.push(`categoria=${encodeURIComponent(currentCategory)}`);
    if (currentWarehouse !== 'todos') params.push(`bodega=${encodeURIComponent(currentWarehouse)}`);
    if (currentStatus !== 'todos') params.push(`estado=${encodeURIComponent(currentStatus)}`);
    if (currentStock === 'bajo') params.push(`stock=bajo`);
    url += params.join('&');

    try {
      const response = await fetch(url, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (response.status === 401) {
        setError('No autorizado. Sesión expirada.');
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const data = await response.json();
      const mappedData = data.map(prod => ({
        id: prod.id_producto,
        nombre: prod.nombre_producto,
        categoria: prod.categoria,
        stock_actual: prod.stock_disponible,
        stock_min: prod.stock_minimo,
        unidad: prod.unidad_medida,
        precio_uni: parseFloat(prod.precio_unitario) || 0,
        fecha_vencimiento: prod.fecha_vencimiento ? prod.fecha_vencimiento.split('T')[0] : null,
        proveedor: prod.id_proveedor,
        descripcion: prod.descripcion,
        perecedero: Boolean(prod.perecedero),
        almacen: prod.id_bodega,
        estado: prod.estado || 'ACTIVO',
        valor_total: (parseFloat(prod.precio_unitario) || 0) * (prod.stock_disponible || 0),
      }));
      setProducts(mappedData);

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    }
    finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const fetchMovementsToday = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/movimientos/hoy`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al obtener movimientos');
      
      const data = await response.json();
      console.log('📊 Movimientos obtenidos:', data);
      
      setMovementsToday({
        entries: data.entries || 0,
        exits: data.exits || 0,
        total: data.total || 0
      });
    } catch (err) {
      console.error('Error fetching movements:', err);
    }
  }, []);

  const fetchBodegas = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/bodega`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar bodegas');
      const data = await response.json();
      setBodegasList(data);
    } catch (err) {
      console.error("Error fetching bodegas:", err);
      setError(err.message);
    }
  }, []);

  const fetchProveedores = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/proveedor`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar proveedores');
      const data = await response.json();
      setProveedoresList(data);
    } catch (err) {
      console.error("Error fetching proveedores:", err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/producto/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        const data = await response.json();
        setCategoriesList(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    const loadInitialData = async () => {
      setIsCatalogsLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchMovementsToday(),
        fetchProducts('', 'todos', 'todos', 'todos', 'todos'),
        fetchBodegas(),
        fetchProveedores()
      ]);
      setIsCatalogsLoading(false);
    };

    loadInitialData();
  }, [fetchProducts, fetchMovementsToday, fetchBodegas, fetchProveedores]);


  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Tab enfocada, recargando movimientos...');
      fetchMovementsToday();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchMovementsToday, fetchProducts]);

  const handleSearch = () => {
    fetchProducts(searchTerm, categoryFilter, warehouseFilter, statusFilter, stockFilter);
  };

  const handleEdit = (product) => {
    setCurrentProductToEdit(product);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (productId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado a INACTIVO?')) {
      const token = localStorage.getItem('authToken');
      setError(null);
      try {
        const response = await fetch(`${API_URL}/producto/${productId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'INACTIVO' }),
        });
        if (!response.ok) throw new Error('Error al desactivar.');

        fetchProducts(searchTerm, categoryFilter, warehouseFilter, statusFilter, stockFilter);
        fetchMovementsToday(); 
        alert('Producto desactivado.');
      } catch (err) {
        setError(err.message);
      }
    }
  };
  
  const handleAddNewProduct = () => {
    setCurrentProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productDataFromModal) => {
    const token = localStorage.getItem('authToken');
    setError(null);

    const payload = {
      nombre_producto: productDataFromModal.nombre,
      categoria: productDataFromModal.categoria,
      unidad_medida: productDataFromModal.unidad,
      precio_unitario: productDataFromModal.precio_uni,
      stock_disponible: productDataFromModal.stock_actual,
      stock_minimo: productDataFromModal.stock_min,
      fecha_vencimiento: productDataFromModal.fecha_vencimiento || null,
      id_proveedor: productDataFromModal.proveedor || null,
      id_bodega: productDataFromModal.almacen || null,
      descripcion: productDataFromModal.descripcion,
      perecedero: productDataFromModal.perecedero ? 1 : 0,
      estado: productDataFromModal.estado?.toUpperCase() || 'ACTIVO',
    };

    const url = currentProductToEdit
      ? `${API_URL}/producto/${currentProductToEdit.id}`
      : `${API_URL}/producto`;
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
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      if (!response.ok) throw new Error(data.message || `Error al guardar producto.`);

      fetchProducts(searchTerm, categoryFilter, warehouseFilter, statusFilter, stockFilter);
      fetchMovementsToday(); 
      
      setIsModalOpen(false);
      alert(`Producto ${currentProductToEdit ? 'actualizado' : 'creado'} con éxito.`);

    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message);
    }
  };

  const handleSaveProveedor = async (proveedorData) => {
    const token = localStorage.getItem('authToken');
    setError(null);
    const payload = { ...proveedorData, estado: 'ACTIVO' };

    try {
      const response = await fetch(`${API_URL}/proveedor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let data = { message: 'Error desconocido' };
        try { data = await response.json(); } catch(e) {}
        throw new Error(data.message || 'Error al crear el proveedor.');
      }

      setIsProveedorModalOpen(false);
      alert('Proveedor creado con éxito.');
      fetchProveedores();
      
    } catch (err) {
      console.error("Error en handleSaveProveedor:", err);
      setError(err.message);
    }
  };

  const handleSaveBodega = async (bodegaData) => {
    const token = localStorage.getItem('authToken');
    setError(null);
    const payload = { ...bodegaData, estado: 'ACTIVO' };

    try {
      const response = await fetch(`${API_URL}/bodega`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let data = { message: 'Error desconocido' };
        try { data = await response.json(); } catch(e) {}
        throw new Error(data.message || 'Error al crear la bodega.');
      }

      setIsBodegaModalOpen(false);
      alert('Bodega creada con éxito.');
      fetchBodegas();

    } catch (err) {
      console.error("Error en handleSaveBodega:", err);
      setError(err.message);
    }
  };

  // --- FUNCIÓN handleExportPDF MODIFICADA ---
  const handleExportPDF = async () => {
    console.log('Botón "Exportar PDF" presionado. Llamando al backend...');
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Sesión expirada. Por favor, inicie sesión de nuevo.');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/reportes/inventario`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        // Intenta leer el mensaje de error del backend
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al generar el reporte.' }));
        throw new Error(errorData.message);
      }
  
      // El backend envía el archivo, el navegador lo procesa para descarga
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_inventario_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  
      console.log('Descarga del reporte iniciada con éxito desde el backend.');
  
    } catch (error) {
      console.error('Error durante la exportación a PDF desde el backend:', error);
      alert(`No se pudo generar el reporte: ${error.message}`);
    }
  };

  // --- La función handleExportExcel se mantiene igual, sin cambios ---
  const handleExportExcel = async () => {
    console.log('Botón "Exportar Excel" presionado. Llamando al backend...');
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Sesión expirada. Por favor, inicie sesión de nuevo.');
      return;
    }
  
    try {
      // La URL ahora incluye el parámetro para especificar el formato
      const response = await fetch(`${API_URL}/reportes/inventario?format=excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al generar el reporte.' }));
        throw new Error(errorData.message);
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_inventario_${Date.now()}.xlsx`; // Nombre del archivo .xlsx
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  
      console.log('Descarga del reporte de Excel iniciada con éxito desde el backend.');
  
    } catch (error) {
      console.error('Error durante la exportación a Excel desde el backend:', error);
      alert(`No se pudo generar el reporte: ${error.message}`);
    }
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.valor_total, 0);
  const lowStockProductsCount = products.filter(p => p.stock_actual <= p.stock_min && p.estado === 'ACTIVO').length;
  const productsWithLowStock = products.filter(p => p.stock_actual <= p.stock_min && p.estado === 'ACTIVO');

  return (
    <div className="inventory-page-container">
      <div className="page-header">
        <h1>Gestión de Inventarios</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleAddNewProduct}>Nuevo Producto</button>
          <button className="btn-primary" onClick={() => setIsProveedorModalOpen(true)}>Nuevo Proveedor</button>
          <button className="btn-primary" onClick={() => setIsBodegaModalOpen(true)}>Nueva Bodega</button>
        </div>
      </div>

      {error && <div className="page-error-message">{error}</div>}

      {productsWithLowStock.length > 0 && (
        <div className="low-stock-alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="alert-icon" />
          <p>
            <strong>Productos con stock bajo:</strong> {productsWithLowStock.length} producto(s) está(n) por debajo del mínimo.
          </p>
          <button className="btn-tertiary" onClick={() => { setStockFilter('bajo'); handleSearch(); }}>Ver Detalles</button>
        </div>
      )}

      <div className="stats-cards-container">
        <div className="stat-card-item">
          <FontAwesomeIcon icon={faBoxes} className="stat-card-icon" />
          <span className="stat-value">{isLoading ? '...' : totalProducts}</span>
          <span className="stat-label">Total Productos</span>
        </div>

        <div 
          className="stat-card-item clickable" 
          onClick={() => setIsListModalOpen(true)}
          title="Ver listas de Bodegas y Proveedores"
        >
          <div className="stat-card-multi-content">
            <div className="multi-stat-item">
              <FontAwesomeIcon icon={faBox} className="stat-card-icon" />
              <div className="multi-stat-info">
                <span className="multi-stat-value">{isCatalogsLoading ? '...' : bodegasList.length}</span>
                <span className="multi-stat-label">Bodegas</span>
              </div>
            </div>
            <div className="multi-stat-item">
              <FontAwesomeIcon icon={faTruckLoading} className="stat-card-icon" />
              <div className="multi-stat-info">
                <span className="multi-stat-value">{isCatalogsLoading ? '...' : proveedoresList.length}</span>
                <span className="multi-stat-label">Proveedores</span>
              </div>
            </div>
          </div>
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
           <div className="movements-info">
             <div className="movement-item">
               <FontAwesomeIcon icon={faArrowUp} className="movement-icon in" />
               <div>
                 <span className="movement-label">Entradas</span>
                 <span className="movement-value">{isLoading ? '...' : movementsToday.entries}</span>
               </div>
             </div>
             <div className="movement-item">
               <FontAwesomeIcon icon={faArrowDown} className="movement-icon out" />
               <div>
                 <span className="movement-label">Salidas</span>
                 <span className="movement-value">{isLoading ? '...' : movementsToday.exits}</span>
               </div>
             </div>
           </div>
           <span className="stat-label">Movimientos Hoy</span>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="todos">Todas las categorías</option>
          {categoriesList.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
          <option value="todos">Todas las bodegas</option>
          <option value="1">Bodega Principal</option>
          <option value="2">Bodega Secundaria</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="todos">Stock</option>
          <option value="bajo">Stock Bajo</option>
        </select>
        <button className="btn-primary" onClick={handleSearch}><FontAwesomeIcon icon={faSearch} /> Aplicar Filtros</button>
        <button className="btn-tertiary" onClick={() => {
          setSearchTerm('');
          setCategoryFilter('todos');
          setWarehouseFilter('todos');
          setStatusFilter('todos');
          setStockFilter('todos');
          fetchProducts('', 'todos', 'todos', 'todos', 'todos');
        }}>Limpiar</button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span>Inventario de Productos</span>
          <div className="table-actions">
            <button className="btn-secondary btn-icon" onClick={handleExportPDF}>
              <FontAwesomeIcon icon={faFilePdf} /> Exportar PDF
            </button>
            <button className="btn-secondary btn-icon" onClick={handleExportExcel}>
              <FontAwesomeIcon icon={faFileExcel} /> Exportar Excel
            </button>
          </div>
        </div>
        {isLoading ? (
          <p>Cargando productos...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Disp.</th>
                <th>Stock Min.</th>
                <th>Unidad Med.</th>
                <th>Precio Uni.</th>
                <th>Valor Total</th>
                <th>Bodega</th>
                <th>Perecedero</th>
                <th>Fec. Venc.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><input type="checkbox" /></td>
                  <td>{product.id}</td>
                  <td>{product.nombre}</td>
                  <td>{product.categoria}</td>
                  <td className={product.stock_actual <= product.stock_min ? 'low-stock-cell' : ''}>
                    {product.stock_actual}
                  </td>
                  <td>{product.stock_min}</td>
                  <td>{product.unidad}</td>
                  <td>Q{product.precio_uni.toFixed(2)}</td>
                  <td>Q{product.valor_total.toFixed(2)}</td>
                  <td>Bodega {product.almacen}</td>
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

      {isModalOpen && (
        <AddEditProductModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          currentProduct={currentProductToEdit}
        />
      )}

      {isProveedorModalOpen && (
        <AddProveedorModal
          onClose={() => setIsProveedorModalOpen(false)}
          onSave={handleSaveProveedor}
        />
      )}

      {isBodegaModalOpen && (
        <AddBodegaModal
          onClose={() => setIsBodegaModalOpen(false)}
          onSave={handleSaveBodega}
        />
      )}
      
      {isListModalOpen && (
        <ListModal
          onClose={() => setIsListModalOpen(false)}
          bodegas={bodegasList}
          proveedores={proveedoresList}
          isLoading={isCatalogsLoading}
        />
      )}
    </div>
  );
};

export default InventoryPage;
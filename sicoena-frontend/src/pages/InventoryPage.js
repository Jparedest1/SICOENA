import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './InventoryPage.css';
import AddEditProductModal from '../components/AddEditProductModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faBox, faBoxes, faClipboardList, faChartLine, faExclamationTriangle, faSearch, faFilePdf, faFileExcel, faCoins } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs'; // Importa exceljs
import { saveAs } from 'file-saver'; // Importa file-saver


const API_URL = 'http://localhost:5000/api'; // URL de tu backend

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductToEdit, setCurrentProductToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- Estados para filtros ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos'); // Valor inicial 'todos'
  const [warehouseFilter, setWarehouseFilter] = useState('todos'); // Valor inicial 'todos'
  const [statusFilter, setStatusFilter] = useState('ACTIVO');    // Valor inicial 'ACTIVO'
  const [stockFilter, setStockFilter] = useState('todos');    // Valor inicial 'todos'
  const [categoriesList, setCategoriesList] = useState([]);
  
  // --- FUNCIÓN PARA OBTENER PRODUCTOS (con filtros) ---
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
    let url = `${API_URL}/producto?`;
    const params = [];
    if (currentSearch) params.push(`search=${encodeURIComponent(currentSearch)}`);
    if (currentCategory !== 'todos') params.push(`categoria=${encodeURIComponent(currentCategory)}`);
    if (currentWarehouse !== 'todos') params.push(`bodega=${encodeURIComponent(currentWarehouse)}`);
    if (currentStatus !== 'todos') params.push(`estado=${encodeURIComponent(currentStatus)}`); // Envía 'ACTIVO' o 'INACTIVO'
    if (currentStock === 'bajo') params.push(`stock=bajo`);
    url += params.join('&');

    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401) { /* ... (manejo 401) ... */ }
      if (!response.ok) { /* ... (manejo otros errores fetch) ... */ }

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
          almacen: prod.id_bodega, // ID Bodega
          estado: prod.estado || 'ACTIVO', // Asegura un valor
          valor_total: (parseFloat(prod.precio_unitario) || 0) * (prod.stock_disponible || 0),
      }));
      setProducts(mappedData);

    } catch (err) { /* ... (manejo de errores) ... */ }
    finally { setIsLoading(false); }
  }, [navigate]);

  // Carga inicial
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return; // No intentar si no hay token

      try {
        const response = await fetch(`${API_URL}/producto/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Error al cargar categorías');
        }
        const data = await response.json();
        setCategoriesList(data); // Guarda las categorías en el estado
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Opcional: mostrar un error específico para categorías
        // setError(prev => prev ? `${prev}\nError al cargar categorías.` : 'Error al cargar categorías.');
      }
    };

    fetchCategories();
    fetchProducts(); // Carga inicial de productos
  }, [fetchProducts]);

  // --- BUSCAR/FILTRAR ---
  const handleSearch = () => {
    // Llama a fetchProducts con los valores *actuales* de los estados de filtro
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

    if (!response.ok) {
      throw new Error(data.message || `Error al guardar producto.`);
    }

    fetchProducts(searchTerm, categoryFilter, warehouseFilter, statusFilter, stockFilter);
    fetchMovementsToday(); // ← AGREGA ESTA LÍNEA
    
    setIsModalOpen(false);
    alert(`Producto ${currentProductToEdit ? 'actualizado' : 'creado'} con éxito.`);

  } catch (err) {
    console.error('Error saving product:', err);
    setError(err.message);
  }
};

    const handleExportPDF = () => {
  if (products.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const doc = new jsPDF();
  doc.text("Reporte de Inventario - SICOENA", 14, 16);

  const head = [[
    'ID', 'Producto', 'Categoría', 'Stock Disp.', 'Stock Min.',
    'Unidad Med.', 'Precio Uni.', 'Valor Total', 'Bodega', 'Perecedero',
    'Fec. Venc.', 'Estado'
  ]];

  const body = products.map(p => [
    p.id,
    p.nombre,
    p.categoria,
    p.stock_actual,
    p.stock_min,
    p.unidad,
    `Q${Number(p.precio_uni ?? 0).toFixed(2)}`,
    `Q${Number(p.valor_total ?? 0).toFixed(2)}`,
    `Bodega ${p.almacen}`,
    p.perecedero ? 'Sí' : 'No',
    p.fecha_vencimiento || 'N/A',
    p.estado
  ]);

  autoTable(doc, {               // 👈 aquí está el cambio
    startY: 22,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: [44, 62, 80] },
    styles: { fontSize: 8 },
  });

  doc.save(`inventario_sicoena_${new Date().toISOString().slice(0,10)}.pdf`);
};

  const handleExportExcel = async () => {
    if (products.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // 1. Crea un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SICOENA';
    workbook.lastModifiedBy = 'SICOENA';
    workbook.created = new Date();
    workbook.modified = new Date();

    // 2. Añade una hoja de cálculo
    const worksheet = workbook.addWorksheet('Inventario');

    // 3. Define las columnas (header y key son importantes)
    // El 'key' debe coincidir con las claves del objeto de datos
    // 'header' es lo que se mostrará en Excel
    // 'width' es opcional para ajustar el ancho
    worksheet.columns = [
      { header: 'ID Producto', key: 'id', width: 15 },
      { header: 'Nombre Producto', key: 'nombre', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Stock Disp.', key: 'stock_actual', width: 15, style: { numFmt: '#,##0' } }, // Formato numérico
      { header: 'Stock Min.', key: 'stock_min', width: 15, style: { numFmt: '#,##0' } },
      { header: 'Unidad Med.', key: 'unidad', width: 15 },
      { header: 'Precio Uni. (Q)', key: 'precio_uni', width: 18, style: { numFmt: '"Q"#,##0.00' } }, // Formato moneda
      { header: 'Valor Total (Q)', key: 'valor_total', width: 18, style: { numFmt: '"Q"#,##0.00' } },
      { header: 'ID Bodega', key: 'almacen', width: 15 },
      { header: 'Perecedero', key: 'perecedero', width: 15 },
      { header: 'Fecha Venc.', key: 'fecha_vencimiento', width: 18, style: { numFmt: 'yyyy-mm-dd' } }, // Formato fecha
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    // 4. Prepara los datos (asegúrate que las claves coincidan con 'key' de las columnas)
    const dataToExport = products.map(p => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        stock_actual: p.stock_actual,
        stock_min: p.stock_min,
        unidad: p.unidad,
        precio_uni: p.precio_uni,
        valor_total: p.valor_total,
        almacen: p.almacen, // ID Bodega
        perecedero: p.perecedero ? 'Sí' : 'No',
        fecha_vencimiento: p.fecha_vencimiento ? new Date(p.fecha_vencimiento + 'T00:00:00') : 'No Aplica', // Convierte a objeto Date si existe
        estado: p.estado
    }));

    // 5. Añade los datos a la hoja
    worksheet.addRows(dataToExport);

    // 6. (Opcional) Estilo para el encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'FF2c3e50'} // Color similar al tema oscuro
    };
     worksheet.getRow(1).font = { bold: true, color: {argb: 'FFFFFFFF'} }; // Texto blanco

    // 7. Genera el buffer del archivo
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      // 8. Usa file-saver para descargar el archivo
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `inventario_sicoena_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (error) {
        console.error("Error al generar el archivo Excel:", error);
        alert("Hubo un error al generar el archivo Excel.");
    }
  };

  const [movementsToday, setMovementsToday] = useState({
  entries: 0,
  exits: 0,
  total: 0,
  totalValue: 0
});

// 2. Función para obtener movimientos
const fetchMovementsToday = useCallback(async () => {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/movimientos/hoy`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Error al obtener movimientos');
    const data = await response.json();
    setMovementsToday(data);
  } catch (err) {
    console.error('Error fetching movements:', err);
  }
}, []);


// 3. Llama en useEffect junto con fetchProducts
useEffect(() => {
  const fetchCategories = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/producto/categorias`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar categorías');
      const data = await response.json();
      setCategoriesList(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  fetchCategories();
  fetchMovementsToday();
  fetchProducts();
}, [fetchProducts, fetchMovementsToday]);
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
         <div className="stat-card-item movements-card">
          <FontAwesomeIcon icon={faChartLine} className="stat-card-icon" />
          <div className="movements-content">
            <div className="movement-stat">
              <span className="movement-label">Entradas</span>
              <span className="movement-value in">+{movementsToday.entries}</span>
            </div>
            <div className="movement-divider">|</div>
            <div className="movement-stat">
              <span className="movement-label">Salidas</span>
              <span className="movement-value out">-{movementsToday.exits}</span>
            </div>
          </div>
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
        {/* --- SELECT DE CATEGORÍA DINÁMICO --- */}
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="todos">Todas las categorías</option>
          {/* Mapea sobre categoriesList para generar las opciones */}
          {categoriesList.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
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
                <button className="btn-secondary btn-icon" onClick={handleExportPDF}>
                    <FontAwesomeIcon icon={faFilePdf} /> Exportar PDF
                </button>
                 <button className="btn-secondary btn-icon" onClick={handleExportExcel}>
                    <FontAwesomeIcon icon={faFileExcel} /> Exportar Excel
                </button>
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
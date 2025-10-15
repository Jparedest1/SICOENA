// src/pages/InventoryPage.js

import React, { useState } from 'react';
import './InventoryPage.css';
import AddEditProductModal from '../components/AddEditProductModal'; // El modal para productos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faEdit, faTrash, faBox, faBoxes, faClipboardList, faDollarSign, faChartLine, faExclamationTriangle, faBarcode, faSearch } from '@fortawesome/free-solid-svg-icons';

// Datos de ejemplo basados en tu imagen
const mockProducts = [
  { 
    id: 'PRD-001', imagen: '', nombre: 'Tomate', categoria: 'Verdura', stock_actual: 750, stock_min: 10, unidad: 'Unidad', precio_uni: 2.00, valor_total: 1500.00, almacen: 'Almacén Principal', estado: 'ACTIVO', ultima_act: '2023-01-12', 
    fecha_vencimiento: '2023-03-15', proveedor: 'Proveedor A', descripcion: 'Tomates frescos de cultivo orgánico.' 
  },
  { 
    id: 'PRD-002', imagen: '', nombre: 'Pepinillo', categoria: 'Verdura', stock_actual: 750, stock_min: 10, unidad: 'Unidad', precio_uni: 2.00, valor_total: 1500.00, almacen: 'Almacén Principal', estado: 'ACTIVO', ultima_act: '2023-01-12', 
    fecha_vencimiento: '2023-03-20', proveedor: 'Proveedor B', descripcion: 'Pepinillos tiernos y crujientes.' 
  },
  { 
    id: 'PRD-003', imagen: '', nombre: 'Banano', categoria: 'Fruta', stock_actual: 750, stock_min: 10, unidad: 'Unidad', precio_uni: 2.00, valor_total: 1500.00, almacen: 'Almacén Principal', estado: 'ACTIVO', ultima_act: '2023-01-12', 
    fecha_vencimiento: '2023-03-10', proveedor: 'Proveedor C', descripcion: 'Banano maduro, ideal para todo tipo de postres.' 
  },
  { 
    id: 'PRD-004', imagen: '', nombre: 'Bandita', categoria: 'Fruta', stock_actual: 5, stock_min: 10, unidad: 'Unidad', precio_uni: 2.00, valor_total: 10.00, almacen: 'Almacén Principal', estado: 'ACTIVO', ultima_act: '2023-01-12', 
    fecha_vencimiento: '2023-04-01', proveedor: 'Proveedor D', descripcion: 'Banditas de azúcar con sabor a fresa.' 
  },
];

const InventoryPage = () => {
  const [products, setProducts] = useState(mockProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductToEdit, setCurrentProductToEdit] = useState(null);

  // Filtros (puedes expandirlos con más estados y lógica de filtrado)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Todos los almacenes');
  const [selectedStatus, setSelectedStatus] = useState('Todos los estados');
  const [stockFilter, setStockFilter] = useState('Todos'); // 'Bajo', 'Todos'

  const handleEdit = (product) => {
    setCurrentProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('¿Está seguro de que desea cambiar el estado de este producto a INACTIVO?')) {
      setProducts(products.map(prod => 
        prod.id === productId ? { ...prod, estado: 'INACTIVO' } : prod
      ));
    }
  };

  const handleAddNewProduct = () => {
    setCurrentProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData) => {
    if (currentProductToEdit) {
      // Actualiza un producto existente
      setProducts(products.map(prod => 
        prod.id === currentProductToEdit.id ? { ...prod, ...productData } : prod
      ));
    } else {
      // Añade un nuevo producto
      const newProduct = { 
        ...productData, 
        id: `PRD-00${products.length + 1}`, // ID simulado
        ultima_act: new Date().toISOString().slice(0, 10),
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false); // Cierra el modal
  };

  // --- Cálculos para las tarjetas de estadísticas ---
  const totalProducts = products.length;
  const categories = [...new Set(products.map(p => p.categoria))].length;
  const warehouses = [...new Set(products.map(p => p.almacen))].length;
  const totalValue = products.reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const lowStockProducts = products.filter(p => p.stock_actual <= p.stock_min && p.estado === 'ACTIVO').length;

  const productsWithLowStock = products.filter(p => p.stock_actual <= p.stock_min && p.estado === 'ACTIVO');

  // Lógica de filtrado (básica)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas las categorías' || product.categoria === selectedCategory;
    const matchesWarehouse = selectedWarehouse === 'Todos los almacenes' || product.almacen === selectedWarehouse;
    const matchesStatus = selectedStatus === 'Todos los estados' || product.estado === selectedStatus;
    const matchesStock = stockFilter === 'Todos' || (stockFilter === 'Bajo' && product.stock_actual <= product.stock_min);
    
    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus && matchesStock;
  });


  return (
    <div className="inventory-page-container">
      {/* --- Encabezado --- */}
      <div className="page-header">
        <h1>Gestión de Inventarios</h1>
        <div className="header-buttons">
          <button className="btn-primary" onClick={handleAddNewProduct}>Nuevo Producto</button>
          <button className="btn-secondary">Registrar Movimiento</button>
          <button className="btn-secondary">Inventario Físico</button>
        </div>
      </div>

      {/* --- Alerta de Stock Bajo --- */}
      {productsWithLowStock.length > 0 && (
        <div className="low-stock-alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="alert-icon" />
          <p>
            <strong>Productos con stock bajo:</strong> {productsWithLowStock.length} producto(s) está(n) por debajo del stock mínimo establecido
          </p>
          <button className="btn-tertiary">Ver Detalles</button>
        </div>
      )}

      {/* --- Tarjetas de Estadísticas --- */}
      <div className="stats-cards-container">
        <div className="stat-card-item">
          <FontAwesomeIcon icon={faBoxes} className="stat-card-icon" />
          <span className="stat-value">{totalProducts}</span>
          <span className="stat-label">Total Productos</span>
        </div>
        <div className="stat-card-item">
          <FontAwesomeIcon icon={faClipboardList} className="stat-card-icon" />
          <span className="stat-value">{categories}</span>
          <span className="stat-label">Categorías</span>
        </div>
        <div className="stat-card-item">
          <FontAwesomeIcon icon={faBox} className="stat-card-icon" />
          <span className="stat-value">{warehouses}</span>
          <span className="stat-label">Almacenes</span>
        </div>
        <div className="stat-card-item">
          <FontAwesomeIcon icon={faCoins} className="stat-card-icon" />
          <span className="stat-value">Q{totalValue.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="stat-label">Valor Total</span>
        </div>
        <div className="stat-card-item">
          <FontAwesomeIcon icon={faExclamationTriangle} className="stat-card-icon" />
          <span className="stat-value">{lowStockProducts}</span>
          <span className="stat-label">Stock Bajo</span>
        </div>
        <div className="stat-card-item">
          <FontAwesomeIcon icon={faChartLine} className="stat-card-icon" />
          <span className="stat-value">5</span> {/* Valor estático por ahora */}
          <span className="stat-label">Movimientos Hoy</span>
        </div>
      </div>

      {/* --- Barra de Filtros --- */}
      <div className="filters-bar">
        <input 
          type="text" 
          placeholder="Buscar producto por código, nombre o descripción..." 
          className="search-input" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-btn"><FontAwesomeIcon icon={faSearch} /></button>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option>Todas las categorías</option>
          <option>Verdura</option>
          <option>Fruta</option>
          {/* Añade más categorías dinámicamente si es necesario */}
        </select>
        <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
          <option>Todos los almacenes</option>
          <option>Almacén Principal</option>
          {/* Añade más almacenes */}
        </select>
        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option>Todos los estados</option>
          <option>ACTIVO</option>
          <option>INACTIVO</option>
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="Todos">Stock</option>
            <option value="Bajo">Stock Bajo</option>
        </select>
        <button className="btn-primary">Aplicar Filtros</button>
        <button className="btn-tertiary" onClick={() => { setSearchTerm(''); setSelectedCategory('Todas las categorías'); setSelectedWarehouse('Todos los almacenes'); setSelectedStatus('Todos los estados'); setStockFilter('Todos');}}>Limpiar</button>
      </div>

      {/* --- Tabla de Productos --- */}
      <div className="table-container">
        <div className="table-header">
            <span>Inventario de Productos</span>
            <div className="table-actions">
                <button className="btn-tertiary">Acciones en lote</button>
                <button className="btn-tertiary">Exportar Inventario</button>
                <button className="btn-tertiary">Códigos de Barras <FontAwesomeIcon icon={faBarcode} /></button>
            </div>
        </div>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Código</th>
              <th>Imagen</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock Actual</th>
              <th>Stock Min.</th>
              <th>Unidad</th>
              <th>Precio Uni.</th>
              <th>Valor Total</th>
              <th>Almacén</th>
              <th>Estado</th>
              <th>Última Act.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td><input type="checkbox" /></td>
                <td>{product.id}</td>
                <td>
                  {product.imagen ? (
                    <img src={product.imagen} alt={product.nombre} className="product-image-thumb" />
                  ) : (
                    <div className="image-placeholder">
                      <FontAwesomeIcon icon={faBox} />
                    </div>
                  )}
                </td>
                <td>{product.nombre}</td>
                <td>{product.categoria}</td>
                <td className={product.stock_actual <= product.stock_min ? 'low-stock-cell' : ''}>
                    {product.stock_actual}
                </td>
                <td>{product.stock_min}</td>
                <td>{product.unidad}</td>
                <td>Q{product.precio_uni.toFixed(2)}</td>
                <td>Q{product.valor_total.toFixed(2)}</td>
                <td>{product.almacen}</td>
                <td>
                  <span className={`status-badge ${product.estado.toLowerCase().replace(' ', '-')}`}>
                    {product.estado}
                  </span>
                </td>
                <td>{product.ultima_act}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn icon-edit" title="Editar" onClick={() => handleEdit(product)}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="action-btn icon-delete" title="Desactivar" onClick={() => handleDelete(product.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginación (simple, puedes expandir la lógica) */}
      <div className="pagination">
        <span>Mostrando 1-5 de 247 productos</span>
        <div className="pagination-controls">
            <button className="page-btn">&lt;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">...</button>
            <button className="page-btn">125</button>
            <button className="page-btn">&gt;</button>
        </div>
      </div>

      {/* Modal para Añadir/Editar Producto */}
      {isModalOpen && (
        <AddEditProductModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          currentProduct={currentProductToEdit}
        />
      )}
    </div>
  );
};

export default InventoryPage;
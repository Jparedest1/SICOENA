// sicoena-frontend/src/components/AddEditProductModal.js

import React, { useState, useEffect } from 'react';
import './AddEditProductModal.css'; // ✅ ACTUALIZADO
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const AddEditProductModal = ({ onClose, onSave, currentProduct }) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [unidad, setUnidad] = useState('');
  const [precioUni, setPrecioUni] = useState('');
  const [stockInicial, setStockInicial] = useState('');
  const [stockMin, setStockMin] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [bodega, setBodega] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [perecedero, setPerecedero] = useState(false);
  const [estado, setEstado] = useState('ACTIVO');

  const [proveedores, setProveedores] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const isEditMode = currentProduct !== null;

  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setIsLoadingData(true);
      try {
        const proveedoresRes = await fetch(`${API_URL}/proveedor`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (proveedoresRes.ok) {
          const proveedoresData = await proveedoresRes.json();
          setProveedores(proveedoresData);
        }

        const bodegasRes = await fetch(`${API_URL}/bodega`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (bodegasRes.ok) {
          const bodegasData = await bodegasRes.json();
          setBodegas(bodegasData);
        }

        const categoriasRes = await fetch(`${API_URL}/producto/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (categoriasRes.ok) {
          const categoriasData = await categoriasRes.json();
          setCategorias(categoriasData);
        }
      } catch (err) {
        console.error('Error cargando datos del dropdown:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      setNombre(currentProduct.nombre || '');
      setCategoria(currentProduct.categoria || '');
      setUnidad(currentProduct.unidad || '');
      setPrecioUni(currentProduct.precio_uni ? `Q ${currentProduct.precio_uni.toFixed(2)}` : 'Q 0.00');
      setStockInicial(currentProduct.stock_actual || '');
      setStockMin(currentProduct.stock_min || '');
      setFechaVencimiento(currentProduct.fecha_vencimiento || '');
      setProveedor(currentProduct.proveedor || '');
      setBodega(currentProduct.almacen || '');
      setDescripcion(currentProduct.descripcion || '');
      setPerecedero(Boolean(currentProduct.perecedero));
      setEstado(currentProduct.estado || 'ACTIVO');
    } else {
      setPrecioUni('Q 0.00');
      setStockInicial('0');
      setStockMin('0');
      setFechaVencimiento('');
      setPerecedero(false);
      setEstado('ACTIVO');
      setUnidad('');
      setProveedor('');
      setBodega('');
      setNombre('');
      setCategoria('');
      setDescripcion('');
    }
  }, [currentProduct, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanPrecio = parseFloat(String(precioUni).replace(/[^0-9.]/g, '')) || 0;
    const initialStockNum = Number(stockInicial) || 0;
    const minStockNum = Number(stockMin) || 0;

    const productData = {
      nombre,
      categoria,
      unidad,
      precio_uni: cleanPrecio,
      stock_actual: initialStockNum,
      stock_min: minStockNum,
      fecha_vencimiento: fechaVencimiento || null,
      proveedor: proveedor || null,
      almacen: bodega,
      descripcion,
      perecedero,
      estado
    };

    onSave(productData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{isEditMode ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>

        <form onSubmit={handleSubmit}>
          {/* ===== INFORMACIÓN DEL PRODUCTO ===== */}
          <div className="form-section">
            <h3>Información del Producto</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre <span className="required">*</span></label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ingrese el nombre del producto"
                />
              </div>
              <div className="form-group">
                <label>Categoría <span className="required">*</span></label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Unidad de Medida <span className="required">*</span></label>
                <select value={unidad} onChange={(e) => setUnidad(e.target.value)} required>
                  <option value="">Seleccione una unidad</option>
                  <option value="Unidad">Unidad</option>
                  <option value="Kilogramo">Kilogramo (kg)</option>
                  <option value="Litro">Litro (L)</option>
                  <option value="Metro">Metro (m)</option>
                  <option value="Caja">Caja</option>
                </select>
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ingrese una descripción"
                />
              </div>
            </div>
          </div>

          {/* ===== INFORMACIÓN DE PRECIOS Y STOCK ===== */}
          <div className="form-section">
            <h3>Precios y Stock</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Precio Unitario (Q) <span className="required">*</span></label>
                <input
                  type="text"
                  value={precioUni}
                  onChange={(e) => setPrecioUni(e.target.value)}
                  required
                  placeholder="Q 0.00"
                />
              </div>
              <div className="form-group">
                <label>Stock Inicial <span className="required">*</span></label>
                <input
                  type="number"
                  value={stockInicial}
                  onChange={(e) => setStockInicial(e.target.value)}
                  required
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stock Mínimo <span className="required">*</span></label>
                <input
                  type="number"
                  value={stockMin}
                  onChange={(e) => setStockMin(e.target.value)}
                  required
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faCalendarAlt} /> Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ===== ALMACENAMIENTO Y PROVEEDOR ===== */}
          <div className="form-section">
            <h3>Almacenamiento y Proveedor</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Bodega <span className="required">*</span></label>
                <select value={bodega} onChange={(e) => setBodega(e.target.value)} required disabled={isLoadingData}>
                  <option value="">Seleccione una bodega</option>
                  {bodegas.map((bod) => (
                    <option key={bod.id_bodega} value={bod.id_bodega}>
                      {bod.nombre_bodega}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Proveedor</label>
                <select 
                  value={proveedor} 
                  onChange={(e) => setProveedor(e.target.value)}
                  disabled={isLoadingData}
                >
                  <option value="">-- Sin proveedor --</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id_proveedor} value={prov.id_proveedor}>
                      {prov.nombre_proveedor}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={perecedero}
                    onChange={(e) => setPerecedero(e.target.checked)}
                  />
                  ¿Es perecedero?
                </label>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* ===== BOTONES ===== */}
          <div className="modal-buttons">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditMode ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProductModal;
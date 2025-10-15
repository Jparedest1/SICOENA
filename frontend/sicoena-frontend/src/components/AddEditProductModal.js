// src/components/AddEditProductModal.js

import React, { useState, useEffect } from 'react';
import './AddUserModal.css'; // Reutilizamos el CSS genérico del modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCalendarAlt } from '@fortawesome/free-solid-svg-icons'; // Iconos para las secciones

const AddEditProductModal = ({ onClose, onSave, currentProduct }) => {
  // --- Estados para todos los campos del formulario ---
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [unidad, setUnidad] = useState('');
  const [precioUni, setPrecioUni] = useState(''); // Cambiado a string para manejar el 'Q 0.00'
  const [stockInicial, setStockInicial] = useState(''); // Nuevo campo
  
  const [stockMin, setStockMin] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(''); // Nuevo campo
  const [proveedor, setProveedor] = useState(''); // Nuevo campo
  
  const [descripcion, setDescripcion] = useState(''); // Nuevo campo
  const [estado, setEstado] = useState('ACTIVO'); // Este se mantiene aunque no esté en la imagen

  const isEditMode = currentProduct !== null;

  useEffect(() => {
    if (isEditMode) {
      setNombre(currentProduct.nombre || '');
      setCategoria(currentProduct.categoria || '');
      setUnidad(currentProduct.unidad || '');
      setPrecioUni(currentProduct.precio_uni ? `Q ${currentProduct.precio_uni.toFixed(2)}` : 'Q 0.00'); // Formatea
      setStockInicial(currentProduct.stock_actual || ''); // En edición, stock_actual es el "stock inicial" del producto.
      
      setStockMin(currentProduct.stock_min || '');
      setFechaVencimiento(currentProduct.fecha_vencimiento || ''); // Asume que este campo existe en mockProducts
      setProveedor(currentProduct.proveedor || ''); // Asume que este campo existe en mockProducts
      
      setDescripcion(currentProduct.descripcion || ''); // Asume que este campo existe en mockProducts
      setEstado(currentProduct.estado || 'ACTIVO');
    } else {
      // Valores por defecto para un nuevo producto
      setPrecioUni('Q 0.00');
      setStockInicial('0');
      setStockMin('0');
      setEstado('ACTIVO');
    }
  }, [currentProduct, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpia el formato de precio para guardar como número
    const cleanPrecio = parseFloat(precioUni.replace('Q ', '')).toFixed(2);
    const initialStockNum = Number(stockInicial);

    const productData = {
      nombre,
      categoria,
      unidad,
      precio_uni: Number(cleanPrecio),
      stock_actual: initialStockNum, // Usamos stockInicial como stock_actual al guardar
      stock_min: Number(stockMin),
      fecha_vencimiento: fechaVencimiento,
      proveedor,
      descripcion,
      estado,
      valor_total: initialStockNum * Number(cleanPrecio), // Recalcula valor total
    };
    onSave(productData);
  };

  const handlePriceChange = (e) => {
    let value = e.target.value;
    // Remueve todo lo que no sea número o punto, y el "Q "
    value = value.replace(/[^0-9.]/g, '');
    if (value === '' || value === '.') {
      setPrecioUni('Q 0.00');
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setPrecioUni(`Q ${numValue.toFixed(2)}`);
      } else {
        setPrecioUni('Q 0.00'); // En caso de entrada inválida final
      }
    }
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          
          {/* --- INFORMACIÓN BÁSICA --- */}
          <div className="form-section">
            <h3>INFORMACIÓN BÁSICA</h3>
            <div className="form-group">
              <label htmlFor="nombre">Nombre del Producto *</label>
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ingrese el nombre del producto" required />
              <small className="helper-text">Nombre descriptivo del producto</small>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoria">Categoría *</label>
                <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                  <option value="" disabled>Seleccionar categoría</option>
                  <option value="Verdura">Verdura</option>
                  <option value="Fruta">Fruta</option>
                  <option value="Lácteo">Lácteo</option>
                  <option value="Grano">Grano</option>
                  {/* Agrega más categorías si es necesario */}
                </select>
                <small className="helper-text">Categoría a la que pertenece el producto</small>
              </div>
              <div className="form-group">
                <label htmlFor="unidad">Unidad de Medida *</label>
                <select id="unidad" value={unidad} onChange={(e) => setUnidad(e.target.value)} required>
                  <option value="" disabled>Seleccionar unidad</option>
                  <option value="Unidad">Unidad</option>
                  <option value="Libra">Libra</option>
                  <option value="Quintal">Quintal</option>
                  <option value="Saco">Saco</option>
                </select>
                <small className="helper-text">Unidad en la que se mide el producto</small>
              </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="precioUni">Precio Unitario *</label>
                    <input type="text" id="precioUni" value={precioUni} onChange={handlePriceChange} onBlur={handlePriceChange} placeholder="Q 0.00" required />
                    <small className="helper-text">Precio por unidad de medida</small>
                </div>
                <div className="form-group">
                    <label htmlFor="stockInicial">Stock Inicial *</label>
                    <input type="number" id="stockInicial" value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} placeholder="0" required />
                    <small className="helper-text">Cantidad inicial en inventario</small>
                </div>
            </div>
          </div>

          {/* --- CONFIGURACIÓN DE INVENTARIO --- */}
          <div className="form-section">
            <h3><FontAwesomeIcon icon={faCog} className="section-icon" /> CONFIGURACIÓN DE INVENTARIO</h3>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="stockMin">Stock Mínimo</label>
                    <input type="number" id="stockMin" value={stockMin} onChange={(e) => setStockMin(e.target.value)} placeholder="10" />
                    <small className="helper-text"><span className="dot green"></span> Nivel de stock para alertas</small>
                </div>
                <div className="form-group">
                    <label htmlFor="fechaVencimiento">Fecha de Vencimiento</label>
                    <div className="input-with-icon">
                        <input type="date" id="fechaVencimiento" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
                    </div>
                    <small className="helper-text">Fecha de vencimiento (si aplica)</small>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="proveedor">Proveedor</label>
                <input type="text" id="proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Nombre del proveedor" />
                <small className="helper-text">Proveedor principal del producto</small>
            </div>
          </div>

          {/* --- DESCRIPCIÓN --- */}
          <div className="form-section">
            <h3>DESCRIPCIÓN</h3>
            <div className="form-group">
              <textarea id="descripcion" rows="4" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción detallada del producto, ingredientes, características especiales, etc."></textarea>
              <small className="helper-text">Información detallada sobre el producto (opcional)</small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">
              {isEditMode ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProductModal;
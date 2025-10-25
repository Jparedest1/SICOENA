// src/components/AddEditProductModal.js

import React, { useState, useEffect } from 'react';
import './AddUserModal.css'; // Reutilizamos el CSS genérico del modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCalendarAlt} from '@fortawesome/free-solid-svg-icons'; // Iconos para las secciones

const AddEditProductModal = ({ onClose, onSave, currentProduct }) => {
  // --- Estados del formulario ---
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [unidad, setUnidad] = useState(''); // Estado para Unidad de Medida
  const [precioUni, setPrecioUni] = useState('');
  const [stockInicial, setStockInicial] = useState(''); // Usado como stock_actual al guardar

  const [stockMin, setStockMin] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [proveedor, setProveedor] = useState(''); // Estado para Proveedor (ID)
  const [bodega, setBodega] = useState('');       // Estado para Bodega/Almacén (ID)

  const [descripcion, setDescripcion] = useState('');
  const [perecedero, setPerecedero] = useState(false); // <-- ESTADO PARA PERECEDERO (BOOLEANO)
  const [estado, setEstado] = useState('ACTIVO');

  const isEditMode = currentProduct !== null;

  useEffect(() => {
    if (isEditMode) {
      setNombre(currentProduct.nombre || '');
      setCategoria(currentProduct.categoria || '');
      setUnidad(currentProduct.unidad || ''); // <-- Usa 'unidad'
      setPrecioUni(currentProduct.precio_uni ? `Q ${currentProduct.precio_uni.toFixed(2)}` : 'Q 0.00');
      setStockInicial(currentProduct.stock_actual || ''); // En edición, usa stock_actual

      setStockMin(currentProduct.stock_min || '');
      setFechaVencimiento(currentProduct.fecha_vencimiento || '');
      setProveedor(currentProduct.proveedor || ''); // Asume que currentProduct tiene proveedor (ID)
      setBodega(currentProduct.almacen || '');     // Asume que currentProduct tiene almacen (ID bodega)

      setDescripcion(currentProduct.descripcion || '');
      setPerecedero(Boolean(currentProduct.perecedero)); // <-- Usa 'perecedero'
      setEstado(currentProduct.estado || 'ACTIVO');
    } else {
      // Valores por defecto
      setPrecioUni('Q 0.00');
      setStockInicial('0');
      setStockMin('0');
      setPerecedero(false); // <-- Default para perecedero
      setEstado('ACTIVO');
      setUnidad('');      // <-- Default para unidad
      setProveedor('');   // <-- Default para proveedor
      setBodega('');      // <-- Default para bodega
    }
  }, [currentProduct, isEditMode]);

const handleSubmit = (e) => {
    e.preventDefault();

    const cleanPrecio = parseFloat(String(precioUni).replace(/[^0-9.]/g, '')) || 0;
    const initialStockNum = Number(stockInicial) || 0;
    const minStockNum = Number(stockMin) || 0;

    // Objeto que se pasa a onSave (handleSaveProduct en InventoryPage)
    const productData = {
      nombre,
      categoria,
      unidad: unidad,             // <-- CORREGIDO: usa el estado 'unidad'
      precio_uni: cleanPrecio,
      stock_actual: initialStockNum,
      stock_min: minStockNum,
      fecha_vencimiento: fechaVencimiento,
      proveedor: proveedor,       // <-- CORREGIDO: usa el estado 'proveedor'
      almacen: bodega,            // <-- CORREGIDO: usa el estado 'bodega'
      descripcion,
      perecedero: perecedero,     // <-- CORREGIDO: usa el estado 'perecedero'
      estado: estado.toUpperCase(),
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
            {/* ... (Nombre, Categoría) ... */}
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
                  {/* ... */}
                </select>
                <small className="helper-text">Categoría a la que pertenece el producto</small>
              </div>
              <div className="form-group">
                  <label htmlFor="unidad">Unidad de Medida *</label>
                  {/* Asegúrate que el select actualice el estado 'unidad' */}
                  <select id="unidad" value={unidad} onChange={(e) => setUnidad(e.target.value)} required>
                      <option value="" disabled>Seleccionar unidad</option>
                      <option value="Unidad">Unidad</option>
                      <option value="Libra">Libra</option>
                      {/* ... */}
                  </select>
                  <small className="helper-text">Unidad en la que se mide el producto</small>
              </div>
            </div>
            {/* ... (Precio Unitario, Stock Inicial) ... */}
             <div className="form-row">
                <div className="form-group">
                    <label htmlFor="precioUni">Precio Unitario *</label>
                    <input type="text" id="precioUni" value={precioUni} onChange={handlePriceChange} onBlur={handlePriceChange} placeholder="Q 0.00" required />
                    <small className="helper-text">Precio por unidad de medida</small>
                </div>
                <div className="form-group">
                    <label htmlFor="stockInicial">Stock Inicial/Actual *</label> {/* Etiqueta actualizada */}
                    <input type="number" id="stockInicial" value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} placeholder="0" required />
                    <small className="helper-text">Cantidad actual en inventario</small>
                </div>
            </div>
          </div>

          {/* --- CONFIGURACIÓN DE INVENTARIO --- */}
          <div className="form-section">
            {/* ... (Stock Mínimo, Fecha Vencimiento) ... */}
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
                        <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                    </div>
                    <small className="helper-text">Fecha de vencimiento (si aplica)</small>
                </div>
            </div>
            <div className="form-row"> {/* Nueva fila para Proveedor y Bodega */}
                <div className="form-group">
                    <label htmlFor="proveedor">Proveedor</label>
                    {/* Debería ser un select que actualice el estado 'proveedor' */}
                    <select id="proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
                        <option value="" disabled>Seleccionar Proveedor</option>
                        <option value="1">Proveedor A (ID: 1)</option> {/* Ejemplo */}
                        <option value="2">Proveedor B (ID: 2)</option> {/* Ejemplo */}
                    </select>
                    <small className="helper-text">Proveedor principal del producto</small>
                </div>
                <div className="form-group">
                    <label htmlFor="bodega">Bodega *</label>
                     {/* Debería ser un select que actualice el estado 'bodega' */}
                    <select id="bodega" value={bodega} onChange={(e) => setBodega(e.target.value)} required>
                        <option value="" disabled>Seleccionar Bodega</option>
                        <option value="1">Bodega Principal (ID: 1)</option> {/* Ejemplo */}
                        <option value="2">Bodega Secundaria (ID: 2)</option> {/* Ejemplo */}
                    </select>
                    <small className="helper-text">Bodega donde se almacena</small>
                </div>
            </div>
            {/* --- Checkbox para Perecedero --- */}
             <div className="form-group checkbox-group" style={{ marginTop: '20px' }}>
                <input
                    type="checkbox"
                    id="perecedero"
                    checked={perecedero}
                    onChange={(e) => setPerecedero(e.target.checked)}
                 />
                <label htmlFor="perecedero">¿Es Perecedero?</label>
                <small className="helper-text">Marcar si el producto tiene fecha de vencimiento</small>
            </div>
          </div>

          {/* --- DESCRIPCIÓN --- */}
          <div className="form-section">
             {/* ... (Textarea Descripción) ... */}
              <h3>DESCRIPCIÓN</h3>
            <div className="form-group">
              <textarea id="descripcion" rows="4" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción detallada del producto..."></textarea>
              <small className="helper-text">Información detallada sobre el producto (opcional)</small>
            </div>
          </div>

          {/* --- Estado (Opcional si quieres editarlo aquí) --- */}
           {isEditMode && (
                <div className="form-section">
                     <h3>Estado</h3>
                    <div className="form-group">
                        <label htmlFor="estado">Estado Actual del Producto</label>
                        <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                            <option value="ACTIVO">Activo</option>
                            <option value="INACTIVO">Inactivo</option>
                        </select>
                    </div>
                </div>
            )}

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
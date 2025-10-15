// src/components/AddEditOrderModal.js

import React, { useState, useEffect } from 'react';
import './AddUserModal.css'; // Reusing the same modal CSS for a consistent look
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

// Mock data for dropdowns
const mockEscuelas = {
  "Escuela No. 1 Nivel Primario": 280,
  "Escuela Oficial Bilingue": 150,
  "Escuela El Castillo AEOUM": 320
};
const mockResponsables = ["Juan Pérez", "María García", "Carlos López"];
const mockProducts = [
  { id: 1, name: 'Tomate', category: 'Verdura' },
  { id: 2, name: 'Banano', category: 'Fruta' },
  { id: 3, name: 'Leche', category: 'Lácteo' },
  { id: 4, name: 'Arroz', category: 'Grano' },
  { id: 5, name: 'Frijol', category: 'Grano' },
  { id: 6, name: 'Queso', category: 'Lácteo' },
];


const AddEditOrderModal = ({ onClose, onSave, currentOrder }) => {
  // --- States for all form fields ---
  const [codigoOrden, setCodigoOrden] = useState('');
  const [fechaOrden, setFechaOrden] = useState(new Date().toISOString().slice(0, 10));
  const [responsable, setResponsable] = useState('');
  
  const [escuela, setEscuela] = useState('');
  const [tipoMenu, setTipoMenu] = useState('');
  
  const [diasDuracion, setDiasDuracion] = useState(1);
  const [cantidadAlumnos, setCantidadAlumnos] = useState(0);
  const [fechaEntrega, setFechaEntrega] = useState('');
  
  const [selectedProducts, setSelectedProducts] = useState([]);

  const isEditMode = currentOrder !== null;

  useEffect(() => {
    if (isEditMode) {
      // Populate fields if editing
      setCodigoOrden(currentOrder.id || '');
      setFechaOrden(currentOrder.fecha_creacion || new Date().toISOString().slice(0, 10));
      setResponsable(currentOrder.responsable || '');
      setEscuela(currentOrder.escuela || '');
      setTipoMenu(currentOrder.menu || '');
      setDiasDuracion(parseInt(currentOrder.duracion) || 1);
      setCantidadAlumnos(currentOrder.alumnos || 0);
      setFechaEntrega(currentOrder.fecha_entrega || '');
      // In a real app, you would fetch and set the selected products
    } else {
      // Set default values for a new order
      setCodigoOrden(`ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
    }
  }, [currentOrder, isEditMode]);

  // Auto-fill student count when a school is selected
  useEffect(() => {
    if (escuela && mockEscuelas[escuela]) {
      setCantidadAlumnos(mockEscuelas[escuela]);
    } else {
      setCantidadAlumnos(0);
    }
  }, [escuela]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      id: codigoOrden,
      escuela,
      menu: tipoMenu,
      alumnos: cantidadAlumnos,
      duracion: `${diasDuracion} días`,
      productos: selectedProducts.length,
      // In a real app, value would be calculated based on products
      valor_total: Math.floor(Math.random() * 20000), 
      estado: isEditMode ? currentOrder.estado : 'PENDIENTE',
      fecha_creacion: fechaOrden,
      fecha_entrega: fechaEntrega,
      responsable,
    };
    onSave(orderData);
  };

  const handleProductSelection = (productId) => {
      setSelectedProducts(prev => 
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FontAwesomeIcon icon={faPlus} /> {isEditMode ? 'Editar Orden de Entrega' : 'Nueva Orden de Entrega'}</h2>
          <span className="breadcrumb">Inicio &gt; Nueva Orden de Entrega</span>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          
          {/* --- INFORMACIÓN DE LA ORDEN --- */}
          <div className="form-section">
            <h3>INFORMACIÓN DE LA ORDEN</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Código de Orden</label>
                <input type="text" value={codigoOrden} disabled />
              </div>
              <div className="form-group">
                <label htmlFor="fechaOrden">Fecha de Orden *</label>
                <input type="date" id="fechaOrden" value={fechaOrden} onChange={(e) => setFechaOrden(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="responsable">Responsable de Entrega</label>
                <select id="responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)}>
                  <option value="" disabled>Seleccionar responsable</option>
                  {mockResponsables.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* --- INFORMACIÓN DE LA ESCUELA --- */}
          <div className="form-section">
            <h3>INFORMACIÓN DE LA ESCUELA</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="escuela">Escuela *</label>
                <select id="escuela" value={escuela} onChange={(e) => setEscuela(e.target.value)} required>
                  <option value="" disabled>Seleccionar una escuela</option>
                  {Object.keys(mockEscuelas).map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tipoMenu">Tipo de Menú</label>
                <select id="tipoMenu" value={tipoMenu} onChange={(e) => setTipoMenu(e.target.value)}>
                  <option value="" disabled>Seleccionar tipo de menú</option>
                  <option value="Menú Especial">Menú Especial</option>
                  <option value="Menú Regular">Menú Regular</option>
                  <option value="Menú Reforzado">Menú Reforzado</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- DURACIÓN Y CANTIDAD --- */}
          <div className="form-section">
            <h3>DURACIÓN Y CANTIDAD</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="diasDuracion">Días de Duración *</label>
                <div className="number-input-stepper">
                    <button type="button" onClick={() => setDiasDuracion(d => Math.max(1, d - 1))}><FontAwesomeIcon icon={faMinus}/></button>
                    <input type="number" id="diasDuracion" value={diasDuracion} onChange={(e) => setDiasDuracion(Number(e.target.value))} required />
                    <button type="button" onClick={() => setDiasDuracion(d => d + 1)}><FontAwesomeIcon icon={faPlus}/></button>
                </div>
                <small className="helper-text">Duración estimada del producto entregado</small>
              </div>
              <div className="form-group">
                <label htmlFor="cantidadAlumnos">Cantidad de Alumnos *</label>
                 <div className="number-input-stepper">
                    <button type="button" onClick={() => setCantidadAlumnos(c => Math.max(0, c - 1))}><FontAwesomeIcon icon={faMinus}/></button>
                    <input type="number" id="cantidadAlumnos" value={cantidadAlumnos} onChange={(e) => setCantidadAlumnos(Number(e.target.value))} required />
                    <button type="button" onClick={() => setCantidadAlumnos(c => c + 1)}><FontAwesomeIcon icon={faPlus}/></button>
                </div>
                <small className="helper-text">Se auto-completará según la escuela</small>
              </div>
              <div className="form-group">
                <label htmlFor="fechaEntrega">Fecha de Entrega Programada</label>
                <input type="date" id="fechaEntrega" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} />
              </div>
            </div>
          </div>

          {/* --- SELECCIÓN DE PRODUCTOS --- */}
          <div className="form-section">
              <div className="section-header-with-button">
                 <h3><FontAwesomeIcon icon={faBox} className="section-icon" /> SELECCIÓN DE PRODUCTOS</h3>
                 <div className="header-buttons">
                    <button type="button" className="btn-secondary" onClick={() => setSelectedProducts(mockProducts.map(p => p.id))}>Seleccionar Todo</button>
                    <button type="button" className="btn-tertiary" onClick={() => setSelectedProducts([])}>
                        <FontAwesomeIcon icon={faTrash} /> Limpiar Todo
                    </button>
                 </div>
              </div>
              <div className="form-row">
                  <input type="text" placeholder="Buscar productos..." className="search-input"/>
                  <select>
                      <option>Todas las categorías</option>
                      <option>Verdura</option>
                      <option>Fruta</option>
                      <option>Lácteo</option>
                      <option>Grano</option>
                  </select>
              </div>
              <div className="product-selection-list">
                  {mockProducts.map(product => (
                      <div key={product.id} className="product-item">
                          <input 
                            type="checkbox" 
                            id={`product-${product.id}`}
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleProductSelection(product.id)}
                          />
                          <label htmlFor={`product-${product.id}`}>{product.name} <span className="product-category">({product.category})</span></label>
                      </div>
                  ))}
              </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">
              {isEditMode ? 'Guardar Cambios' : 'Crear Orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditOrderModal;
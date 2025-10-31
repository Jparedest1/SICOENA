import React, { useState, useEffect } from 'react';
import './AddEditOrderModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const AddEditOrderModal = ({ onClose, onSave, currentOrder }) => {
  // --- Estados para todos los campos del formulario ---
  const [codigoOrden, setCodigoOrden] = useState('');
  const [fechaOrden, setFechaOrden] = useState(new Date().toISOString().slice(0, 10));
  const [responsable, setResponsable] = useState('');
  
  const [escuela, setEscuela] = useState('');
  const [tipoMenu, setTipoMenu] = useState('');
  
  const [diasDuracion, setDiasDuracion] = useState(1);
  const [cantidadAlumnos, setCantidadAlumnos] = useState(0);
  const [fechaEntrega, setFechaEntrega] = useState('');
  
  const [selectedProducts, setSelectedProducts] = useState([]);

  // --- Estados para datos dinámicos de la base de datos ---
  const [activeUsers, setActiveUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState('');

  const [activeSchools, setActiveSchools] = useState([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [errorSchools, setErrorSchools] = useState('');

  const [activeMenus, setActiveMenus] = useState([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  const [errorMenus, setErrorMenus] = useState('');

  const [menuProducts, setMenuProducts] = useState([]);
  const [isLoadingMenuProducts, setIsLoadingMenuProducts] = useState(false);

  const isEditMode = currentOrder !== null;
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Cargar usuarios activos
  const fetchActiveUsers = async () => {
    setIsLoadingUsers(true);
    setErrorUsers('');
    try {
      const response = await fetch(`${apiUrl}/api/usuario/active`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setActiveUsers(data.users || []);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setErrorUsers('No se pudieron cargar los usuarios activos');
      setActiveUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Cargar escuelas activas
  const fetchActiveSchools = async () => {
    setIsLoadingSchools(true);
    setErrorSchools('');
    try {
      const response = await fetch(`${apiUrl}/api/institucion/active`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setActiveSchools(data.schools || []);
    } catch (error) {
      console.error('Error al obtener escuelas:', error);
      setErrorSchools('No se pudieron cargar las escuelas activas');
      setActiveSchools([]);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  // Cargar menús activos
  const fetchActiveMenus = async () => {
    setIsLoadingMenus(true);
    setErrorMenus('');
    try {
      const response = await fetch(`${apiUrl}/api/producto/active-menus`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setActiveMenus(data.menus || []);
    } catch (error) {
      console.error('Error al obtener menús:', error);
      setErrorMenus('No se pudieron cargar los menús activos');
      setActiveMenus([]);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  // ✅ Cargar productos del menú
  const fetchMenuProducts = async (menuId) => {
    if (!menuId) {
      setMenuProducts([]);
      return;
    }

    setIsLoadingMenuProducts(true);
    try {
      const response = await fetch(`${apiUrl}/api/producto/menu/${menuId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setMenuProducts(data.products || []);
      // Auto-seleccionar todos los productos del menú
      setSelectedProducts(data.products.map(p => p.id_producto) || []);
    } catch (error) {
      console.error('Error al obtener productos del menú:', error);
      setMenuProducts([]);
    } finally {
      setIsLoadingMenuProducts(false);
    }
  };

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    fetchActiveUsers();
    fetchActiveSchools();
    fetchActiveMenus();
  }, []);

  // Cargar datos del formulario si está en modo edición
  useEffect(() => {
    if (isEditMode) {
      setCodigoOrden(currentOrder.id || '');
      setFechaOrden(currentOrder.fecha_creacion || new Date().toISOString().slice(0, 10));
      setResponsable(currentOrder.responsable || '');
      setEscuela(currentOrder.escuela || '');
      setTipoMenu(currentOrder.menu || '');
      setDiasDuracion(parseInt(currentOrder.duracion) || 1);
      setCantidadAlumnos(currentOrder.alumnos || 0);
      setFechaEntrega(currentOrder.fecha_entrega || '');
    } else {
      setCodigoOrden(`ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
    }
  }, [currentOrder, isEditMode]);

  // Auto-completar cantidad de alumnos cuando se selecciona escuela
  useEffect(() => {
    if (escuela) {
      const selectedSchool = activeSchools.find(s => s.id_escuela == escuela);
      if (selectedSchool) {
        setCantidadAlumnos(selectedSchool.cantidad_estudiantes || 0);
      }
    }
  }, [escuela, activeSchools]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responsable) {
      alert('Por favor, selecciona un responsable de entrega');
      return;
    }
    if (!escuela) {
      alert('Por favor, selecciona una escuela');
      return;
    }
    if (!tipoMenu) {
      alert('Por favor, selecciona un tipo de menú');
      return;
    }
    if (selectedProducts.length === 0) {
      alert('Por favor, selecciona al menos un producto');
      return;
    }

    try {
      // Preparar los datos de productos
      const productosData = menuProducts
        .filter(p => selectedProducts.includes(p.id_producto))
        .map(p => ({
          id_producto: p.id_producto,
          cantidad: p.cantidad,
          unidad_medida: p.unidad_medida
        }));

      // ✅ Calcular valor total
      const valorTotal = menuProducts
        .filter(p => selectedProducts.includes(p.id_producto))
        .reduce((sum, p) => {
          const precioUnitario = parseFloat(p.precio_unitario) || 0;
          const cantidad = parseFloat(p.cantidad) || 0;
          const subtotal = precioUnitario * cantidad * diasDuracion * cantidadAlumnos;
          return sum + subtotal;
        }, 0);

      // Datos de la orden
      const orderData = {
        codigo_orden: codigoOrden,
        id_escuela: parseInt(escuela),
        id_menu: parseInt(tipoMenu),
        id_responsable: parseInt(responsable),
        cantidad_alumnos: cantidadAlumnos,
        dias_duracion: diasDuracion,
        fecha_entrega: fechaEntrega || null,
        valor_total: valorTotal,
        productos: productosData,
        observaciones: ''
      };

      console.log('📤 Enviando orden:', orderData);

      // Enviar al backend
      const response = await fetch(`${apiUrl}/api/orden`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la orden');
      }

      console.log('✅ Orden creada:', data);
      alert('✅ Orden creada exitosamente con código: ' + data.codigo_orden);
      
      onClose();
      onSave(orderData);

    } catch (error) {
      console.error('❌ Error al crear orden:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleMenuChange = (e) => {
    const menuId = e.target.value;
    setTipoMenu(menuId);
    if (menuId) {
      fetchMenuProducts(menuId);
    }
  };

  // ✅ CALCULAR SUBTOTAL POR PRODUCTO
  const calcularSubtotal = (product) => {
    const precioUnitario = parseFloat(product.precio_unitario) || 0;
    const cantidad = parseFloat(product.cantidad) || 0;
    return precioUnitario * cantidad * diasDuracion * cantidadAlumnos;
  };


  // ✅ CALCULAR TOTAL DE LA ORDEN
  const calcularTotalOrden = () => {
    return menuProducts
      .filter(p => selectedProducts.includes(p.id_producto))
      .reduce((sum, p) => sum + calcularSubtotal(p), 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FontAwesomeIcon icon={faPlus} /> {isEditMode ? 'Editar Orden de Entrega' : 'Nueva Orden de Entrega'}</h2>
          <span className="breadcrumb">Inicio &gt; Nueva Orden de Entrega</span>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          
          {/* --- MENSAJES DE ERROR --- */}
          {(errorUsers || errorSchools || errorMenus) && (
            <div className="error-message" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px', color: '#c00' }}>
              ⚠️ {errorUsers || errorSchools || errorMenus}
            </div>
          )}

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
                <label htmlFor="responsable">Responsable de Entrega *</label>
                <select 
                  id="responsable" 
                  value={responsable} 
                  onChange={(e) => setResponsable(e.target.value)}
                  disabled={isLoadingUsers}
                  required
                >
                  <option value="">
                    {isLoadingUsers ? 'Cargando usuarios...' : 'Seleccionar responsable'}
                  </option>
                  {activeUsers.map(user => (
                    <option key={user.id_usuario} value={user.id_usuario}>
                      {user.nombre}
                    </option>
                  ))}
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
                <select 
                  id="escuela" 
                  value={escuela} 
                  onChange={(e) => setEscuela(e.target.value)} 
                  disabled={isLoadingSchools}
                  required
                >
                  <option value="">
                    {isLoadingSchools ? 'Cargando escuelas...' : 'Seleccionar una escuela'}
                  </option>
                  {activeSchools.map(school => (
                    <option key={school.id_escuela} value={school.id_escuela}>
                      {school.nombre_escuela}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tipoMenu">Tipo de Menú *</label>
                <select 
                  id="tipoMenu" 
                  value={tipoMenu} 
                  onChange={handleMenuChange}
                  disabled={isLoadingMenus}
                  required
                >
                  <option value="">
                    {isLoadingMenus ? 'Cargando menús...' : 'Seleccionar tipo de menú'}
                  </option>
                  {activeMenus.map(menu => (
                    <option key={menu.id_menu} value={menu.id_menu}>
                      {menu.nombre}
                    </option>
                  ))}
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

          {/* --- SELECCIÓN DE PRODUCTOS CON PRECIOS --- */}
          <div className="form-section">
            <div className="section-header-with-button">
              <h3><FontAwesomeIcon icon={faBox} className="section-icon" /> SELECCIÓN DE PRODUCTOS Y PRECIOS</h3>
              <div className="header-buttons">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setSelectedProducts(menuProducts.map(p => p.id_producto))}
                >
                  Seleccionar Todo
                </button>
                <button type="button" className="btn-tertiary" onClick={() => setSelectedProducts([])}>
                  <FontAwesomeIcon icon={faTrash} /> Limpiar Todo
                </button>
              </div>
            </div>
            
            {isLoadingMenuProducts ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>Cargando productos del menú...</p>
            ) : menuProducts.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Selecciona un menú para ver los productos disponibles
              </p>
            ) : (
              <>
                {/* ✅ TABLA DE PRODUCTOS CON PRECIOS */}
                <div className="products-table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>Seleccionar</th>
                        <th>Producto</th>
                        <th style={{ width: '120px' }}>Unidades</th>
                        <th style={{ width: '120px' }}>Precio Unit.</th>
                        <th style={{ width: '150px' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuProducts.map(product => (
                        <tr key={product.id_producto} className={selectedProducts.includes(product.id_producto) ? 'selected' : ''}>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              id={`product-${product.id_producto}`}
                              checked={selectedProducts.includes(product.id_producto)}
                              onChange={() => handleProductSelection(product.id_producto)}
                            />
                          </td>
                          <td>
                            <label htmlFor={`product-${product.id_producto}`}>
                              {product.nombre_producto} 
                              <span className="product-category">
                                ({product.categoria})
                              </span>
                            </label>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <strong>{product.cantidad}</strong> {product.unidad_medida}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            Q{parseFloat(product.precio_unitario || 0).toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            Q{calcularSubtotal(product).toFixed(2)}
                            <br />
                            <small style={{ color: '#666', fontSize: '11px' }}>
                              ({product.cantidad} × Q{parseFloat(product.precio_unitario || 0).toFixed(2)} × {diasDuracion} días × {cantidadAlumnos} alumnos)
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ✅ RESUMEN DEL TOTAL */}
                <div className="order-summary">
                  <div className="summary-row">
                    <span className="summary-label">Productos Seleccionados:</span>
                    <span className="summary-value">{selectedProducts.length}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Días de Entrega:</span>
                    <span className="summary-value">{diasDuracion}</span>
                  </div>
                  <div className="summary-row total">
                    <span className="summary-label">TOTAL DE LA ORDEN:</span>
                    <span className="summary-value">Q{calcularTotalOrden().toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
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
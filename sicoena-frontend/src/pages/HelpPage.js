// src/pages/HelpPage.js

import React, { useState } from 'react';
import './HelpPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faChevronDown, faBook, faUsers, faBuilding, faBoxes, faTruck, faChartBar, faCog, faEnvelope, faTimes, faStar, faBug, faWrench } from '@fortawesome/free-solid-svg-icons';

// Componente para el Acordeón de FAQ (sin cambios)
const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <FontAwesomeIcon icon={faChevronDown} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

// Contenido de las guías
const guidesContent = {
  'Gestión de Usuarios': {
    icon: faUsers,
    content: 'Aprenda a agregar nuevos usuarios, asignar roles y permisos, y gestionar sus accesos al sistema. Es crucial para mantener la seguridad y la correcta asignación de tareas.'
  },
  'Gestión de Instituciones': {
    icon: faBuilding,
    content: 'Esta guía le mostrará cómo registrar, editar y organizar las instituciones. Podrá gestionar su información de contacto, direcciones y vincularlas a órdenes y usuarios.'
  },
  'Gestión de Inventario': {
    icon: faBoxes,
    content: 'Descubra cómo administrar sus productos, definir niveles de stock mínimo y máximo, realizar ajustes de inventario y consultar el historial de movimientos de cada artículo.'
  },
  'Gestión de Órdenes': {
    icon: faTruck,
    content: 'Siga los pasos para crear, procesar, entregar y cancelar órdenes. Entenderá el flujo de trabajo desde la solicitud inicial hasta la entrega final a la institución.'
  },
  'Reportes y Análisis': {
    icon: faChartBar,
    content: 'Genere reportes detallados sobre ventas, inventario, órdenes y actividad de usuarios. Utilice los filtros avanzados para obtener la información que necesita para la toma de decisiones.'
  },
  'Configuración del Sistema': {
    icon: faCog,
    content: 'Configure los parámetros generales del sistema, como la información de la empresa, las notificaciones y las plantillas de correo electrónico. Personalice SICOENA a sus necesidades.'
  }
};

// Componente para el Modal de Notas de Versión
const VersionNotesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Notas de la Versión 1.0.0</h2>
          <button onClick={onClose} className="close-modal-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-body">
          <p><strong>Fecha de Lanzamiento:</strong> 15 de Octubre de 2025</p>
          <h4><FontAwesomeIcon icon={faStar} /> Nuevas Características</h4>
          <ul>
            <li>Lanzamiento inicial del Centro de Ayuda interactivo.</li>
            <li>Implementación del módulo de Gestión de Usuarios.</li>
            <li>Funcionalidad para seguimiento de Inventario y Órdenes.</li>
          </ul>
          <h4><FontAwesomeIcon icon={faBug} /> Corrección de Errores</h4>
          <ul>
            <li>Se corrigió un error que impedía la correcta visualización de reportes en navegadores móviles.</li>
            <li>Mejora en los tiempos de carga de la página de inicio.</li>
          </ul>
          <h4><FontAwesomeIcon icon={faWrench} /> Mejoras</h4>
          <ul>
            <li>Optimización de la interfaz de usuario para una navegación más intuitiva.</li>
            <li>Actualización de la librería de íconos a la última versión para mayor consistencia visual.</li>
          </ul>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

const HelpPage = () => {
  // Estado para el formulario de soporte
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  
  // Estado para la guía seleccionada
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Estado para el modal de notas de versión
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manejador para el envío del formulario de soporte
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) {
      alert('Por favor, complete los campos de Asunto y Mensaje.');
      return;
    }
    alert(`Mensaje de soporte enviado:\n\nAsunto: ${supportSubject}\nMensaje: ${supportMessage}`);
    setSupportSubject('');
    setSupportMessage('');
  };

  // Manejador para el clic en las guías
  const handleGuideClick = (guideTitle) => {
    setSelectedGuide(guidesContent[guideTitle]);
  };
  
  const handleCloseGuide = () => {
    setSelectedGuide(null);
  };

  const handleVersionNotesClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <div className="page-container help-page">
      <VersionNotesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="page-header">
        <h1><FontAwesomeIcon icon={faQuestionCircle} /> Centro de Ayuda</h1>
        <span className="breadcrumb">Inicio &gt; Ayuda</span>
      </div>

      <div className="help-layout">
        {/* --- Sección Izquierda: FAQ y Guías --- */}
        <div className="help-main-content">
          
          {/* --- Preguntas Frecuentes (FAQ) --- */}
          <div className="card-container">
            <h3>Preguntas Frecuentes (FAQ)</h3>
            <div className="accordion">
              <AccordionItem title="¿Cómo puedo restablecer mi contraseña?">
                <p>Si olvidó su contraseña, puede hacer clic en el enlace "¿Olvidó su contraseña?" en la página de inicio de sesión. Se le enviará un correo electrónico con instrucciones para restablecerla.</p>
              </AccordionItem>
              <AccordionItem title="¿Qué significan los diferentes estados de una orden?">
                <ul>
                  <li><strong>PENDIENTE:</strong> La orden ha sido creada pero aún no se ha preparado para la entrega.</li>
                  <li><strong>EN PROCESO:</strong> El inventario para la orden está siendo preparado y asignado.</li>
                  <li><strong>ENTREGADO:</strong> La orden ha sido entregada satisfactoriamente a la institución.</li>
                  <li><strong>CANCELADO:</strong> La orden ha sido cancelada y no se procesará.</li>
                </ul>
              </AccordionItem>
              <AccordionItem title="¿Por qué un producto aparece con 'Stock Bajo'?">
                <p>Un producto se marca con "Stock Bajo" cuando su cantidad actual en inventario es igual o inferior al "Stock Mínimo" que se definió en su configuración. Esto sirve como una alerta para reabastecer el producto.</p>
              </AccordionItem>
            </div>
          </div>

          {/* --- Guías por Módulo --- */}
          <div className="card-container">
            <h3><FontAwesomeIcon icon={faBook} /> Guías por Módulo</h3>
            <div className="guides-grid">
              {Object.keys(guidesContent).map(title => (
                <div key={title} className="guide-item" onClick={() => handleGuideClick(title)}>
                  <FontAwesomeIcon icon={guidesContent[title].icon} />
                  <span>{title}</span>
                </div>
              ))}
            </div>
            {selectedGuide && (
              <div className="guide-detail-container">
                <div className="guide-detail-header">
                  <h4><FontAwesomeIcon icon={selectedGuide.icon} /> {Object.keys(guidesContent).find(key => guidesContent[key] === selectedGuide)}</h4>
                  <button onClick={handleCloseGuide} className="close-guide-btn">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <p>{selectedGuide.content}</p>
              </div>
            )}
          </div>

        </div>

        {/* --- Sección Derecha: Contacto y Sistema --- */}
        <div className="help-sidebar">
          
          {/* --- Contacto de Soporte --- */}
          <div className="card-container">
            <h3><FontAwesomeIcon icon={faEnvelope} /> Contactar a Soporte</h3>
            <p>¿No encontraste lo que buscabas? Envíanos un mensaje y te ayudaremos.</p>
            <form className="support-form" onSubmit={handleSupportSubmit}>
              <div className="form-group">
                <label htmlFor="supportSubject">Asunto</label>
                <input 
                  type="text" 
                  id="supportSubject" 
                  placeholder="Ej: Problema con reporte de inventario"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="supportMessage">Mensaje</label>
                <textarea 
                  id="supportMessage" 
                  rows="5" 
                  placeholder="Describe tu problema o pregunta en detalle..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="btn-primary">Enviar Mensaje</button>
            </form>
          </div>

           {/* --- Información del Sistema --- */}
          <div className="card-container system-info">
              <h3>Información del Sistema</h3>
              <p><strong>Versión de SICOENA:</strong> 1.0.0 (Build 20251015)</p>
              <p>Todos los sistemas operando normalmente.</p>
              <a href="#" onClick={handleVersionNotesClick}>Ver notas de la versión</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpPage;
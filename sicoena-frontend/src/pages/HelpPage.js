// src/pages/HelpPage.js

import React, { useState } from 'react';
import './HelpPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faChevronDown, faBook, faUsers, faBuilding, faBoxes, faTruck, faChartBar, faCog, faEnvelope } from '@fortawesome/free-solid-svg-icons';

// Componente para el Acordeón de FAQ
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

const HelpPage = () => {
  return (
    <div className="page-container help-page">
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
                <p>Si olvidó su contraseña, puede hacer clic en el enlace "¿Olvidó su contraseña?" en la página de inicio de sesión. Se le enviará un correo electrónico con instrucciones para crear una nueva.</p>
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
                <p>Un producto se marca con "Stock Bajo" cuando su cantidad actual en inventario es igual or inferior al "Stock Mínimo" que se definió en su configuración. Esto sirve como una alerta para realizar un nuevo pedido.</p>
              </AccordionItem>
            </div>
          </div>

          {/* --- Guías por Módulo --- */}
          <div className="card-container">
            <h3><FontAwesomeIcon icon={faBook} /> Guías por Módulo</h3>
            <div className="guides-grid">
                <div className="guide-item"><FontAwesomeIcon icon={faUsers} /><span>Gestión de Usuarios</span></div>
                <div className="guide-item"><FontAwesomeIcon icon={faBuilding} /><span>Gestión de Instituciones</span></div>
                <div className="guide-item"><FontAwesomeIcon icon={faBoxes} /><span>Gestión de Inventario</span></div>
                <div className="guide-item"><FontAwesomeIcon icon={faTruck} /><span>Gestión de Órdenes</span></div>
                <div className="guide-item"><FontAwesomeIcon icon={faChartBar} /><span>Reportes y Análisis</span></div>
                <div className="guide-item"><FontAwesomeIcon icon={faCog} /><span>Configuración del Sistema</span></div>
            </div>
          </div>

        </div>

        {/* --- Sección Derecha: Contacto y Sistema --- */}
        <div className="help-sidebar">
          
          {/* --- Contacto de Soporte --- */}
          <div className="card-container">
            <h3><FontAwesomeIcon icon={faEnvelope} /> Contactar a Soporte</h3>
            <p>¿No encontraste lo que buscabas? Envíanos un mensaje y te ayudaremos.</p>
            <form className="support-form">
              <div className="form-group">
                <label htmlFor="supportSubject">Asunto</label>
                <input type="text" id="supportSubject" placeholder="Ej: Problema con reporte de inventario" />
              </div>
              <div className="form-group">
                <label htmlFor="supportMessage">Mensaje</label>
                <textarea id="supportMessage" rows="5" placeholder="Describe tu problema o pregunta en detalle..."></textarea>
              </div>
              <button className="btn-primary">Enviar Mensaje</button>
            </form>
          </div>

           {/* --- Información del Sistema --- */}
          <div className="card-container system-info">
              <h3>Información del Sistema</h3>
              <p><strong>Versión de SICOENA:</strong> 1.0.0 (Build 20251015)</p>
              <p>Todos los sistemas operando normalmente.</p>
              <a href="#">Ver notas de la versión</a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpPage;
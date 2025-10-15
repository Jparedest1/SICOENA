// src/pages/SettingsPage.js

import React, { useState } from 'react';
import './SettingsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faShieldAlt, faEnvelope, faDatabase, faSave } from '@fortawesome/free-solid-svg-icons';

// Componente para una pestaña de configuración
const SettingsTab = ({ title, icon, children }) => (
  <div className="settings-tab-content">
    <h2><FontAwesomeIcon icon={icon} /> {title}</h2>
    {children}
  </div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Estados para los campos del formulario (puedes conectarlos a un backend)
  const [companyName, setCompanyName] = useState('PARSOL S.A.');
  const [companyNit, setCompanyNit] = useState('56874895');
  const [companyAddress, setCompanyAddress] = useState('Carretera a Santa Marta, Sumpango, Sac.');
  const [companyPhone, setCompanyPhone] = useState('54255632');
  const [companyEmail, setCompanyEmail] = useState('parsolgt@gmail.com');

  const handleSave = (section) => {
    // Lógica para guardar los datos de la sección 'section'
    alert(`Configuración de "${section}" guardada exitosamente (simulación).`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <SettingsTab title="Configuración General" icon={faBuilding}>
            <p className="tab-description">Información básica de la empresa y configuración regional del sistema.</p>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la Empresa</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>NIT</label>
                <input type="text" value={companyNit} onChange={(e) => setCompanyNit(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Dirección</label>
              <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono de Contacto</label>
                <input type="tel" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email de Contacto</label>
                <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
              </div>
            </div>
             <button className="btn-save-section" onClick={() => handleSave('General')}><FontAwesomeIcon icon={faSave} /> Guardar Cambios</button>
          </SettingsTab>
        );
      case 'seguridad':
        return (
          <SettingsTab title="Seguridad y Roles" icon={faShieldAlt}>
             <p className="tab-description">Gestiona los roles de usuario y las políticas de seguridad de la aplicación.</p>
             {/* Aquí iría la gestión de roles y permisos */}
             <h4>Roles de Usuario</h4>
             <p>Define qué puede hacer cada tipo de usuario en el sistema.</p>
             {/* Un ejemplo de UI para roles podría ir aquí */}
             <button className="btn-save-section" onClick={() => handleSave('Seguridad')}><FontAwesomeIcon icon={faSave} /> Guardar Cambios</button>
          </SettingsTab>
        );
      case 'notificaciones':
        return (
          <SettingsTab title="Notificaciones por Email" icon={faEnvelope}>
            <p className="tab-description">Configura cuándo y a quién se envían notificaciones automáticas.</p>
            <div className="form-group checkbox-group">
                <input type="checkbox" id="notifyLowStock" defaultChecked />
                <label htmlFor="notifyLowStock">Alertar sobre stock bajo en inventario.</label>
            </div>
            <div className="form-group checkbox-group">
                <input type="checkbox" id="notifyNewOrder" defaultChecked />
                <label htmlFor="notifyNewOrder">Notificar al crear una nueva orden de entrega.</label>
            </div>
            <button className="btn-save-section" onClick={() => handleSave('Notificaciones')}><FontAwesomeIcon icon={faSave} /> Guardar Cambios</button>
          </SettingsTab>
        );
      case 'respaldos':
        return (
          <SettingsTab title="Respaldos y Mantenimiento" icon={faDatabase}>
            <p className="tab-description">Administra las copias de seguridad de la base de datos.</p>
            <h4>Respaldos Automáticos</h4>
             <div className="form-group checkbox-group">
                <input type="checkbox" id="enableBackups" defaultChecked />
                <label htmlFor="enableBackups">Habilitar respaldos automáticos.</label>
            </div>
            <div className="form-group">
                <label>Frecuencia</label>
                <select>
                    <option>Diario (medianoche)</option>
                    <option>Semanal (domingo a medianoche)</option>
                    <option>Mensual (día 1 a medianoche)</option>
                </select>
            </div>
            <button className="btn-primary">Generar Respaldo Manual Ahora</button>
            <button className="btn-save-section" onClick={() => handleSave('Respaldos')}><FontAwesomeIcon icon={faSave} /> Guardar Cambios</button>
          </SettingsTab>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container settings-page">
      <div className="page-header">
        <h1>Configuración del Sistema</h1>
        <span className="breadcrumb">Inicio &gt; Configuración</span>
      </div>
      
      <div className="settings-layout">
        <nav className="settings-nav">
          <ul>
            <li className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
              <FontAwesomeIcon icon={faBuilding} /> General
            </li>
            <li className={activeTab === 'seguridad' ? 'active' : ''} onClick={() => setActiveTab('seguridad')}>
              <FontAwesomeIcon icon={faShieldAlt} /> Seguridad
            </li>
            <li className={activeTab === 'notificaciones' ? 'active' : ''} onClick={() => setActiveTab('notificaciones')}>
              <FontAwesomeIcon icon={faEnvelope} /> Notificaciones
            </li>
            <li className={activeTab === 'respaldos' ? 'active' : ''} onClick={() => setActiveTab('respaldos')}>
              <FontAwesomeIcon icon={faDatabase} /> Respaldos
            </li>
          </ul>
        </nav>
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
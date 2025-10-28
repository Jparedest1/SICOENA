// sicoena-frontend/src/pages/SettingsPage.js

import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faShieldAlt, 
  faEnvelope, 
  faDatabase, 
  faSave,
  faCog
} from '@fortawesome/free-solid-svg-icons';

const API_URL = 'http://localhost:5000/api';

// Componente para una pestaña de configuración
const SettingsTab = ({ title, icon, children }) => (
  <div className="settings-tab-content">
    <h2><FontAwesomeIcon icon={icon} /> {title}</h2>
    {children}
  </div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  // Estados para Configuración General
  const [companyName, setCompanyName] = useState('SICOENA');
  const [companyNit, setCompanyNit] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  // Estados para Configuración de Sistema
  const [backupFrequency, setBackupFrequency] = useState('diario');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [defaultCurrency, setDefaultCurrency] = useState('Q');
  const [systemLanguage, setSystemLanguage] = useState('es');

  // Estados para Seguridad
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(90);

  // Estados para Email
  const [smtpServer, setSmtpServer] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [emailFrom, setEmailFrom] = useState('');

  useEffect(() => {
    // Aquí podrías cargar las configuraciones del backend
    // fetchSettings();
  }, []);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async (section) => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      let payload = {};

      switch (section) {
        case 'general':
          payload = {
            companyName,
            companyNit,
            companyAddress,
            companyPhone,
            companyEmail
          };
          break;
        case 'sistema':
          payload = {
            defaultCurrency,
            systemLanguage,
            backupFrequency,
            enableNotifications
          };
          break;
        case 'seguridad':
          payload = {
            sessionTimeout,
            enableTwoFactor,
            passwordExpiry
          };
          break;
        case 'email':
          payload = {
            smtpServer,
            smtpPort,
            smtpUser,
            smtpPassword: smtpPassword, // ⚠️ Considerar encriptar esto
            emailFrom
          };
          break;
        default:
          break;
      }

      const response = await fetch(`${API_URL}/settings/seccion/${section}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar');
      }
      
      showMessage(`✅ Configuración guardada exitosamente.`, 'success');
    } catch (error) {
      console.error('Error al guardar:', error);
      showMessage(`❌ ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <SettingsTab title="Configuración General" icon={faBuilding}>
            <p className="tab-description">Información básica de la empresa y configuración regional del sistema.</p>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la Empresa <span className="required">*</span></label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ingrese el nombre de la empresa"
                />
              </div>
              <div className="form-group">
                <label>NIT <span className="required">*</span></label>
                <input 
                  type="text" 
                  value={companyNit} 
                  onChange={(e) => setCompanyNit(e.target.value)}
                  placeholder="Ingrese el NIT"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input 
                type="text" 
                value={companyAddress} 
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Ingrese la dirección"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono de Contacto</label>
                <input 
                  type="tel" 
                  value={companyPhone} 
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="Ingrese el teléfono"
                />
              </div>
              <div className="form-group">
                <label>Email de Contacto</label>
                <input 
                  type="email" 
                  value={companyEmail} 
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="Ingrese el email"
                />
              </div>
            </div>

            <button 
              className="btn-save-section" 
              onClick={() => handleSave('general')}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
          </SettingsTab>
        );

      case 'sistema':
        return (
          <SettingsTab title="Configuración del Sistema" icon={faCog}>
            <p className="tab-description">Configurar parámetros generales del sistema como copias de seguridad, notificaciones y preferencias regionales.</p>

            <div className="form-row">
              <div className="form-group">
                <label>Frecuencia de Respaldo</label>
                <select 
                  value={backupFrequency} 
                  onChange={(e) => setBackupFrequency(e.target.value)}
                >
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Moneda Predeterminada</label>
                <select 
                  value={defaultCurrency} 
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                >
                  <option value="Q">Quetzal (Q)</option>
                  <option value="$">Dólar ($)</option>
                  <option value="€">Euro (€)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Idioma del Sistema</label>
                <select 
                  value={systemLanguage} 
                  onChange={(e) => setSystemLanguage(e.target.value)}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={enableNotifications}
                    onChange={(e) => setEnableNotifications(e.target.checked)}
                  />
                  Habilitar Notificaciones
                </label>
              </div>
            </div>

            <button 
              className="btn-save-section" 
              onClick={() => handleSave('sistema')}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
          </SettingsTab>
        );

      case 'seguridad':
        return (
          <SettingsTab title="Seguridad y Roles" icon={faShieldAlt}>
            <p className="tab-description">Gestiona la seguridad de la aplicación, tiempos de sesión y políticas de contraseñas.</p>

            <div className="form-row">
              <div className="form-group">
                <label>Tiempo de Sesión (minutos)</label>
                <input 
                  type="number" 
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                  min="5"
                  max="480"
                />
                <small>Tiempo máximo de inactividad antes de cerrar sesión</small>
              </div>
              <div className="form-group">
                <label>Expiración de Contraseña (días)</label>
                <input 
                  type="number" 
                  value={passwordExpiry}
                  onChange={(e) => setPasswordExpiry(parseInt(e.target.value))}
                  min="30"
                  max="365"
                />
                <small>Los usuarios deben cambiar contraseña cada X días</small>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={enableTwoFactor}
                  onChange={(e) => setEnableTwoFactor(e.target.checked)}
                />
                Habilitar Autenticación de Dos Factores (2FA)
              </label>
            </div>

            <button 
              className="btn-save-section" 
              onClick={() => handleSave('seguridad')}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
          </SettingsTab>
        );

      case 'email':
        return (
          <SettingsTab title="Configuración de Email" icon={faEnvelope}>
            <p className="tab-description">Configura los parámetros SMTP para enviar notificaciones y reportes por correo electrónico.</p>

            <div className="form-group">
              <label>Servidor SMTP</label>
              <input 
                type="text" 
                value={smtpServer}
                onChange={(e) => setSmtpServer(e.target.value)}
                placeholder="ej: smtp.gmail.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Puerto SMTP</label>
                <input 
                  type="number" 
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                  placeholder="587"
                />
              </div>
              <div className="form-group">
                <label>Correo Remitente</label>
                <input 
                  type="email" 
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder="notificaciones@sicoena.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Usuario SMTP</label>
                <input 
                  type="text" 
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="Ingrese el usuario"
                />
              </div>
              <div className="form-group">
                <label>Contraseña SMTP</label>
                <input 
                  type="password" 
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="Ingrese la contraseña"
                />
              </div>
            </div>

            <button 
              className="btn-save-section" 
              onClick={() => handleSave('email')}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
          </SettingsTab>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Configuración del Sistema</h1>
      </div>

      {message && (
        <div className={`settings-message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="settings-layout">
        {/* Navegación de Pestañas (Izquierda) */}
        <nav className="settings-nav">
          <ul>
            <li 
              className={activeTab === 'general' ? 'active' : ''}
              onClick={() => setActiveTab('general')}
            >
              <FontAwesomeIcon icon={faBuilding} />
              General
            </li>
            <li 
              className={activeTab === 'sistema' ? 'active' : ''}
              onClick={() => setActiveTab('sistema')}
            >
              <FontAwesomeIcon icon={faCog} />
              Sistema
            </li>
            <li 
              className={activeTab === 'seguridad' ? 'active' : ''}
              onClick={() => setActiveTab('seguridad')}
            >
              <FontAwesomeIcon icon={faShieldAlt} />
              Seguridad
            </li>
            <li 
              className={activeTab === 'email' ? 'active' : ''}
              onClick={() => setActiveTab('email')}
            >
              <FontAwesomeIcon icon={faEnvelope} />
              Email
            </li>
          </ul>
        </nav>

        {/* Contenido de la Pestaña (Derecha) */}
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
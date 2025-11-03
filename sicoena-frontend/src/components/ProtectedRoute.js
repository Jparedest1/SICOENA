import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, userRole }) => {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  const normalizedUserRole = (userRole || '').toUpperCase().trim();
  const normalizedAllowedRoles = (allowedRoles || []).map(role => 
    (role || '').toUpperCase().trim()
  );

  console.log('🔐 Verificación de acceso:', {
    userRole: userRole,
    normalizedUserRole: normalizedUserRole,
    allowedRoles: allowedRoles,
    normalizedAllowedRoles: normalizedAllowedRoles,
    hasAccess: normalizedAllowedRoles.includes(normalizedUserRole)
  });

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <h1 style={{ color: '#dc3545', marginTop: 0 }}>Acceso Denegado</h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Rol insuficiente.
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Tu rol: <strong>{userRole}</strong>
          </p>
          <p style={{ fontSize: '12px', color: '#bbb' }}>
            Roles permitidos: <strong>{normalizedAllowedRoles.join(', ')}</strong>
          </p>
          <a 
            href="/dashboard" 
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '600'
            }}
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
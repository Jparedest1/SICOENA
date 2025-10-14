import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
// Importa las otras páginas que crearemos
import DashboardPage from './pages/DashboardPage';
// ...

import './App.css';

function App() {
  // Por ahora, asumimos que el usuario no está logueado
  const isLoggedIn = false; 

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="content-area">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Agrega aquí las demás rutas */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
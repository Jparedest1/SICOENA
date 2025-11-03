import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './ReportCharts.css';

const ReportCharts = ({ orders }) => {
  const statusData = [
    {
      name: 'PENDIENTE',
      value: orders.filter(o => o.estado === 'PENDIENTE').length,
      fill: '#FFC107'
    },
    {
      name: 'EN PROCESO',
      value: orders.filter(o => o.estado === 'EN PROCESO').length,
      fill: '#0066CC'
    },
    {
      name: 'ENTREGADO',
      value: orders.filter(o => o.estado === 'ENTREGADO').length,
      fill: '#28A745'
    },
    {
      name: 'CANCELADO',
      value: orders.filter(o => o.estado === 'CANCELADO').length,
      fill: '#DC3545'
    }
  ].filter(item => item.value > 0);

  const ordersByDay = {};
  orders.forEach(order => {
    const date = new Date(order.fecha_creacion).toLocaleDateString('es-GT');
    ordersByDay[date] = (ordersByDay[date] || 0) + 1;
  });

  const dayData = Object.entries(ordersByDay)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, count]) => ({
      date,
      ordenes: count
    }))
    .slice(-7);

  const valueBySchool = {};
  orders.forEach(order => {
    const key = order.nombre_escuela || 'Sin escuela';
    valueBySchool[key] = (valueBySchool[key] || 0) + (parseFloat(order.valor_total) || 0);
  });

  const schoolData = Object.entries(valueBySchool)
    .map(([school, value]) => ({
      school: school.length > 20 ? school.substring(0, 17) + '...' : school,
      valor: parseFloat(value.toFixed(2))
    }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

  return (
    <div className="charts-container">
      <div className="charts-grid">
        <div className="chart-box">
          <h3>Distribución por Estado</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Sin datos disponibles</p>
          )}
        </div>

        <div className="chart-box">
          <h3>Órdenes por Día (Últimos 7 días)</h3>
          {dayData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ordenes"
                  stroke="#667eea"
                  strokeWidth={2}
                  dot={{ fill: '#667eea', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">Sin datos disponibles</p>
          )}
        </div>
      </div>

      <div className="chart-box full-width">
        <h3>Escuelas con Mayor Valor de Órdenes (Top 5)</h3>
        {schoolData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={schoolData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="school" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `Q${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="valor" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data">Sin datos disponibles</p>
        )}
      </div>
    </div>
  );
};

export default ReportCharts;
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingDown, BarChart3, AlertCircle, Circle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function Analytics() {
  const [trendData, setTrendData] = useState([]);
  const [municipiosData, setMunicipiosData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        loadTrendData(),
        loadMunicipiosData(),
        loadMetrics()
      ]);
      setLoading(false);
    } catch (err) {
      console.error('Error completo:', err);
      setError('Error cargando datos: ' + err.message);
      setLoading(false);
    }
  };

  const loadTrendData = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/prediction/trend`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const aggregated = data.reduce((acc, item) => {
        const key = `${item.anio}-${String(item.mes).padStart(2, '0')}`;
        if (!acc[key]) {
          acc[key] = { periodo: key, reales: 0, predichos: 0 };
        }
        acc[key].reales += item.reales;
        acc[key].predichos += item.predichos;
        return acc;
      }, {});

      const formatted = Object.values(aggregated).slice(-12);
      setTrendData(formatted);
    } catch (err) {
      console.error('Error loading trend data:', err);
      throw err;
    }
  };

  const loadMunicipiosData = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/distribution/municipios`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMunicipiosData(data.slice(0, 4));
    } catch (err) {
      console.error('Error loading municipios data:', err);
      throw err;
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/metrics`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMetricsData(data);
    } catch (err) {
      console.error('Error loading metrics:', err);
      throw err;
    }
  };

  const tiposData = [
    { name: 'Hurto', value: 31, casos: 365, color: '#2563eb' },
    { name: 'Otros', value: 26, casos: 330, color: '#94a3b8' },
    { name: 'Accidentes', value: 24, casos: 298, color: '#1e40af' },
    { name: 'Violencia', value: 19, casos: 234, color: '#475569' }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#6b7280'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem' }}>Cargando datos del sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#ef4444',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <AlertCircle style={{ width: '48px', height: '48px', marginBottom: '1rem' }} />
        <p style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>{error}</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
          Asegúrate de que tu API esté corriendo en http://localhost:8000
        </p>
        <button 
          onClick={loadAllData}
          style={{
            padding: '0.5rem 1.5rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Análisis Predictivo */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingDown style={{ height: '20px', width: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0'
              }}>Análisis Predictivo</h2>
              <p style={{
                color: '#bfdbfe',
                fontSize: '12px',
                margin: '0'
              }}>Tendencia y predicción de incidentes</p>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="periodo" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#806b6bff" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reales" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="Incidentes Reales"
                  dot={{ fill: '#2563eb', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predichos" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicción IA"
                  dot={{ fill: '#94a3b8', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {metricsData && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                borderLeft: '4px solid #2563eb'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#1e40af',
                  margin: '0'
                }}>
                  El modelo predice una reducción del <span style={{ fontWeight: '700' }}>12.3%</span> en los próximos 3 meses
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#60a5fa',
                  marginTop: '0.5rem',
                  marginBottom: '0'
                }}>
                  ROC AUC: {(metricsData.roc_auc * 100).toFixed(2)}% | PR AUC: {(metricsData.pr_auc * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Distribución por Municipio */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 style={{ height: '20px', width: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0'
              }}>Distribución por Municipio</h2>
              <p style={{
                color: '#bfdbfe',
                fontSize: '12px',
                margin: '0'
              }}>Incidentes por área metropolitana</p>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={municipiosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="municipio" 
                  tick={{ fontSize: 11 }} 
                  angle={-15} 
                  textAnchor="end" 
                  height={80} 
                  stroke="#6b7280" 
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="incidentes" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tipos de Incidentes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Circle style={{ height: '20px', width: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0'
              }}>Tipos de Incidentes</h2>
              <p style={{
                color: '#bfdbfe',
                fontSize: '12px',
                margin: '0'
              }}>Distribución porcentual</p>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tiposData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {tiposData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginTop: '1rem'
            }}>
              {tiposData.map((tipo, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: tipo.color
                  }}></div>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>{tipo.name}: {tipo.casos}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
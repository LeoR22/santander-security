import { Suspense, lazy, useState, useEffect } from 'react';
import { Activity, Clock, TrendingUp, CheckCircle, AlertCircle, Info, MapPin, Calendar } from 'lucide-react';
import './Dashboard.css';

// Lazy imports
const MapView = lazy(() => import('./Map').then(m => ({ default: m.MapView })));
const PredictiveAnalytics = lazy(() => import('./Filters').then(m => ({ default: m.PredictiveAnalytics })));
const Chatbot = lazy(() => import('./Chatbot').then(m => ({ default: m.Chatbot })));
const Analytics = lazy(() => import('./Analytics'));

/* ----------------------------- StatsOverview Component ---------------------------- */

function StatsOverview() {
  const [stats, setStats] = useState({
    totalIncidents: { valor: 0, variacion_pct: 0 },
    responseTime: { valor: 0, variacion_pct: 0 },
    crimeRate: { valor: 0, variacion_pct: 0 },
    casesResolved: { valor: 0, variacion_pct: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [incidents, response, crime, resolved] = await Promise.all([
          fetch('http://localhost:8000/analytics/incidents/total').then(r => r.json()),
          fetch('http://localhost:8000/analytics/response-time').then(r => r.json()),
          fetch('http://localhost:8000/analytics/crime-rate').then(r => r.json()),
          fetch('http://localhost:8000/analytics/cases/resolved').then(r => r.json())
        ]);

        setStats({
          totalIncidents: incidents,
          responseTime: response,
          crimeRate: crime,
          casesResolved: resolved
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatVariation = (variation) => {
    if (!variation && variation !== 0) return 'N/A';
    const isPositive = variation > 0;
    const sign = isPositive ? '↑' : '↓';
    return `${sign} ${Math.abs(variation).toFixed(1)}% vs mes anterior`;
  };

  const getVariationColor = (variation, invertColors = false) => {
    if (!variation && variation !== 0) return '#6b7280';
    const isPositive = variation > 0;
    if (invertColors) {
      return isPositive ? '#dc2626' : '#16a34a';
    }
    return isPositive ? '#16a34a' : '#dc2626';
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            minHeight: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af'
          }}>
            Cargando...
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Incidentes Registrados',
      value: stats.totalIncidents.valor?.toLocaleString('es-CO') || '0',
      variation: stats.totalIncidents.variacion_pct,
      icon: Activity,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      invertColors: true
    },
    {
      title: 'Acumulado de Incidentes en los últimos 90 días ',
      value: stats.responseTime.valor !== "N/A" ? `${stats.responseTime.valor} ` : 'N/A',
      variation: stats.responseTime.variacion_pct,
      icon: Clock,
      color: '#06b6d4',
      bgColor: '#ecfeff',
      invertColors: true

    },
    {
      title: 'Tasa Departamental de Criminalidad',
      value: stats.crimeRate.valor?.toLocaleString('es-CO') || '0',
      variation: stats.crimeRate.variacion_pct,
      icon: TrendingUp,
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      invertColors: true
    },
    {
      title: 'Casos de Criminalidad Resueltos',
      value: stats.casesResolved.valor?.toLocaleString('es-CO') || '0',
      variation: stats.casesResolved.variacion_pct,
      icon: CheckCircle,
      color: '#10b981',
      bgColor: '#f0fdf4',
      invertColors: false
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    }}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Decorative background element */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              backgroundColor: card.bgColor,
              borderRadius: '50%',
              opacity: '0.5'
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <div style={{
                backgroundColor: card.bgColor,
                padding: '12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon style={{ 
                  height: '24px', 
                  width: '24px', 
                  color: card.color 
                }} />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#806b6bff',
                margin: '0 0 8px 0'
              }}>
                {card.title}
              </h3>

              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 12px 0',
                lineHeight: '1'
              }}>
                {card.value}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: getVariationColor(card.variation, card.invertColors)
                }}>
                  {formatVariation(card.variation)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- Dashboard tabs ---------------------------- */

function DashboardTab() {
  return (
    <div className="dashboard">
      {/* Stats */}
      <div className="dashboard-section">
        <StatsOverview />
      </div>

      {/* Filters */}
      <div className="dashboard-section">
        <div className="card-wrapper">
          <Suspense fallback={<div style={{ padding: '2rem' }}>Cargando análisis...</div>}>
            <PredictiveAnalytics />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Alerts Tab ------------------------------ */

function AlertsTab() {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('todos');

  useEffect(() => {
    fetch('http://localhost:8000/crimes/recent')
      .then(res => res.json())
      .then(data => {
        setIncidents(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching incidents:', err);
        setIncidents([]);
        setIsLoading(false);
      });
  }, []);

  const tipoLabels = {
    'violencia_intrafamiliar': 'Violencia intrafamiliar',
    'hurto_personas': 'Hurto a personas',
    'accidente_transito': 'Accidente de tránsito',
    'hurto_comercio': 'Hurto a comercio',
    'riña': 'Riña',
    'hurto_residencia': 'Hurto a residencia',
    'atraco': 'Atraco',
    'vandalismo': 'Vandalismo',
  };

  const filteredIncidents =
    filterSeverity === 'todos'
      ? incidents
      : incidents.filter(i => i.severidad === filterSeverity);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      padding: '24px' 
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto' 
      }}>
        
        {/* Header Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            padding: '16px 24px',
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
              <Info style={{ height: '20px', width: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                margin: '0'
              }}>Incidentes Recientes</h2>
              <p style={{
                color: '#bfdbfe',
                fontSize: '14px',
                margin: '0'
              }}>Últimos reportes de la Policía Nacional</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(255, 7, 7, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Table */}
          {isLoading ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              Cargando incidentes...
            </div>
          ) : filteredIncidents.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse' 
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>ID</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Tipo</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Descripción</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Ubicación</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Fecha</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Severidad</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((inc, idx) => (
                    <tr 
                      key={idx}
                      style={{
                        borderBottom: '1px solid #0c327eff',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827',
                        whiteSpace: 'nowrap'
                      }}>
                        {inc.id || `#${String(idx + 1).padStart(3, '0')}`}
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            backgroundColor: '#dbeafe',
                            padding: '6px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Info style={{ height: '14px', width: '14px', color: '#2563eb' }} />
                          </div>
                          <span style={{
                            fontSize: '14px',
                            color: '#111827',
                            fontWeight: '500'
                          }}>
                            {tipoLabels[inc.tipo] || inc.tipo || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        color: '#374151',
                        maxWidth: '300px'
                      }}>
                        {inc.descripcion || 'Sin descripción'}
                      </td>
                      <td style={{
                        padding: '16px 24px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}>
                          <MapPin style={{
                            height: '16px',
                            width: '16px',
                            color: '#9ca3af',
                            marginTop: '2px',
                            flexShrink: 0
                          }} />
                          <div style={{ fontSize: '14px' }}>
                            <div style={{
                              color: '#111827',
                              fontWeight: '500'
                            }}>
                              {inc.ubicacion || inc.municipio || `${inc.lat}, ${inc.lon}` || 'N/A'}
                            </div>
                            {inc.municipio && inc.ubicacion && (
                              <div style={{
                                color: '#6b7280',
                                fontSize: '12px'
                              }}>
                                {inc.municipio}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Calendar style={{ height: '16px', width: '16px', color: '#9ca3af' }} />
                          <span style={{
                            fontSize: '14px',
                            color: '#374151'
                          }}>
                            {inc.fecha ? new Date(inc.fecha).toLocaleString('es-CO', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).replace(',', '') : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        whiteSpace: 'nowrap'
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'inline-block',
                          ...(inc.severidad === 'crítica' && {
                            backgroundColor: '#fef2f2',
                            color: '#b91c1c'
                          }),
                          ...(inc.severidad === 'alta' && {
                            backgroundColor: '#fff7ed',
                            color: '#c2410c'
                          }),
                          ...(inc.severidad === 'media' && {
                            backgroundColor: '#fefce8',
                            color: '#a16207'
                          }),
                          ...(inc.severidad === 'baja' && {
                            backgroundColor: '#f0fdf4',
                            color: '#15803d'
                          }),
                          ...(!inc.severidad && {
                            backgroundColor: '#f9fafb',
                            color: '#374151'
                          })
                        }}>
                          {inc.severidad || 'N/A'}
                        </span>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        whiteSpace: 'nowrap'
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '500',
                          display: 'inline-block',
                          ...(inc.estado === 'En Atención' && {
                            backgroundColor: '#fefce8',
                            color: '#a16207'
                          }),
                          ...(inc.estado === 'Resuelto' && {
                            backgroundColor: '#f0fdf4',
                            color: '#15803d'
                          }),
                          ...(inc.estado === 'Reportado' && {
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8'
                          }),
                          ...(!inc.estado && {
                            backgroundColor: '#f9fafb',
                            color: '#374151'
                          })
                        }}>
                          {inc.estado || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              No hay incidentes disponibles
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ---------------------------- EXPORT VIEW --------------------------- */

export function DashboardView({ activeNav = 'dashboard' }) {
  switch (activeNav) {
    case 'alerts': return <AlertsTab />;
    case 'dashboard': return <DashboardTab />;
    case 'chat': return <Chatbot />;
    case 'analysis': return <Analytics />;
    case 'map': return <MapView />;
    default: return <DashboardTab />;
  }
}
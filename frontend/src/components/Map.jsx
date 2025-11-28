import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getIncidents } from '../services/analytics';
import { Flame, AlertTriangle, ShieldAlert, CheckCircle, MapPin, Clock, Activity, Layers } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import './Map.css';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Configuración de severidad con íconos de Lucide React
const severityConfig = {
  crítica: { 
    icon: Flame, 
    color: '#dc2626', 
    bgColor: '#fee2e2',
    label: 'Crítica',
    size: 24
  },
  alta: { 
    icon: AlertTriangle, 
    color: '#ea580c', 
    bgColor: '#ffedd5',
    label: 'Alta',
    size: 22
  },
  media: { 
    icon: ShieldAlert, 
    color: '#f59e0b', 
    bgColor: '#fef3c7',
    label: 'Media',
    size: 20
  },
  baja: { 
    icon: CheckCircle, 
    color: '#16a34a', 
    bgColor: '#dcfce7',
    label: 'Baja',
    size: 18
  },
};

// Crear icono personalizado con React Icons
const createCustomIcon = (severidad) => {
  const config = severityConfig[severidad?.toLowerCase()] || severityConfig.baja;
  const IconComponent = config.icon;
  
  const iconHtml = renderToStaticMarkup(
    <div style={{
      background: config.bgColor,
      borderRadius: '50%',
      border: `3px solid ${config.color}`,
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      <IconComponent 
        size={config.size} 
        color={config.color}
        strokeWidth={2.5}
      />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export function MapView() {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('todos');
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    getIncidents()
      .then((data) => {
        console.log('Incidents loaded:', data);
        setIncidents(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading incidents:', err);
        setError('Error al cargar los incidentes');
        setIncidents([]);
        setIsLoading(false);
      });
  }, []);

  const filteredIncidents = selectedSeverity === 'todos'
    ? incidents
    : incidents.filter(inc => inc.severidad?.toLowerCase() === selectedSeverity);

  const severityCounts = {
    crítica: incidents.filter(i => i.severidad?.toLowerCase() === 'crítica').length,
    alta: incidents.filter(i => i.severidad?.toLowerCase() === 'alta').length,
    media: incidents.filter(i => i.severidad?.toLowerCase() === 'media').length,
    baja: incidents.filter(i => i.severidad?.toLowerCase() === 'baja').length,
  };

  return (
    <div className="w-full h-full flex flex-col rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '600px' }}>
      {/* Header con fondo azul */}
      <div style={{ 
        backgroundColor: '#3b82f6', 
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            color: 'white', 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '4px',
            margin: 0
          }}>
            Mapa de Incidentes
          </h1>
          <p style={{ 
            color: 'white', 
            fontSize: '14px',
            margin: 0,
            opacity: 0.9
          }}>
            Departamento de Santander
          </p>
        </div>
        
        {/* Botones de filtro a la derecha */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setSelectedSeverity('todos')}
            style={{
              backgroundColor: selectedSeverity === 'todos' ? '#1e40af' : 'white',
              color: selectedSeverity === 'todos' ? 'white' : '#1f2937',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            <Layers size={16} />
            <span>Todos</span>
            <span style={{
              backgroundColor: selectedSeverity === 'todos' ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {incidents.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedSeverity('crítica')}
            style={{
              backgroundColor: selectedSeverity === 'crítica' ? '#dc2626' : 'white',
              color: selectedSeverity === 'crítica' ? 'white' : '#dc2626',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            <Flame size={16} />
            <span>Crítica</span>
            <span style={{
              backgroundColor: selectedSeverity === 'crítica' ? 'rgba(255,255,255,0.25)' : '#fee2e2',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: selectedSeverity === 'crítica' ? 'white' : '#dc2626'
            }}>
              {severityCounts.crítica}
            </span>
          </button>

          <button
            onClick={() => setSelectedSeverity('alta')}
            style={{
              backgroundColor: selectedSeverity === 'alta' ? '#ea580c' : 'white',
              color: selectedSeverity === 'alta' ? 'white' : '#ea580c',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            <AlertTriangle size={16} />
            <span>Alta</span>
            <span style={{
              backgroundColor: selectedSeverity === 'alta' ? 'rgba(255,255,255,0.25)' : '#ffedd5',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: selectedSeverity === 'alta' ? 'white' : '#ea580c'
            }}>
              {severityCounts.alta}
            </span>
          </button>

          <button
            onClick={() => setSelectedSeverity('media')}
            style={{
              backgroundColor: selectedSeverity === 'media' ? '#f59e0b' : 'white',
              color: selectedSeverity === 'media' ? 'white' : '#f59e0b',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            <ShieldAlert size={16} />
            <span>Media</span>
            <span style={{
              backgroundColor: selectedSeverity === 'media' ? 'rgba(255,255,255,0.25)' : '#fef3c7',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: selectedSeverity === 'media' ? 'white' : '#f59e0b'
            }}>
              {severityCounts.media}
            </span>
          </button>

          <button
            onClick={() => setSelectedSeverity('baja')}
            style={{
              backgroundColor: selectedSeverity === 'baja' ? '#16a34a' : 'white',
              color: selectedSeverity === 'baja' ? 'white' : '#16a34a',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            <CheckCircle size={16} />
            <span>Baja</span>
            <span style={{
              backgroundColor: selectedSeverity === 'baja' ? 'rgba(255,255,255,0.25)' : '#dcfce7',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: selectedSeverity === 'baja' ? 'white' : '#16a34a'
            }}>
              {severityCounts.baja}
            </span>
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative bg-gray-100" style={{ minHeight: '450px', height: '450px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 font-medium"></p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-[1000]">
            <div className="text-center p-6">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {!isLoading && !error && (
          <MapContainer
            center={[6.5, -73.5]}
            zoom={11}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredIncidents.map((incident, idx) => {
              if (!incident.lat || !incident.lon) return null;

              const severidad = incident.severidad?.toLowerCase() || 'baja';
              const config = severityConfig[severidad] || severityConfig.baja;
              const IconComponent = config.icon;

              return (
                <Marker
                  key={`${incident.lat}-${incident.lon}-${idx}`}
                  position={[incident.lat, incident.lon]}
                  icon={createCustomIcon(incident.severidad)}
                >
                  <Popup maxWidth={320} className="custom-popup">
                    <div className="p-3">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b-2" style={{ borderColor: config.color }}>
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: config.bgColor }}
                        >
                          <IconComponent size={24} color={config.color} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-base" style={{ color: config.color }}>
                            Severidad: {config.label}
                          </h3>
                          <p className="text-xs text-gray-500">Incidente #{idx + 1}</p>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                              {incident.municipio || 'Municipio no especificado'}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                              📍 {incident.lat?.toFixed(4)}, {incident.lon?.toFixed(4)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-gray-500" />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Estado:</span>
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{
                                backgroundColor: config.bgColor,
                                color: config.color,
                              }}
                            >
                              {incident.estado || 'Desconocido'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {new Date().toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t flex gap-2">
                        <button
                          className="flex-1 text-xs py-2 px-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity shadow-sm"
                          style={{ backgroundColor: config.color }}
                        >
                          Ver detalles
                        </button>
                        <button className="flex-1 text-xs py-2 px-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                          Reportar
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Footer con estadísticas mejorado */}
      <div style={{ 
        padding: '16px 24px', 
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px' 
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0'
            }}>
              Total
            </p>
            <p style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#111827',
              margin: 0
            }}>
              {incidents.length}
            </p>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            border: '1px solid #bfdbfe'
          }}>
            <p style={{ 
              fontSize: '12px', 
              color: '#1e40af', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0'
            }}>
              Mostrando
            </p>
            <p style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#1e40af',
              margin: 0
            }}>
              {filteredIncidents.length}
            </p>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#fff7ed',
            borderRadius: '12px',
            border: '1px solid #fed7aa'
          }}>
            <p style={{ 
              fontSize: '12px', 
              color: '#c2410c', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0'
            }}>
              En Atención
            </p>
            <p style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#c2410c',
              margin: 0
            }}>
              {incidents.filter(i => i.estado === 'En Atención').length}
            </p>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#faf5ff',
            borderRadius: '12px',
            border: '1px solid #e9d5ff'
          }}>
            <p style={{ 
              fontSize: '12px', 
              color: '#7c3aed', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 8px 0'
            }}>
              Municipios
            </p>
            <p style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#7c3aed',
              margin: 0
            }}>
              {new Set(incidents.map(i => i.municipio)).size}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
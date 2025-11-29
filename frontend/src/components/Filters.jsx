import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { TrendingUp, MapPin, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPredictionTrend, getMunicipiosDistribution } from '../services/analytics';
import './Filters.css';

export function PredictiveAnalytics({ predictionData, municipalityData, incidentTypeData }) {
  const [localPredictionData, setLocalPredictionData] = useState(predictionData || null);
  const [localMunicipalityData, setLocalMunicipalityData] = useState(municipalityData || []);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isLoadingMunicipality, setIsLoadingMunicipality] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    // Fetch prediction data from /risk/predict endpoint
    if (!predictionData) {
      setIsLoadingPrediction(true);
      // Asumiendo que tienes una función para obtener la predicción de riesgo
      // Si no la tienes, agrégala a tu archivo de servicios
      fetch('http://localhost:8000/analytics/risk/predict') // Ajusta la URL según tu configuración
        .then(response => response.json())
        .then((data) => {
          console.log('Datos de predicción recibidos:', data);
          setLocalPredictionData(data);
        })
        .catch((err) => {
          console.error('Error fetching risk prediction:', err);
          setLocalPredictionData(null);
        })
        .finally(() => setIsLoadingPrediction(false));
    }
  }, [predictionData]);

  useEffect(() => {
    // Fetch municipality distribution if not provided
    if (!municipalityData || municipalityData.length === 0) {
      setIsLoadingMunicipality(true);
      getMunicipiosDistribution()
        .then((data) => {
          const transformed = Array.isArray(data) ? data.map(item => ({
            name: item.municipio,
            incidents: item.incidentes || 0,
          })) : [];
          setLocalMunicipalityData(transformed);
        })
        .catch((err) => {
          console.error('Error fetching municipios distribution:', err);
          setLocalMunicipalityData([]);
        })
        .finally(() => setIsLoadingMunicipality(false));
    }
  }, [municipalityData]);

  // Cálculos para paginación
  const totalPages = Math.ceil(localMunicipalityData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMunicipalities = localMunicipalityData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="analytics-grid">
      {/* Predictive Analysis Chart */}
<Card className="analytics-card">
  <div className="analytics-header prediction-header">
    <div className="header-icon-wrapper">
      <TrendingUp />
    </div>
    <div className="header-text-content">
      <h3>Análisis Predictivo</h3>
      <p>Tendencia y predicción de incidentes</p>
    </div>
  </div>

  <div className="analytics-content">
    {/* Estado de carga */}
    {isLoadingPrediction && (
      <div className="mt-4 p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-sm text-gray-600">Cargando datos de predicción...</p>
      </div>
    )}

    {/* Estado sin datos */}
    {!isLoadingPrediction && !localPredictionData && (
      <div className="mt-4 p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-2">⚠️ No hay datos de predicción disponibles</p>
        <p className="text-xs text-gray-500">Verifica la conexión con el servidor</p>
      </div>
    )}

    {/* Datos cargados exitosamente */}
    {!isLoadingPrediction && localPredictionData && (
      <div className="space-y-4">
        {/* Probabilidad General */}
        {localPredictionData.probability !== undefined && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-900">
                Probabilidad General de Incidentes
              </span>
              <span className="text-2xl font-bold text-blue-700">
                {(localPredictionData.probability * 100).toFixed(2)}%
              </span>
            </div>
            {localPredictionData.anio && localPredictionData.mes && (
              <p className="text-xs text-blue-700 mt-2">
                Predicción para: {localPredictionData.mes}/{localPredictionData.anio}
              </p>
            )}
          </div>
        )}

        {/* Contexto Narrativo */}
        {localPredictionData.contexto && (
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-lg shadow-sm">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <span>📊</span>
              Análisis Contextual
            </h4>
            <p className="text-sm text-indigo-800 mb-3 leading-relaxed">
              {localPredictionData.contexto.mensaje}
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white bg-opacity-50 p-2 rounded">
                <span className="font-semibold text-indigo-700">Género:</span>
                <p className="text-indigo-600">{localPredictionData.contexto.genero_predominante}</p>
              </div>
              <div className="bg-white bg-opacity-50 p-2 rounded">
                <span className="font-semibold text-indigo-700">Grupo Etario:</span>
                <p className="text-indigo-600">{localPredictionData.contexto.grupo_etario_predominante}</p>
              </div>
              <div className="bg-white bg-opacity-50 p-2 rounded">
                <span className="font-semibold text-indigo-700">Día Crítico:</span>
                <p className="text-indigo-600">{localPredictionData.contexto.dia_semana_critico}</p>
              </div>
              <div className="bg-white bg-opacity-50 p-2 rounded">
                <span className="font-semibold text-indigo-700">Franja Horaria:</span>
                <p className="text-indigo-600">{localPredictionData.contexto.franja_horaria_critica}</p>
              </div>
              <div className="bg-white bg-opacity-50 p-2 rounded col-span-2">
                <span className="font-semibold text-indigo-700">Tipo de Delito:</span>
                <p className="text-indigo-600">{localPredictionData.contexto.tipo_delito_predominante}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ranking de Municipios */}
        {(() => {
          const ranking = localPredictionData.ranking_municipios || localPredictionData.ranking || [];
          
          if (ranking.length === 0) {
            return (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-500">No hay ranking de municipios disponible</p>
              </div>
            );
          }

          return (
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🏆</span>
                Top 5 Municipios Críticos
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Ranking</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Municipio</th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-700">Probabilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <span className={`
                            inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                            ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                            ${idx === 1 ? 'bg-gray-300 text-gray-700' : ''}
                            ${idx === 2 ? 'bg-orange-300 text-orange-900' : ''}
                            ${idx > 2 ? 'bg-gray-100 text-gray-600' : ''}
                          `}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-medium text-gray-800">
                          {item.municipio}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={`
                            inline-block px-3 py-1 rounded-full text-xs font-semibold
                            ${item.probabilidad > 0.7 ? 'bg-red-100 text-red-700' : ''}
                            ${item.probabilidad > 0.4 && item.probabilidad <= 0.7 ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${item.probabilidad <= 0.4 ? 'bg-green-100 text-green-700' : ''}
                          `}>
                            {(item.probabilidad * 100).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>
    )}
  </div>
</Card>
      {/* Municipality Distribution */}
      <Card className="analytics-card">
        <div className="analytics-header municipality-header">
          <div className="header-icon-wrapper">
            <MapPin />
          </div>
          <div className="header-text-content">
            <h3>Distribución por Municipio</h3>
            <p>Incidentes por área metropolitana</p>
          </div>
        </div>
        <div className="analytics-content">
          <div className="municipality-list">
            {isLoadingMunicipality ? (
              <div className="placeholder">Cargando datos...</div>
            ) : currentMunicipalities.length > 0 ? (
              currentMunicipalities.map((item, index) => {
                const maxIncidents = Math.max(...localMunicipalityData.map(m => m.incidents), 1);
                return (
                  <div key={index} className="municipality-item">
                    <span className="municipality-name">{item.name}</span>
                    <div className="municipality-bar">
                      <div 
                        className="bar-fill"
                        style={{ width: `${(item.incidents / maxIncidents * 100)}%` }}
                      ></div>
                    </div>
                    <span className="municipality-count">{item.incidents}</span>
                  </div>
                );
              })
            ) : (
              <div className="placeholder">No hay datos disponibles</div>
            )}
          </div>
          
          {/* Controles de paginación */}
          {localMunicipalityData.length > itemsPerPage && (
            <div className="flex items-center justify-center gap-4 mt-4 px-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="text-sm">Anterior</span>
              </button>
              
              <span className="text-sm text-gray-600">
                Página {currentPage + 1} de {totalPages}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm">Siguiente</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Incident Type Distribution */}
      {incidentTypeData && incidentTypeData.length > 0 && (
        <Card className="analytics-card full-width">
          <div className="analytics-header incidents-header">
            <div className="header-icon-wrapper">
              <Target />
            </div>
            <div className="header-text-content">
              <h3>Tipos de Incidentes</h3>
              <p>Distribución por categoría</p>
            </div>
          </div>
          <div className="analytics-content">
            <div className="incidents-grid">
              {incidentTypeData.map((item, index) => (
                <div key={index} className="incident-type-card">
                  <div className="incident-color" style={{ backgroundColor: item.color }}></div>
                  <div className="incident-info">
                    <p className="incident-name">{item.name}</p>
                    <p className="incident-count">{item.value} casos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
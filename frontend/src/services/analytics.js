import axios from 'axios';

// Base URL for API (in .env → VITE_API_BASE=http://localhost:8000)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Health check
export async function getHealth() {
  const res = await api.get('/health');
  return res.data;
}

// Metrics
export async function getMetrics() {
  const res = await api.get('/analytics/metrics');
  return res.data;
}

export async function getPredictionTrend() {
  const res = await api.get('/analytics/prediction/trend');
  return res.data;
}

// Predict risk
export async function predictRisk({
  municipio,
  anio = new Date().getFullYear(),
  mes = new Date().getMonth() + 1
}) {
  const res = await api.get('/analytics/risk/predict', {
    params: { municipio, anio, mes },
  });
  return res.data;
}

export async function getMunicipiosDistribution() {
  const res = await api.get('/analytics/distribution/municipios');
  return res.data;
}

// GEO — INCIDENTS ✔ CORRECTO
export async function getIncidents() {
  const res = await api.get('/geo/incidents');
  return res.data;
}

// Crimes
export async function getCrimesRecent() {
  const res = await api.get('/crimes/recent');
  return res.data;
}

export async function queryCrimes(body) {
  const res = await api.post('/crimes/query', body);
  return res.data;
}

// Chatbot
export async function chatbotAsk({ pregunta, municipio = '', delito = '' }) {
  const res = await api.post('/chatbot/ask', { pregunta, municipio, delito });
  return res.data;
}

export async function chatbotQuick(tipo, municipio = '') {
  const res = await api.get(`/chatbot/quick/${tipo}`, {
    params: { municipio },
  });
  return res.data;
}

export default {
  getHealth,
  getMetrics,
  getPredictionTrend,
  predictRisk,
  getMunicipiosDistribution,
  getIncidents,
  getCrimesRecent,
  queryCrimes,
  chatbotAsk,
  chatbotQuick,
};

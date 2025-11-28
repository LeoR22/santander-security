# API Endpoints Reference

## Base URL
`http://localhost:8000`

## Default
### Health Check
- **GET** `/health`
- **Description:** Health status of the API
- **Response:** `{ "status": "healthy" }`

---

## Analytics
### 1. Get Metrics
- **GET** `/analytics/metrics`
- **Description:** Obtener métricas generales del sistema
- **Response:** Array of metrics
```json
[
  {
    "title": "string",
    "value": "number|string",
    "change": "string",
    "trend": "up|down|neutral"
  }
]
```

### 2. Get Prediction Trend
- **GET** `/analytics/prediction/trend`
- **Description:** Predicción de tendencias de incidentes
- **Response:** Array of trend data
```json
[
  {
    "date": "string",
    "incidents": "number",
    "predicted": "number"
  }
]
```

### 3. Risk Prediction
- **GET** `/analytics/risk/predict`
- **Parameters:**
  - `municipio` (string, optional): Municipality name
  - `anio` (int, optional): Year (default: current year)
  - `mes` (int, optional): Month (default: current month)
- **Description:** Predicción de riesgos por municipio
- **Response:** Risk prediction data
```json
{
  "risk_level": "baja|media|alta|crítica",
  "probability": "number",
  "incidents_predicted": "number"
}
```

### 4. Municipality Distribution
- **GET** `/analytics/distribution/municipios`
- **Description:** Distribución de incidentes por municipio
- **Response:** Array of municipalities
```json
[
  {
    "name": "string",
    "incidents": "number",
    "percentage": "number"
  }
]
```

---

## Geo
### Get Geospatial Incidents
- **GET** `/geo/incidents`
- **Description:** Obtener incidentes con ubicación geoespacial
- **Response:** Array of incidents
```json
[
  {
    "lat": "number",
    "lon": "number",
    "severidad": "crítica|alta|media|baja",
    "estado": "activo|resuelto|pendiente",
    "municipio": "string"
  }
]
```

---

## Crimes
### 1. Get Recent Crimes
- **GET** `/crimes/recent`
- **Description:** Obtener los crímenes más recientes
- **Response:** Array of recent crimes
```json
[
  {
    "id": "string",
    "tipo": "string",
    "municipio": "string",
    "fecha": "string",
    "descripcion": "string"
  }
]
```

### 2. Query Crimes
- **POST** `/crimes/query`
- **Body:**
```json
{
  "departamento": "SANTANDER",
  "municipio": "string (optional)",
  "tipo_delito": "string (optional)",
  "anio": "number",
  "mes": "number",
  "limit": "number"
}
```
- **Description:** Consultar crímenes con filtros avanzados
- **Response:** Array of matching crimes

---

## Chatbot
### 1. Quick Response
- **GET** `/chatbot/quick/{tipo}`
- **Parameters:**
  - `{tipo}` (path): Type of quick response
    - Values: `general`, `recientes`, `todos`, `seguridad`
  - `municipio` (query, optional): Municipality filter
- **Description:** Respuestas rápidas del chatbot
- **Response:**
```json
{
  "answer": "string"
}
```

### 2. Ask Question
- **POST** `/chatbot/ask`
- **Body:**
```json
{
  "pregunta": "string",
  "municipio": "string (optional)",
  "delito": "string (optional)"
}
```
- **Description:** Realizar consultas generales al chatbot
- **Response:**
```json
{
  "answer": "string",
  "confidence": "number (optional)"
}
```

---

## Frontend Service Functions

All endpoints are wrapped in `src/services/analytics.js`:

```javascript
// Health
import { getHealth } from '../services/analytics';

// Analytics
import { getMetrics, getPredictionTrend, predictRisk, getMunicipiosDistribution } from '../services/analytics';

// Geo
import { getIncidents } from '../services/analytics';

// Crimes
import { getCrimesRecent, queryCrimes } from '../services/analytics';

// Chatbot
import { chatbotAsk, chatbotQuick } from '../services/analytics';
```

### Example Usage:

```javascript
// Get metrics
const metrics = await getMetrics();

// Predict risk for a municipality
const risk = await predictRisk({ 
  municipio: 'Bucaramanga', 
  anio: 2025, 
  mes: 11 
});

// Get chatbot quick response
const answer = await chatbotQuick('recientes');

// Query crimes with filters
const crimes = await queryCrimes({
  departamento: 'SANTANDER',
  municipio: 'Bucaramanga',
  anio: 2025,
  mes: 11
});
```

---

## Environment Configuration

Create `.env` in the frontend root:
```
VITE_API_BASE=http://localhost:8000
```

---

## Components Using Each Endpoint

| Component | Endpoints Used |
|-----------|----------------|
| `StatsCard` | `/analytics/metrics` |
| `Map` | `/geo/incidents` |
| `Filters` (PredictiveAnalytics) | `/analytics/prediction/trend`, `/analytics/distribution/municipios` |
| `Chatbot` | `/chatbot/quick/{tipo}`, `/chatbot/ask` |
| Service Layer | All endpoints |

---

## Status Codes

- **200**: Successful response
- **400**: Bad request (invalid parameters)
- **404**: Resource not found
- **500**: Internal server error

---

Last Updated: 2025-11-26

# Guía Completa: Cómo Probar los Endpoints en Localhost

## Prerequisitos

1. **Backend corriendo**: Asegúrate que FastAPI está ejecutándose
   ```powershell
   cd c:\Users\gisse\santander-security
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend corriendo** (opcional para pruebas manuales):
   ```powershell
   cd c:\Users\gisse\santander-security\frontend
   npm run dev
   ```

---

## Opción 1: Usando PowerShell (Recomendado para Windows)

### Comando Básico: GET

```powershell
# Health Check
Invoke-WebRequest -Uri "http://localhost:8000/health" -Method Get

# Ver la respuesta en JSON
$response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### GET con Parámetros

```powershell
# Analytics - Metrics
$response = Invoke-WebRequest -Uri "http://localhost:8000/analytics/metrics" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json

# Geo - Incidents
$response = Invoke-WebRequest -Uri "http://localhost:8000/geo/incidents" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json

# Crimes - Recent
$response = Invoke-WebRequest -Uri "http://localhost:8000/crimes/recent" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json

# Prediction Trend
$response = Invoke-WebRequest -Uri "http://localhost:8000/analytics/prediction/trend" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json

# Distribution Municipios
$response = Invoke-WebRequest -Uri "http://localhost:8000/analytics/distribution/municipios" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### GET con Query Parameters

```powershell
# Risk Predict (con parámetros)
$params = @{
    municipio = "Bucaramanga"
    anio = 2025
    mes = 11
}
$uri = "http://localhost:8000/analytics/risk/predict?" + 
    ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"

$response = Invoke-WebRequest -Uri $uri -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json

# Chatbot Quick (con path y query params)
$response = Invoke-WebRequest -Uri "http://localhost:8000/chatbot/quick/recientes?municipio=Bucaramanga" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Comando POST

```powershell
# Crimes Query
$body = @{
    departamento = "SANTANDER"
    municipio = "Bucaramanga"
    tipo_delito = "hurto"
    anio = 2025
    mes = 11
    limit = 10
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8000/crimes/query" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json

# Chatbot Ask
$body = @{
    pregunta = "Cuáles son los crímenes recientes?"
    municipio = "Bucaramanga"
    delito = ""
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8000/chatbot/ask" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

---

## Opción 2: Usando cURL (Git Bash o PowerShell con curl.exe)

### GET Requests

```bash
# Health Check
curl http://localhost:8000/health

# Metrics
curl http://localhost:8000/analytics/metrics

# Geo Incidents
curl http://localhost:8000/geo/incidents

# Prediction Trend
curl http://localhost:8000/analytics/prediction/trend

# Distribution Municipios
curl http://localhost:8000/analytics/distribution/municipios

# Crimes Recent
curl http://localhost:8000/crimes/recent

# Risk Predict con parámetros
curl "http://localhost:8000/analytics/risk/predict?municipio=Bucaramanga&anio=2025&mes=11"

# Chatbot Quick
curl "http://localhost:8000/chatbot/quick/recientes?municipio=Bucaramanga"
```

### POST Requests

```bash
# Crimes Query
curl -X POST http://localhost:8000/crimes/query \
  -H "Content-Type: application/json" \
  -d '{
    "departamento": "SANTANDER",
    "municipio": "Bucaramanga",
    "tipo_delito": "hurto",
    "anio": 2025,
    "mes": 11,
    "limit": 10
  }'

# Chatbot Ask
curl -X POST http://localhost:8000/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "Cuáles son los crímenes recientes?",
    "municipio": "Bucaramanga",
    "delito": ""
  }'
```

---

## Opción 3: Usando Postman (GUI - Recomendado para desarrollo)

### Pasos:

1. **Descargar Postman** desde https://www.postman.com/downloads/

2. **Importar colección automáticamente:**
   - Abre Postman
   - Click en `File` → `Import`
   - Selecciona el archivo `postman_collection.json` (si existe en tu proyecto)
   - O crea una nueva colección manualmente

3. **Crear una nueva Request:**
   - Click `+` para nueva pestaña
   - **URL:** `http://localhost:8000/health`
   - **Método:** GET
   - Click `Send`

4. **Para POST:**
   - URL: `http://localhost:8000/crimes/query`
   - Método: POST
   - Ir a `Body` → seleccionar `raw` → cambiar a `JSON`
   - Pegar:
   ```json
   {
     "departamento": "SANTANDER",
     "municipio": "Bucaramanga",
     "tipo_delito": "hurto",
     "anio": 2025,
     "mes": 11,
     "limit": 10
   }
   ```
   - Click `Send`

---

## Opción 4: Usando VS Code REST Client (Recomendado)

### Instalar extensión:

1. En VS Code: Click en Extensions (Ctrl+Shift+X)
2. Busca "REST Client" by Huachao Mao
3. Click Install

### Crear archivo de pruebas:

Crea un archivo llamado `test_endpoints.rest` en la raíz del proyecto:

```rest
### Variables
@host = http://localhost:8000
@municipio = Bucaramanga
@anio = 2025
@mes = 11

### Health Check
GET {{host}}/health

###
### Analytics - Metrics
GET {{host}}/analytics/metrics

###
### Analytics - Prediction Trend
GET {{host}}/analytics/prediction/trend

###
### Analytics - Risk Predict
GET {{host}}/analytics/risk/predict?municipio={{municipio}}&anio={{anio}}&mes={{mes}}

###
### Analytics - Distribution Municipios
GET {{host}}/analytics/distribution/municipios

###
### Geo - Incidents
GET {{host}}/geo/incidents

###
### Crimes - Recent
GET {{host}}/crimes/recent

###
### Crimes - Query
POST {{host}}/crimes/query
Content-Type: application/json

{
  "departamento": "SANTANDER",
  "municipio": "Bucaramanga",
  "tipo_delito": "hurto",
  "anio": 2025,
  "mes": 11,
  "limit": 10
}

###
### Chatbot - Quick
GET {{host}}/chatbot/quick/recientes?municipio={{municipio}}

###
### Chatbot - Ask
POST {{host}}/chatbot/ask
Content-Type: application/json

{
  "pregunta": "Cuáles son los crímenes recientes?",
  "municipio": "Bucaramanga",
  "delito": ""
}
```

**Usar el archivo:**
- Abre `test_endpoints.rest`
- Haz click en `Send Request` arriba de cada endpoint
- Ver la respuesta en el panel de la derecha

---

## Opción 5: Usando la Consola del Navegador (Desarrollo Frontend)

Abre DevTools (F12) en tu navegador y ejecuta en la consola:

```javascript
// Health Check
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(d => console.log(d))

// Metrics
fetch('http://localhost:8000/analytics/metrics')
  .then(r => r.json())
  .then(d => console.log(d))

// Geo Incidents
fetch('http://localhost:8000/geo/incidents')
  .then(r => r.json())
  .then(d => console.log(d))

// Risk Predict con parámetros
fetch('http://localhost:8000/analytics/risk/predict?municipio=Bucaramanga&anio=2025&mes=11')
  .then(r => r.json())
  .then(d => console.log(d))

// Chatbot Quick
fetch('http://localhost:8000/chatbot/quick/recientes')
  .then(r => r.json())
  .then(d => console.log(d))

// POST - Crimes Query
fetch('http://localhost:8000/crimes/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    departamento: 'SANTANDER',
    municipio: 'Bucaramanga',
    tipo_delito: 'hurto',
    anio: 2025,
    mes: 11,
    limit: 10
  })
})
  .then(r => r.json())
  .then(d => console.log(d))

// POST - Chatbot Ask
fetch('http://localhost:8000/chatbot/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pregunta: 'Cuáles son los crímenes recientes?',
    municipio: 'Bucaramanga',
    delito: ''
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## Opción 6: Documentación Interactiva (Swagger UI)

El backend de FastAPI incluye documentación interactiva:

1. Abre tu navegador
2. Ve a: **http://localhost:8000/docs**
3. Aquí verás:
   - Todos los endpoints listados
   - Esquemas de request/response
   - **"Try it out"** para probar directamente
   - Ejemplos de valores

**Alternativa (ReDoc):**
- http://localhost:8000/redoc

---

## Opción 7: Script PowerShell Automatizado

Crea un archivo `test_all_endpoints.ps1`:

```powershell
# Colores para output
$successColor = 'Green'
$errorColor = 'Red'
$infoColor = 'Cyan'

Write-Host "=== Testing Santander Security API ===" -ForegroundColor $infoColor
Write-Host "Base URL: http://localhost:8000" -ForegroundColor $infoColor
Write-Host ""

# Función para probar endpoints
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Uri,
        [string]$Method = "Get",
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor $infoColor
    Write-Host "URL: $Uri" -ForegroundColor $infoColor
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
        }
        
        if ($Body) {
            $params['ContentType'] = 'application/json'
            $params['Body'] = $Body | ConvertTo-Json
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor $successColor
        Write-Host "Response:" -ForegroundColor $successColor
        $response.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host
        Write-Host ""
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor $errorColor
        Write-Host ""
    }
}

# Ejecutar pruebas
Test-Endpoint -Name "Health Check" -Uri "http://localhost:8000/health"
Test-Endpoint -Name "Analytics Metrics" -Uri "http://localhost:8000/analytics/metrics"
Test-Endpoint -Name "Geo Incidents" -Uri "http://localhost:8000/geo/incidents"
Test-Endpoint -Name "Crimes Recent" -Uri "http://localhost:8000/crimes/recent"
Test-Endpoint -Name "Prediction Trend" -Uri "http://localhost:8000/analytics/prediction/trend"
Test-Endpoint -Name "Distribution Municipios" -Uri "http://localhost:8000/analytics/distribution/municipios"
Test-Endpoint -Name "Chatbot Quick" -Uri "http://localhost:8000/chatbot/quick/recientes"

# POST Requests
$crimeBody = @{
    departamento = "SANTANDER"
    municipio = "Bucaramanga"
    tipo_delito = ""
    anio = 2025
    mes = 11
    limit = 10
}
Test-Endpoint -Name "Crimes Query" -Uri "http://localhost:8000/crimes/query" -Method Post -Body $crimeBody

$chatbotBody = @{
    pregunta = "Cuáles son los crímenes?"
    municipio = ""
    delito = ""
}
Test-Endpoint -Name "Chatbot Ask" -Uri "http://localhost:8000/chatbot/ask" -Method Post -Body $chatbotBody

Write-Host "=== Testing Complete ===" -ForegroundColor $infoColor
```

**Ejecutar:**
```powershell
cd c:\Users\gisse\santander-security
.\test_all_endpoints.ps1
```

---

## Verificación Rápida (1 minuto)

```powershell
# 1. Terminal 1: Inicia el backend
cd c:\Users\gisse\santander-security
python -m uvicorn app.main:app --reload --port 8000

# 2. Terminal 2: Prueba rápida
Invoke-WebRequest "http://localhost:8000/health" | Select-Object -ExpandProperty Content
```

Si ves una respuesta JSON, ¡todo está funcionando! ✅

---

## Solución de Problemas

### Error: "No se puede conectar a localhost:8000"
- ✅ Verifica que el backend está corriendo: `python -m uvicorn app.main:app --reload --port 8000`
- ✅ Verifica el puerto: `netstat -ano | findstr :8000`

### Error: "CORS error"
- ✅ Esto es normal desde el navegador
- ✅ Usa las opciones sin navegador (PowerShell, cURL, Postman, REST Client)

### Error: "404 Not Found"
- ✅ Verifica la URL exacta
- ✅ Revisa que el backend tiene ese endpoint
- ✅ Visita http://localhost:8000/docs para ver todos los endpoints

### Error: "422 Unprocessable Entity"
- ✅ Los parámetros JSON no son válidos
- ✅ Revisa el formato del body en el endpoint

---

## Recomendación: Método Preferido

Para desarrollo local en Windows:

1. **REST Client (VS Code)** - Más rápido y integrado
2. **Swagger UI** - Para documentación interactiva
3. **Postman** - Para pruebas complejas y colecciones
4. **PowerShell Scripts** - Para automatización

---

Última actualización: 2025-11-26

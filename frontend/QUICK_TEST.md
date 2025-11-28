# 🧪 PRUEBA RÁPIDA: 3 Métodos para Testear Endpoints

## ⚡ Método 1: Swagger UI (Más Fácil - 30 segundos)

### Pasos:
1. **Abre tu navegador** y ve a:
   ```
   http://localhost:8000/docs
   ```

2. **Verás todos los endpoints listados**
   - Expande cualquier endpoint haciendo click
   - Haz click en **"Try it out"**
   - Ingresa parámetros si es necesario
   - Haz click en **"Execute"**
   - ¡Listo! Verás la respuesta abajo

3. **Alternativa (ReDoc):**
   ```
   http://localhost:8000/redoc
   ```

---

## 🚀 Método 2: VS Code REST Client (Recomendado para Desarrollo)

### Setup (1 minuto):

1. **Instalar extensión:**
   - Abre VS Code
   - Presiona `Ctrl+Shift+X` (Extensions)
   - Busca "REST Client" (por Huachao Mao)
   - Click "Install"

2. **Usar el archivo de pruebas:**
   - En tu proyecto ya existe: `test_endpoints.rest`
   - Abre ese archivo en VS Code
   - Verás botones "Send Request" encima de cada endpoint
   - ¡Haz click en cualquiera y verás la respuesta!

### Ejemplo rápido:
```rest
GET http://localhost:8000/health
```
Haz click en "Send Request" → Verás respuesta a la derecha

---

## 💻 Método 3: PowerShell Script (Prueba Todos de Una Vez)

### Ejecutar todas las pruebas automáticamente:

```powershell
# Abre PowerShell en la carpeta del proyecto
cd c:\Users\gisse\santander-security

# Ejecuta el script de pruebas
.\test_all_endpoints.ps1
```

Verás:
- ✅ Pruebas verdes = exitosas
- ❌ Pruebas rojas = errores
- Resumen final con porcentaje

---

## 🔍 Método 4: Prueba Rápida en PowerShell (2 segundos)

```powershell
# Health check
Invoke-WebRequest "http://localhost:8000/health" | Select-Object -ExpandProperty Content

# O más legible:
(Invoke-WebRequest "http://localhost:8000/health").Content | ConvertFrom-Json | ConvertTo-Json
```

---

## 📋 Tabla de Endpoints para Copiar/Pegar

### GET Requests (Simples)

```
GET http://localhost:8000/health
GET http://localhost:8000/analytics/metrics
GET http://localhost:8000/analytics/prediction/trend
GET http://localhost:8000/analytics/distribution/municipios
GET http://localhost:8000/geo/incidents
GET http://localhost:8000/crimes/recent
GET http://localhost:8000/chatbot/quick/recientes
```

### GET con Parámetros

```
GET http://localhost:8000/analytics/risk/predict?municipio=Bucaramanga&anio=2025&mes=11
GET http://localhost:8000/chatbot/quick/recientes?municipio=Bucaramanga
```

### POST Requests

```
POST http://localhost:8000/crimes/query
Body: {
  "departamento": "SANTANDER",
  "municipio": "Bucaramanga",
  "tipo_delito": "",
  "anio": 2025,
  "mes": 11,
  "limit": 10
}

POST http://localhost:8000/chatbot/ask
Body: {
  "pregunta": "Cuáles son los crímenes recientes?",
  "municipio": "Bucaramanga",
  "delito": ""
}
```

---

## ✅ Checklist: Antes de Empezar

- [ ] Backend corriendo en puerto 8000
- [ ] Frontend corriendo en puerto 5173 (opcional)
- [ ] `.env` configurado con `VITE_API_BASE=http://localhost:8000`
- [ ] Navegador actualizado (para Swagger UI)

---

## 🐛 Si Algo No Funciona

### Error: "Cannot connect to localhost:8000"
```powershell
# Verifica que el backend está corriendo:
netstat -ano | findstr :8000

# Si no hay output, inicia el backend:
cd c:\Users\gisse\santander-security\app
python -m uvicorn app.main:app --reload --port 8000
```

### Error: "CORS error" en navegador
- ✅ Es normal (browser security)
- ✅ Usa REST Client o Postman

### Error: "404 Not Found"
- ✅ Verifica la URL (sin typos)
- ✅ El endpoint existe en http://localhost:8000/docs

---

## 📊 Resumen Rápido de Todos los Endpoints

| Categoría | Endpoint | Método | Parámetros |
|-----------|----------|--------|-----------|
| Default | `/health` | GET | ✅ Ninguno |
| Analytics | `/analytics/metrics` | GET | ✅ Ninguno |
| Analytics | `/analytics/prediction/trend` | GET | ✅ Ninguno |
| Analytics | `/analytics/risk/predict` | GET | municipio, anio, mes |
| Analytics | `/analytics/distribution/municipios` | GET | ✅ Ninguno |
| Geo | `/geo/incidents` | GET | ✅ Ninguno |
| Crimes | `/crimes/recent` | GET | ✅ Ninguno |
| Crimes | `/crimes/query` | POST | body con filtros |
| Chatbot | `/chatbot/quick/{tipo}` | GET | municipio (opt) |
| Chatbot | `/chatbot/ask` | POST | pregunta, municipio, delito |

---

## 🎯 Recomendación Personal

**Para desarrollo diario:**
1. Usa **Swagger UI** (http://localhost:8000/docs) para explorar
2. Usa **REST Client** en VS Code para pruebas rápidas
3. Usa **PowerShell Script** para validar todo antes de commit

---

Creado: 2025-11-26

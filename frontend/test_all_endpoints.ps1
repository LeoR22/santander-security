#!/usr/bin/env powershell
# Script para probar todos los endpoints de la API Santander Security

# Colores para output
$successColor = 'Green'
$errorColor = 'Red'
$infoColor = 'Cyan'
$warningColor = 'Yellow'

# Variables
$baseUrl = "http://localhost:8000"
$municipio = "Bucaramanga"
$anio = 2025
$mes = 11

# Función para formatear JSON
function Format-JsonOutput {
    param([string]$json)
    try {
        $obj = $json | ConvertFrom-Json
        return $obj | ConvertTo-Json -Depth 10
    }
    catch {
        return $json
    }
}

# Función para probar un endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Uri,
        [string]$Method = "Get",
        [object]$Body = $null
    )
    
    Write-Host "`n" + ("=" * 60) -ForegroundColor $infoColor
    Write-Host "📍 $Name" -ForegroundColor $infoColor
    Write-Host ("=" * 60) -ForegroundColor $infoColor
    Write-Host "Method: $Method | URL: $Uri" -ForegroundColor $warningColor
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params['ContentType'] = 'application/json'
            $params['Body'] = $Body | ConvertTo-Json
            Write-Host "Body: $($params['Body'])" -ForegroundColor $warningColor
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $content = $response.Content
        
        Write-Host "✅ Status Code: $statusCode" -ForegroundColor $successColor
        Write-Host "Response:" -ForegroundColor $successColor
        Write-Host (Format-JsonOutput $content) -ForegroundColor $successColor
        
        return @{
            Success = $true
            StatusCode = $statusCode
            Content = $content
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        $statusCode = $_.Exception.Response.StatusCode.Value
        
        Write-Host "❌ Error: $errorMsg" -ForegroundColor $errorColor
        if ($statusCode) {
            Write-Host "Status Code: $statusCode" -ForegroundColor $errorColor
        }
        
        return @{
            Success = $false
            Error = $errorMsg
            StatusCode = $statusCode
        }
    }
}

# Inicio del script
Write-Host "`n" -ForegroundColor $infoColor
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $infoColor
Write-Host "║   🔒 TESTING SANTANDER SECURITY API                   ║" -ForegroundColor $infoColor
Write-Host "║   Base URL: $baseUrl" -ForegroundColor $infoColor
Write-Host "║   Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $infoColor
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $infoColor

# Inicializar contador de resultados
$totalTests = 0
$passedTests = 0
$failedTests = 0

# ============================================
# DEFAULT
# ============================================
Write-Host "`n`n🔧 DEFAULT ENDPOINTS" -ForegroundColor $infoColor
Write-Host "━" * 60 -ForegroundColor $infoColor

$totalTests++
$result = Test-Endpoint -Name "Health Check" -Uri "$baseUrl/health"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

# ============================================
# ANALYTICS
# ============================================
Write-Host "`n`n📊 ANALYTICS ENDPOINTS" -ForegroundColor $infoColor
Write-Host "━" * 60 -ForegroundColor $infoColor

$totalTests++
$result = Test-Endpoint -Name "Get Metrics" -Uri "$baseUrl/analytics/metrics"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$result = Test-Endpoint -Name "Prediction Trend" -Uri "$baseUrl/analytics/prediction/trend"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$riskUri = "$baseUrl/analytics/risk/predict?municipio=$municipio&anio=$anio&mes=$mes"
$result = Test-Endpoint -Name "Risk Predict (con parámetros)" -Uri $riskUri
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$result = Test-Endpoint -Name "Distribution Municipios" -Uri "$baseUrl/analytics/distribution/municipios"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

# ============================================
# GEO
# ============================================
Write-Host "`n`n🗺️  GEO ENDPOINTS" -ForegroundColor $infoColor
Write-Host "━" * 60 -ForegroundColor $infoColor

$totalTests++
$result = Test-Endpoint -Name "Geospatial Incidents" -Uri "$baseUrl/geo/incidents"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

# ============================================
# CRIMES
# ============================================
Write-Host "`n`n🚨 CRIMES ENDPOINTS" -ForegroundColor $infoColor
Write-Host "━" * 60 -ForegroundColor $infoColor

$totalTests++
$result = Test-Endpoint -Name "Get Recent Crimes" -Uri "$baseUrl/crimes/recent"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$crimeBody = @{
    departamento = "SANTANDER"
    municipio = $municipio
    tipo_delito = ""
    anio = $anio
    mes = $mes
    limit = 10
}
$result = Test-Endpoint -Name "Query Crimes (con municipio)" -Uri "$baseUrl/crimes/query" -Method Post -Body $crimeBody
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$crimeBodyAll = @{
    departamento = "SANTANDER"
    municipio = ""
    tipo_delito = ""
    anio = $anio
    mes = $mes
    limit = 20
}
$result = Test-Endpoint -Name "Query Crimes (todos los municipios)" -Uri "$baseUrl/crimes/query" -Method Post -Body $crimeBodyAll
if ($result.Success) { $passedTests++ } else { $failedTests++ }

# ============================================
# CHATBOT
# ============================================
Write-Host "`n`n🤖 CHATBOT ENDPOINTS" -ForegroundColor $infoColor
Write-Host "━" * 60 -ForegroundColor $infoColor

$totalTests++
$result = Test-Endpoint -Name "Quick Response - Recientes" -Uri "$baseUrl/chatbot/quick/recientes"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$result = Test-Endpoint -Name "Quick Response - Todos" -Uri "$baseUrl/chatbot/quick/todos"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$result = Test-Endpoint -Name "Quick Response - Seguridad" -Uri "$baseUrl/chatbot/quick/seguridad"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$result = Test-Endpoint -Name "Quick Response - General" -Uri "$baseUrl/chatbot/quick/general"
if ($result.Success) { $passedTests++ } else { $failedTests++ }

$totalTests++
$chatbotBody = @{
    pregunta = "Cuáles son los crímenes recientes?"
    municipio = $municipio
    delito = ""
}
$result = Test-Endpoint -Name "Ask Question" -Uri "$baseUrl/chatbot/ask" -Method Post -Body $chatbotBody
if ($result.Success) { $passedTests++ } else { $failedTests++ }

# ============================================
# RESUMEN
# ============================================
Write-Host "`n`n" -ForegroundColor $infoColor
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $infoColor
Write-Host "║   📈 RESUMEN DE RESULTADOS                            ║" -ForegroundColor $infoColor
Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor $infoColor
Write-Host "║   Total de Tests:    $totalTests" -ForegroundColor $infoColor
Write-Host "║   ✅ Exitosos:       $passedTests" -ForegroundColor $successColor
Write-Host "║   ❌ Fallidos:       $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { $errorColor } else { $successColor })
Write-Host "║   Porcentaje:        $(([math]::Round(($passedTests/$totalTests)*100, 2)))%" -ForegroundColor $infoColor
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $infoColor

# Resultado final
if ($failedTests -eq 0) {
    Write-Host "`n✅ TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE" -ForegroundColor $successColor
    exit 0
} else {
    Write-Host "`n⚠️  ALGUNOS ENDPOINTS TIENEN ERRORES" -ForegroundColor $warningColor
    exit 1
}

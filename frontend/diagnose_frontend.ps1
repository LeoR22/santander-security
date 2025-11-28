#!/usr/bin/env powershell
# Script de diagnóstico para Santander Security Frontend

$host.ui.RawUI.WindowTitle = "🔍 Diagnóstico Frontend - Santander Security"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🔍 DIAGNÓSTICO FRONTEND - SANTANDER SECURITY       ║" -ForegroundColor Cyan
Write-Host "║   Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Variables
$frontendPath = "c:\Users\gisse\santander-security\frontend"
$backendPath = "c:\Users\gisse\santander-security\app"
$nodePort = 5173
$backendPort = 8000

# Función para verificar puerto
function Check-Port {
    param([int]$Port, [string]$ServiceName)
    
    $process = netstat -ano 2>$null | Select-String ":$Port " | Select-Object -First 1
    
    if ($process) {
        Write-Host "✅ $ServiceName corriendo en puerto $Port" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $ServiceName NO está corriendo en puerto $Port" -ForegroundColor Red
        return $false
    }
}

# Función para verificar archivo
function Check-File {
    param([string]$Path, [string]$Description)
    
    if (Test-Path $Path) {
        Write-Host "✅ $Description encontrado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Description NO encontrado: $Path" -ForegroundColor Red
        return $false
    }
}

# ============================================
# 1. VERIFICAR PUERTOS
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1️⃣  VERIFICAR PUERTOS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$frontendRunning = Check-Port $nodePort "Frontend (Vite)"
$backendRunning = Check-Port $backendPort "Backend (FastAPI)"

if (-not $frontendRunning) {
    Write-Host "⚠️  Frontend no está corriendo en puerto $nodePort" -ForegroundColor Yellow
}

if (-not $backendRunning) {
    Write-Host "⚠️  Backend no está corriendo en puerto $backendPort" -ForegroundColor Yellow
}

# ============================================
# 2. VERIFICAR ARCHIVOS CRÍTICOS
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "2️⃣  VERIFICAR ARCHIVOS CRÍTICOS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Check-File "$frontendPath/.env" "Frontend .env"
Check-File "$frontendPath/package.json" "Frontend package.json"
Check-File "$frontendPath/vite.config.js" "Frontend vite.config.js"
Check-File "$frontendPath/src/main.jsx" "Frontend main.jsx"
Check-File "$frontendPath/src/App.jsx" "Frontend App.jsx"
Check-File "$frontendPath/node_modules" "Frontend node_modules"

# ============================================
# 3. VERIFICAR .env
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "3️⃣  VERIFICAR CONFIGURACIÓN .env" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (Test-Path "$frontendPath/.env") {
    $envContent = Get-Content "$frontendPath/.env"
    Write-Host "Contenido de .env:" -ForegroundColor Green
    foreach ($line in $envContent) {
        if ($line -match "VITE_API_BASE") {
            Write-Host "  ✅ $line" -ForegroundColor Green
        } else {
            Write-Host "  $line" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Archivo .env no existe" -ForegroundColor Red
}

# ============================================
# 4. VERIFICAR CONSOLA DEL NAVEGADOR
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "4️⃣  PRÓXIMOS PASOS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n📝 Acciones a realizar:" -ForegroundColor Yellow
Write-Host "  1. Abre tu navegador: http://localhost:$nodePort"
Write-Host "  2. Presiona F12 para abrir DevTools"
Write-Host "  3. Ve a la pestaña 'Console'"
Write-Host "  4. Busca errores de color rojo"
Write-Host "  5. Copia los errores y comparte conmigo"

# ============================================
# 5. COMANDOS PARA INICIAR
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "5️⃣  COMANDOS PARA INICIAR" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (-not $backendRunning) {
    Write-Host "`n📍 Terminal 1: Inicia el Backend" -ForegroundColor Yellow
    Write-Host "  cd $backendPath" -ForegroundColor Gray
    Write-Host "  python -m uvicorn app.main:app --reload --port $backendPort" -ForegroundColor Gray
}

if (-not $frontendRunning) {
    Write-Host "`n📍 Terminal 2: Inicia el Frontend" -ForegroundColor Yellow
    Write-Host "  cd $frontendPath" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
}

# ============================================
# 6. LIMPIAR CACHE
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "6️⃣  SI SIGUE SIN FUNCIONAR" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n Opción A: Limpiar cache de npm" -ForegroundColor Yellow
Write-Host "  cd $frontendPath" -ForegroundColor Gray
Write-Host "  npm cache clean --force" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray

Write-Host "`n Opción B: Eliminar node_modules y reinstalar" -ForegroundColor Yellow
Write-Host "  cd $frontendPath" -ForegroundColor Gray
Write-Host "  Remove-Item -Recurse -Force node_modules" -ForegroundColor Gray
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray

Write-Host "`n Opción C: Limpiar Vite cache" -ForegroundColor Yellow
Write-Host "  cd $frontendPath" -ForegroundColor Gray
Write-Host "  Remove-Item -Recurse -Force .vite" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray

# ============================================
# 7. RESUMEN
# ============================================
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   📊 RESUMEN DEL DIAGNÓSTICO                          ║" -ForegroundColor Cyan
Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor Cyan

if ($frontendRunning -and $backendRunning) {
    Write-Host "║   ✅ Frontend: Corriendo" -ForegroundColor Green
    Write-Host "║   ✅ Backend: Corriendo" -ForegroundColor Green
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "║   💻 Abre: http://localhost:$nodePort" -ForegroundColor Green
} else {
    if (-not $frontendRunning) {
        Write-Host "║   ❌ Frontend: NO corriendo" -ForegroundColor Red
    } else {
        Write-Host "║   ✅ Frontend: Corriendo" -ForegroundColor Green
    }
    
    if (-not $backendRunning) {
        Write-Host "║   ❌ Backend: NO corriendo" -ForegroundColor Red
    } else {
        Write-Host "║   ✅ Backend: Corriendo" -ForegroundColor Green
    }
    
    Write-Host "║" -ForegroundColor Cyan
    Write-Host "║   ⚡ Inicia los servicios primero" -ForegroundColor Yellow
}

Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n"

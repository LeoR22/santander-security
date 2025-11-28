#!/usr/bin/env powershell
# Script interactivo para arreglar el frontend

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🔧 FIX FRONTEND - SANTANDER SECURITY             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$frontendPath = "c:\Users\gisse\santander-security\frontend"

Write-Host "`n¿Qué deseas hacer?" -ForegroundColor Yellow
Write-Host "1. Limpiar todo y reinstalar (RECOMENDADO)" -ForegroundColor Green
Write-Host "2. Solo iniciar npm run dev" -ForegroundColor Yellow
Write-Host "3. Usar puerto diferente (3000)" -ForegroundColor Yellow
Write-Host "4. Ver estado del sistema" -ForegroundColor Blue

$choice = Read-Host "`nElige opción (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🧹 OPCIÓN 1: Limpiar todo y reinstalar" -ForegroundColor Green
        
        Write-Host "`n1. Matando procesos Node.js..." -ForegroundColor Yellow
        taskkill /F /IM node.exe 2>$null | Out-Null
        Write-Host "   ✅ Hecho" -ForegroundColor Green
        
        Write-Host "`n2. Limpiando caché npm..." -ForegroundColor Yellow
        cd $frontendPath
        npm cache clean --force 2>$null | Out-Null
        Write-Host "   ✅ Hecho" -ForegroundColor Green
        
        Write-Host "`n3. Eliminando node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "$frontendPath/node_modules" -ErrorAction SilentlyContinue | Out-Null
        Write-Host "   ✅ Hecho" -ForegroundColor Green
        
        Write-Host "`n4. Eliminando directorios de caché (.vite, dist)..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "$frontendPath/.vite" -ErrorAction SilentlyContinue | Out-Null
        Remove-Item -Recurse -Force "$frontendPath/dist" -ErrorAction SilentlyContinue | Out-Null
        Write-Host "   ✅ Hecho" -ForegroundColor Green
        
        Write-Host "`n5. Reinstalando dependencias..." -ForegroundColor Yellow
        npm install
        
        Write-Host "`n6. Iniciando servidor..." -ForegroundColor Yellow
        Write-Host "`n✅ Abre tu navegador en: http://localhost:5173" -ForegroundColor Green
        Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Cyan
        npm run dev
    }
    
    "2" {
        Write-Host "`n▶️  OPCIÓN 2: Solo npm run dev" -ForegroundColor Yellow
        cd $frontendPath
        Write-Host "Iniciando servidor..." -ForegroundColor Yellow
        Write-Host "✅ Abre tu navegador en: http://localhost:5173" -ForegroundColor Green
        npm run dev
    }
    
    "3" {
        Write-Host "`n🔌 OPCIÓN 3: Usar puerto 3000" -ForegroundColor Yellow
        cd $frontendPath
        Write-Host "Iniciando servidor en puerto 3000..." -ForegroundColor Yellow
        Write-Host "✅ Abre tu navegador en: http://localhost:3000" -ForegroundColor Green
        npm run dev -- --port 3000
    }
    
    "4" {
        Write-Host "`n📊 OPCIÓN 4: Estado del Sistema" -ForegroundColor Blue
        
        Write-Host "`n🔍 Verificando puertos..." -ForegroundColor Cyan
        Write-Host "`nPuerto 5173 (Frontend):" -ForegroundColor Yellow
        $port5173 = netstat -ano 2>$null | Select-String ":5173" | Select-Object -First 1
        if ($port5173) {
            Write-Host "   ✅ EN USO - $port5173" -ForegroundColor Green
        } else {
            Write-Host "   ❌ LIBRE" -ForegroundColor Red
        }
        
        Write-Host "`nPuerto 8000 (Backend):" -ForegroundColor Yellow
        $port8000 = netstat -ano 2>$null | Select-String ":8000" | Select-Object -First 1
        if ($port8000) {
            Write-Host "   ✅ EN USO" -ForegroundColor Green
        } else {
            Write-Host "   ❌ LIBRE" -ForegroundColor Red
        }
        
        Write-Host "`n🔍 Verificando archivos..." -ForegroundColor Cyan
        Write-Host "`narchivo .env:" -ForegroundColor Yellow
        if (Test-Path "$frontendPath/.env") {
            Write-Host "   ✅ Existe" -ForegroundColor Green
            $envContent = Get-Content "$frontendPath/.env" | Select-String "VITE_API_BASE"
            if ($envContent) {
                Write-Host "   $envContent" -ForegroundColor Green
            }
        } else {
            Write-Host "   ❌ NO EXISTE" -ForegroundColor Red
        }
        
        Write-Host "`nnode_modules:" -ForegroundColor Yellow
        if (Test-Path "$frontendPath/node_modules") {
            Write-Host "   ✅ Instalado" -ForegroundColor Green
        } else {
            Write-Host "   ❌ NO INSTALADO (ejecuta npm install)" -ForegroundColor Red
        }
        
        Write-Host "`n"
    }
    
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
    }
}

Write-Host "`n"

#!/usr/bin/env powershell
# Script para limpiar y reiniciar el frontend correctamente

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🧹 LIMPIAR Y REINICIAR FRONTEND              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$frontendPath = "c:\Users\gisse\santander-security\frontend"

Write-Host "`n1️⃣  Matando procesos de Node.js..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null | Out-Null
Write-Host "✅ Procesos terminados" -ForegroundColor Green

Write-Host "`n2️⃣  Limpiando caché de npm..." -ForegroundColor Yellow
cd $frontendPath
npm cache clean --force
Write-Host "✅ Caché limpiado" -ForegroundColor Green

Write-Host "`n3️⃣  Eliminando node_modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$frontendPath/node_modules" -ErrorAction SilentlyContinue
Write-Host "✅ node_modules eliminado" -ForegroundColor Green

Write-Host "`n4️⃣  Eliminando .vite..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$frontendPath/.vite" -ErrorAction SilentlyContinue
Write-Host "✅ .vite eliminado" -ForegroundColor Green

Write-Host "`n5️⃣  Eliminando dist..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "$frontendPath/dist" -ErrorAction SilentlyContinue
Write-Host "✅ dist eliminado" -ForegroundColor Green

Write-Host "`n6️⃣  Reinstalando dependencias..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

Write-Host "`n7️⃣  Iniciando servidor..." -ForegroundColor Yellow
npm run dev

Write-Host "`n✅ Listo. Abre: http://localhost:5173" -ForegroundColor Green

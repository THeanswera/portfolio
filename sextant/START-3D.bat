@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js and run this file again.
  pause
  exit /b 1
)
node build.mjs
if errorlevel 1 (
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4176/configurator/"
node scripts/serve.mjs 4176
pause

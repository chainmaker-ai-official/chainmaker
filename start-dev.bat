@echo off
echo ========================================
echo Blockchain Project Development Starter
echo ========================================
echo.
echo This script will start both frontend and backend services.
echo.
echo Frontend: React/Vite on port 3001
echo Backend:  Rust/Axum on port 8080
echo.
echo Press Ctrl+C in each terminal to stop the services.
echo.

REM Check if Node.js/npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Cargo is installed
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cargo (Rust) is not installed or not in PATH.
    echo Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)

echo Checking dependencies...
echo.

REM Check frontend dependencies
if not exist "frontend\node_modules" (
    echo Frontend node_modules not found. Installing dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

REM Start backend in a new window
echo Starting Backend (Rust/Axum) on port 8080...
start "Blockchain Backend" cmd /k "cd backend && echo Starting backend server... && echo. && cargo run"
timeout /t 2 /nobreak >nul

REM Start frontend in a new window  
echo Starting Frontend (React/Vite) on port 3001...
start "Blockchain Frontend" cmd /k "cd frontend && echo Starting frontend server... && echo. && npm run dev"

echo.
echo ========================================
echo Services started successfully!
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3001
echo.
echo API Endpoint: http://localhost:8080/api/uniswap/price
echo.
echo Press any key to close this window...
pause >nul
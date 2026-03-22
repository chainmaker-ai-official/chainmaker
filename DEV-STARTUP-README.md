# Development Startup Scripts

This project includes multiple scripts to start both the frontend and backend services for development.

## Project Structure

- **Frontend**: React/Vite application in `frontend/` directory
  - Runs on port 3001
  - Start command: `npm run dev`
  
- **Backend**: Rust/Axum API server in `backend/` directory
  - Runs on port 8080  
  - Start command: `cargo run`
  - API endpoint: `http://localhost:8080/api/uniswap/price`

## Available Startup Options

### Option 1: Batch Script (Windows Command Prompt)
**File**: `start-dev.bat`
```bash
# Run from project root
start-dev.bat
```

**Features**:
- Opens separate terminal windows for each service
- Checks for required tools (npm, cargo)
- Installs frontend dependencies if missing
- Shows URLs after startup

### Option 2: PowerShell Script (Windows PowerShell)
**File**: `start-dev.ps1`
```powershell
# Run from project root (may need to enable script execution first)
.\start-dev.ps1
```

**Features**:
- Color-coded output in single terminal
- Port availability checks
- Real-time service monitoring
- Graceful shutdown with Ctrl+C
- Dependency checks

### Option 3: npm Script (Cross-platform with Node.js)
**File**: `package.json` (root level)
```bash
# First install dependencies
npm install

# Start both services
npm run dev
# or
npm start
```

**Features**:
- Uses `concurrently` to run both services in same terminal
- Color-coded prefixes for each service
- Cross-platform compatibility
- Simple npm-based workflow

## Prerequisites

Ensure you have the following installed:

1. **Node.js & npm** (for frontend)
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **Rust & Cargo** (for backend)
   - Install from: https://rustup.rs/
   - Verify: `cargo --version`

3. **For npm script option**:
   - Node.js installed
   - Run `npm install` once in project root to install `concurrently`

## Quick Start Guide

### Using Batch Script (Recommended for Windows beginners):
1. Open Command Prompt in project root
2. Double-click `start-dev.bat` or run `start-dev.bat`
3. Two terminal windows will open with running services
4. Access:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8080/api/uniswap/price

### Using PowerShell (Recommended for Windows power users):
1. Open PowerShell in project root
2. Run: `.\start-dev.ps1`
3. If you get execution policy error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
4. Press Ctrl+C to stop all services

### Using npm (Cross-platform):
1. Open terminal in project root
2. Run: `npm install` (first time only)
3. Run: `npm run dev`
4. Both services run in same terminal with colored output

## Stopping Services

- **Batch Script**: Close each terminal window or press Ctrl+C in each
- **PowerShell Script**: Press Ctrl+C in the main terminal
- **npm Script**: Press Ctrl+C in the terminal

## Troubleshooting

### Port Already in Use
If ports 3001 or 8080 are already in use:
- Change port in `frontend/vite.config.js` for frontend
- Change port in `backend/src/main.rs` for backend
- Or kill processes using the ports

### Missing Dependencies
- Frontend: Run `cd frontend && npm install`
- Backend: Cargo will download dependencies automatically on first run

### PowerShell Execution Policy
If PowerShell script won't run:
```powershell
# Temporary bypass for current session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Or run with bypass
powershell -ExecutionPolicy Bypass -File start-dev.ps1
```

## Service URLs

- **Frontend Development Server**: http://localhost:3001
- **Backend API Server**: http://localhost:8080
- **API Endpoint**: http://localhost:8080/api/uniswap/price

## Notes

- The backend may take longer to start on first run as Cargo compiles dependencies
- The frontend will automatically open in your browser (configured in vite.config.js)
- CORS is configured to allow frontend (port 3001) to access backend API
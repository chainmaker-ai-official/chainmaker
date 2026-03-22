# ========================================
# Blockchain Project Development Starter (PowerShell)
# ========================================
#
# This script starts both frontend and backend services with monitoring.
# Run with: .\start-dev.ps1
# Run as admin if you need to check ports.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Blockchain Project Development Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will start both frontend and backend services."
Write-Host ""
Write-Host "Frontend: React/Vite on port 3001"
Write-Host "Backend:  Rust/Axum on port 8080"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services and exit."
Write-Host ""

# Check prerequisites
function Test-CommandExists {
    param($command)
    $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
}

# Check for Node.js/npm
if (-not (Test-CommandExists "npm")) {
    Write-Host "ERROR: npm is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for Cargo
if (-not (Test-CommandExists "cargo")) {
    Write-Host "ERROR: Cargo (Rust) is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Rust from https://rustup.rs/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check port availability
function Test-PortInUse {
    param($port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient("localhost", $port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

Write-Host "Checking port availability..." -ForegroundColor Yellow

if (Test-PortInUse 8080) {
    Write-Host "WARNING: Port 8080 (backend) is already in use!" -ForegroundColor Red
    Write-Host "The backend server may fail to start." -ForegroundColor Yellow
}

if (Test-PortInUse 3001) {
    Write-Host "WARNING: Port 3001 (frontend) is already in use!" -ForegroundColor Red
    Write-Host "The frontend server may fail to start." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow

# Check and install frontend dependencies if needed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Frontend node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    Set-Location "frontend"
    npm install
    Set-Location ".."
    Write-Host ""
}

# Function to start a process and capture its output
function Start-Service {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkingDirectory,
        [string]$Color
    )
    
    Write-Host "Starting $Name..." -ForegroundColor $Color
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "cmd.exe"
    $processInfo.Arguments = "/c $Command"
    $processInfo.WorkingDirectory = $WorkingDirectory
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $false
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    
    # Add event handlers for output
    $outputBuilder = New-Object System.Text.StringBuilder
    $errorBuilder = New-Object System.Text.StringBuilder
    
    $scriptBlockOutput = {
        if (-not [String]::IsNullOrEmpty($EventArgs.Data)) {
            Write-Host "[$Name] $($EventArgs.Data)" -ForegroundColor $Color
            $outputBuilder.AppendLine($EventArgs.Data) | Out-Null
        }
    }
    
    $scriptBlockError = {
        if (-not [String]::IsNullOrEmpty($EventArgs.Data)) {
            Write-Host "[$Name ERROR] $($EventArgs.Data)" -ForegroundColor Red
            $errorBuilder.AppendLine($EventArgs.Data) | Out-Null
        }
    }
    
    $eventOutput = Register-ObjectEvent -InputObject $process `
        -EventName 'OutputDataReceived' `
        -Action $scriptBlockOutput
    
    $eventError = Register-ObjectEvent -InputObject $process `
        -EventName 'ErrorDataReceived' `
        -Action $scriptBlockError
    
    $process.Start() | Out-Null
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()
    
    return @{
        Process = $process
        OutputEvent = $eventOutput
        ErrorEvent = $eventError
        OutputBuilder = $outputBuilder
        ErrorBuilder = $errorBuilder
    }
}

# Start services
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green

$backendService = Start-Service -Name "Backend" `
    -Command "cargo run" `
    -WorkingDirectory "backend" `
    -Color "Magenta"

Start-Sleep -Seconds 2

$frontendService = Start-Service -Name "Frontend" `
    -Command "npm run dev" `
    -WorkingDirectory "frontend" `
    -Color "Blue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoint: http://localhost:8080/api/uniswap/price" -ForegroundColor Yellow
Write-Host ""
Write-Host "Services are running. Press Ctrl+C to stop all services." -ForegroundColor Yellow
Write-Host ""

# Wait for Ctrl+C
try {
    # Keep the script running
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Yellow
    
    # Stop processes
    if ($backendService.Process -and (-not $backendService.Process.HasExited)) {
        $backendService.Process.Kill()
    }
    
    if ($frontendService.Process -and (-not $frontendService.Process.HasExited)) {
        $frontendService.Process.Kill()
    }
    
    # Unregister events
    if ($backendService.OutputEvent) {
        Unregister-Event -SourceIdentifier $backendService.OutputEvent.Name
    }
    if ($backendService.ErrorEvent) {
        Unregister-Event -SourceIdentifier $backendService.ErrorEvent.Name
    }
    if ($frontendService.OutputEvent) {
        Unregister-Event -SourceIdentifier $frontendService.OutputEvent.Name
    }
    if ($frontendService.ErrorEvent) {
        Unregister-Event -SourceIdentifier $frontendService.ErrorEvent.Name
    }
    
    Write-Host "All services stopped." -ForegroundColor Green
}
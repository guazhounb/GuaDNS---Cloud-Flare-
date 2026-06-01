# GuaDNS One-Click Installation Script
# ========================================
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  GuaDNS - Cloudflare DNS Manager" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "OK - Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR - Node.js not found. Install from: https://nodejs.org/" -ForegroundColor Red
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}

# Check Rust
Write-Host "[2/6] Checking Rust..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version
    Write-Host "OK - Rust installed: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR - Rust not found. Install from: https://www.rust-lang.org/tools/install" -ForegroundColor Red
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}

# Check npm
Write-Host "[3/6] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "OK - npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR - npm not available" -ForegroundColor Red
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}

# Install dependencies
Write-Host "[4/6] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR - Failed to install dependencies" -ForegroundColor Red
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}
Write-Host "OK - Dependencies installed" -ForegroundColor Green

# Build project
Write-Host "[5/6] Building application..." -ForegroundColor Yellow
Write-Host "This may take a few minutes, please wait..." -ForegroundColor Gray
npm run tauri build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR - Build failed" -ForegroundColor Red
    Write-Host "Press Enter to exit..."
    Read-Host
    exit 1
}
Write-Host "OK - Build completed!" -ForegroundColor Green

# Find installers
Write-Host "[6/6] Locating installers..." -ForegroundColor Yellow
$msiPath = "src-tauri\target\release\bundle\msi\GuaDNS_1.0.0_x64_en-US.msi"
$nsisPath = "src-tauri\target\release\bundle\nsis\GuaDNS_1.0.0_x64-setup.exe"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  SUCCESS - Build completed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

if (Test-Path $msiPath) {
    $fullPath = Resolve-Path $msiPath
    Write-Host "MSI Installer location:" -ForegroundColor Cyan
    Write-Host "   $fullPath" -ForegroundColor White
    Write-Host ""
}

if (Test-Path $nsisPath) {
    $fullPath2 = Resolve-Path $nsisPath
    Write-Host "NSIS Installer location:" -ForegroundColor Cyan
    Write-Host "   $fullPath2" -ForegroundColor White
    Write-Host ""
}

Write-Host "Executable location:" -ForegroundColor Cyan
Write-Host "   $(Resolve-Path src-tauri\target\release\guadns.exe)" -ForegroundColor White
Write-Host ""
Write-Host "Double-click the installer to install!" -ForegroundColor Green
Write-Host ""

Write-Host "Press Enter to exit..."
Read-Host

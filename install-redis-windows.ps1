# Redis Installation Script for Windows
# This script downloads and installs Redis for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Redis Installation Script for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Configuration
$redisVersion = "5.0.14.1"
$downloadUrl = "https://github.com/tporadowski/redis/releases/download/v$redisVersion/Redis-x64-$redisVersion.zip"
$installPath = "C:\Redis"
$zipFile = "$env:TEMP\Redis.zip"

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Redis Version: $redisVersion"
Write-Host "  Install Path: $installPath"
Write-Host ""

# Step 1: Check if Redis is already installed
if (Test-Path "$installPath\redis-server.exe") {
    Write-Host "Redis is already installed at $installPath" -ForegroundColor Yellow
    $response = Read-Host "Do you want to reinstall? (Y/N)"
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 0
    }

    # Stop Redis service if running
    try {
        Write-Host "Stopping Redis service..." -ForegroundColor Yellow
        Stop-Service -Name Redis -ErrorAction SilentlyContinue
        & "$installPath\redis-server.exe" --service-uninstall | Out-Null
    } catch {
        Write-Host "No running Redis service found." -ForegroundColor Gray
    }
}

# Step 2: Download Redis
Write-Host "Downloading Redis $redisVersion..." -ForegroundColor Cyan
try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "  Download complete!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to download Redis" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually from:" -ForegroundColor Yellow
    Write-Host "  https://github.com/tporadowski/redis/releases" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Extract Redis
Write-Host "Extracting Redis to $installPath..." -ForegroundColor Cyan
try {
    # Create install directory if it doesn't exist
    if (Test-Path $installPath) {
        Remove-Item -Path $installPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $installPath -Force | Out-Null

    # Extract ZIP
    Expand-Archive -Path $zipFile -DestinationPath $installPath -Force
    Write-Host "  Extraction complete!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to extract Redis" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 4: Add Redis to PATH
Write-Host "Adding Redis to system PATH..." -ForegroundColor Cyan
try {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$installPath*") {
        $newPath = "$currentPath;$installPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        $env:Path = "$env:Path;$installPath"
        Write-Host "  Redis added to PATH!" -ForegroundColor Green
    } else {
        Write-Host "  Redis already in PATH" -ForegroundColor Gray
    }
} catch {
    Write-Host "WARNING: Failed to add Redis to PATH" -ForegroundColor Yellow
    Write-Host "  You may need to add it manually: $installPath" -ForegroundColor Yellow
}

# Step 5: Install Redis as Windows Service
Write-Host "Installing Redis as Windows Service..." -ForegroundColor Cyan
try {
    Set-Location $installPath

    # Install Redis service
    & "$installPath\redis-server.exe" --service-install "$installPath\redis.windows.conf" --loglevel verbose

    Write-Host "  Redis service installed!" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Failed to install Redis service" -ForegroundColor Yellow
    Write-Host "  You can run Redis manually with: redis-server.exe" -ForegroundColor Yellow
}

# Step 6: Start Redis Service
Write-Host "Starting Redis service..." -ForegroundColor Cyan
try {
    & "$installPath\redis-server.exe" --service-start
    Start-Sleep -Seconds 2
    Write-Host "  Redis service started!" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Failed to start Redis service" -ForegroundColor Yellow
}

# Step 7: Clean up
Write-Host "Cleaning up temporary files..." -ForegroundColor Cyan
Remove-Item -Path $zipFile -Force -ErrorAction SilentlyContinue
Write-Host "  Cleanup complete!" -ForegroundColor Green

# Step 8: Test Redis
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Redis Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

try {
    Write-Host "Running: redis-cli ping" -ForegroundColor Yellow
    $pingResult = & "$installPath\redis-cli.exe" ping

    if ($pingResult -eq "PONG") {
        Write-Host "  SUCCESS: Redis is running!" -ForegroundColor Green
        Write-Host ""

        # Get Redis info
        Write-Host "Redis Information:" -ForegroundColor Cyan
        $redisInfo = & "$installPath\redis-cli.exe" INFO server
        $versionLine = $redisInfo | Select-String "redis_version:"
        Write-Host "  $versionLine" -ForegroundColor Gray

    } else {
        Write-Host "  WARNING: Redis might not be running properly" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: Failed to test Redis" -ForegroundColor Red
    Write-Host "  Try running manually: redis-server.exe" -ForegroundColor Yellow
}

# Final instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Redis has been installed to: $installPath" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  redis-cli ping              # Test connection" -ForegroundColor Gray
Write-Host "  redis-cli                   # Open Redis CLI" -ForegroundColor Gray
Write-Host "  redis-server --service-stop # Stop Redis service" -ForegroundColor Gray
Write-Host "  redis-server --service-start# Start Redis service" -ForegroundColor Gray
Write-Host ""
Write-Host "Redis is now running on: localhost:6379" -ForegroundColor Green
Write-Host ""
Write-Host "To upgrade to Redis 6.2+, download from:" -ForegroundColor Yellow
Write-Host "  https://github.com/tporadowski/redis/releases" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"

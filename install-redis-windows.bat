@echo off
REM Redis Installation Script for Windows (Simple Version)
REM This script downloads and installs Redis for Windows

echo ========================================
echo   Redis Installation for Windows
echo ========================================
echo.

REM Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires Administrator privileges!
    echo Please right-click this file and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

REM Configuration
set REDIS_VERSION=5.0.14.1
set INSTALL_PATH=C:\Redis
set DOWNLOAD_URL=https://github.com/tporadowski/redis/releases/download/v%REDIS_VERSION%/Redis-x64-%REDIS_VERSION%.zip
set TEMP_ZIP=%TEMP%\Redis.zip

echo Redis Version: %REDIS_VERSION%
echo Install Path: %INSTALL_PATH%
echo.

REM Check if Redis is already installed
if exist "%INSTALL_PATH%\redis-server.exe" (
    echo Redis is already installed at %INSTALL_PATH%
    echo.
    set /p REINSTALL="Do you want to reinstall? (Y/N): "
    if /i not "%REINSTALL%"=="Y" (
        echo Installation cancelled.
        pause
        exit /b 0
    )

    REM Stop existing Redis service
    echo Stopping Redis service...
    "%INSTALL_PATH%\redis-server.exe" --service-stop >nul 2>&1
    "%INSTALL_PATH%\redis-server.exe" --service-uninstall >nul 2>&1
    timeout /t 2 /nobreak >nul
)

REM Download Redis
echo Downloading Redis %REDIS_VERSION%...
echo This may take a few minutes...
echo.

powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%TEMP_ZIP%' -UseBasicParsing}" 2>nul

if not exist "%TEMP_ZIP%" (
    echo ERROR: Failed to download Redis
    echo.
    echo Please download manually from:
    echo https://github.com/tporadowski/redis/releases
    echo.
    pause
    exit /b 1
)

echo Download complete!
echo.

REM Extract Redis
echo Extracting Redis to %INSTALL_PATH%...

REM Remove old installation
if exist "%INSTALL_PATH%" (
    rmdir /s /q "%INSTALL_PATH%" 2>nul
)

REM Create directory
mkdir "%INSTALL_PATH%" 2>nul

REM Extract using PowerShell
powershell -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%INSTALL_PATH%' -Force" 2>nul

if not exist "%INSTALL_PATH%\redis-server.exe" (
    echo ERROR: Failed to extract Redis
    echo.
    pause
    exit /b 1
)

echo Extraction complete!
echo.

REM Add Redis to PATH
echo Adding Redis to system PATH...
setx /M PATH "%PATH%;%INSTALL_PATH%" >nul 2>&1
set PATH=%PATH%;%INSTALL_PATH%
echo Redis added to PATH!
echo.

REM Install Redis as Windows Service
echo Installing Redis as Windows Service...
cd /d "%INSTALL_PATH%"
"%INSTALL_PATH%\redis-server.exe" --service-install "%INSTALL_PATH%\redis.windows.conf" --loglevel verbose >nul 2>&1

if %errorLevel% equ 0 (
    echo Redis service installed successfully!
) else (
    echo WARNING: Failed to install Redis service
    echo You can run Redis manually with: redis-server.exe
)
echo.

REM Start Redis Service
echo Starting Redis service...
"%INSTALL_PATH%\redis-server.exe" --service-start >nul 2>&1
timeout /t 3 /nobreak >nul

if %errorLevel% equ 0 (
    echo Redis service started successfully!
) else (
    echo WARNING: Failed to start Redis service
    echo Try running manually: redis-server.exe
)
echo.

REM Clean up
echo Cleaning up temporary files...
del "%TEMP_ZIP%" >nul 2>&1
echo Cleanup complete!
echo.

REM Test Redis
echo ========================================
echo   Testing Redis Installation
echo ========================================
echo.

timeout /t 2 /nobreak >nul

echo Running: redis-cli ping
"%INSTALL_PATH%\redis-cli.exe" ping >nul 2>&1

if %errorLevel% equ 0 (
    echo SUCCESS: Redis is running!
    echo.

    REM Get Redis version
    echo Redis Information:
    "%INSTALL_PATH%\redis-cli.exe" INFO server | findstr redis_version
    echo.
) else (
    echo WARNING: Redis might not be running properly
    echo Try running manually from: %INSTALL_PATH%
    echo.
)

REM Final instructions
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Redis has been installed to: %INSTALL_PATH%
echo.
echo Useful Commands:
echo   redis-cli ping                  - Test connection
echo   redis-cli                       - Open Redis CLI
echo   redis-server --service-stop     - Stop Redis service
echo   redis-server --service-start    - Start Redis service
echo.
echo Redis is now running on: localhost:6379
echo.
echo NOTE: You may need to restart your terminal/IDE
echo       to use redis-cli from any directory.
echo.
echo To upgrade to Redis 6.2+, download from:
echo https://github.com/tporadowski/redis/releases
echo.

pause

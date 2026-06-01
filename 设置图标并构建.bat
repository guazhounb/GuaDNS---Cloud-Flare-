@echo off
chcp 65001 >nul
title GuaDNS - Icon Setup & Build
echo ========================================
echo   GuaDNS - Setup Icons & Build
echo ========================================
echo.

REM Check if icon exists
if not exist src-tauri\icon.png (
    echo [ERROR] icon.png not found in src-tauri folder
    echo Please copy your icon to src-tauri\icon.png
    pause
    exit /b 1
)

echo [1/3] Generating icons from icon.png...
echo.

REM Try to use tauri icon command if available
where npx >nul 2>&1
if not errorlevel 1 (
    npx tauri icon src-tauri\icon.png
    if errorlevel 1 (
        echo [WARNING] Icon generation failed, will try manual copy...
    ) else (
        echo [OK] Icons generated successfully!
    )
)

echo.
echo [2/3] Updating tauri.conf.json...

REM Copy icon to icons folder
if exist src-tauri\icon.png (
    echo Copying icon to icons folder...
    copy src-tauri\icon.png src-tauri\icons\icon.png >nul
)

echo.
echo [3/3] Starting build...
echo.

REM Now build
call npm run tauri build

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed
) else (
    echo.
    echo ========================================
    echo   SUCCESS! Build completed.
    echo ========================================
    echo.
    echo Executable location:
    echo   src-tauri\target\release\guadns.exe
    echo.
)

pause

@echo off
setlocal enabledelayedexpansion

title GuaDNS 一键打包工具

echo.
echo ============================================
echo          GuaDNS 一键打包工具 v1.0
echo ============================================
echo.

:CHECK_NODE
echo [1/4] 检查 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('node --version') do set NODE_VER=%%i
    echo       OK: Node.js 版本: !NODE_VER!
) else (
    echo       ERROR: 未安装 Node.js，请先安装
    pause
    exit /b 1
)

:CHECK_NPM
echo [2/4] 检查 npm 环境...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%i in ('npm --version') do set NPM_VER=%%i
    echo       OK: npm 版本: !NPM_VER!
) else (
    echo       ERROR: npm 不可用
    pause
    exit /b 1
)

:CHECK_RUST
echo [3/4] 检查 Rust 环境...
cargo --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('cargo --version') do set RUST_VER=%%i
    echo       OK: Rust 版本: !RUST_VER!
) else (
    echo       ERROR: 未安装 Rust，请先安装
    pause
    exit /b 1
)

:BUILD
echo.
echo [4/4] 开始构建...
echo.

echo 安装依赖...
npm install
if %errorlevel% neq 0 (
    echo       ERROR: 依赖安装失败
    pause
    exit /b 1
)

echo 构建前端...
npm run build
if %errorlevel% neq 0 (
    echo       ERROR: 前端构建失败
    pause
    exit /b 1
)

echo 构建 Tauri 应用...
npx tauri build
if %errorlevel% neq 0 (
    echo       ERROR: Tauri 构建失败
    pause
    exit /b 1
)

echo.
echo ============================================
echo              构建成功！
echo ============================================
echo 应用程序位置: src-tauri\target\release\guadns.exe
echo 安装包位置: src-tauri\target\release\bundle
echo ============================================
echo.

pause

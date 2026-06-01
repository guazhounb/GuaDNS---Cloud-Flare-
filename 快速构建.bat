@echo off
chcp 65001 >nul
title GuaDNS 快速构建
echo ========================================
echo   GuaDNS - Cloudflare DNS 管理工具
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist package.json (
    echo [错误] 未找到 package.json
    echo 请确保在项目根目录运行此脚本
    pause
    exit /b 1
)

REM 检查 Node.js
echo [1/4] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js
    echo 请先安装: https://nodejs.org/
    pause
    exit /b 1
)
echo [成功] Node.js 已安装
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo %NODE_VER%
echo.

REM 检查 Rust
echo [2/4] 检查 Rust...
rustc --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Rust
    echo 请先安装: https://www.rust-lang.org/tools/install
    pause
    exit /b 1
)
echo [成功] Rust 已安装
for /f "tokens=*" %%i in ('rustc --version') do set RUST_VER=%%i
echo %RUST_VER%
echo.

REM 安装依赖
echo [3/4] 安装项目依赖...
call npm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [成功] 依赖安装完成
echo.

REM 构建应用
echo [4/4] 构建应用 (需要几分钟...)
echo 开始构建...
echo.
call npm run tauri build
if errorlevel 1 (
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo.
echo ========================================
echo   [成功] 构建完成！
echo ========================================
echo.
echo 安装包位置：
echo   src-tauri\target\release\bundle\
echo.
echo 可执行文件位置：
echo   src-tauri\target\release\guadns.exe
echo.
pause

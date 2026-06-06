<div align="center">

#  GuaDNS

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4+-42b883?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2.0+-24c8db?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-stable-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellowgreen?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=for-the-badge)](https://tauri.app/)

</div>

> 一个美观、高效的 Cloudflare DNS 管理桌面应用
>
> A Beautiful & Efficient Cloudflare DNS Management Desktop App

[English](#-english) | [简体中文](#-简体中文)

</div>

---

## 📑 Table of Contents / 目录

- [✨ Features / 功能特性](#-features--功能特性)
- [🎯 What You Can Do / 核心能力](#-what-you-can-do--核心能力)
- [📸 Screenshots / 界面预览](#-screenshots--界面预览)
- [🚀 Quick Start / 快速开始](#-quick-start--快速开始)
- [📖 Getting Cloudflare API Key / 获取API Key](#-getting-cloudflare-api-key--获取api-key)
- [🛠️ Development Setup / 开发环境搭建](#-development-setup--开发环境搭建)
- [📂 Project Structure / 项目结构](#-project-structure--项目结构)
- [📝 Tech Stack / 技术栈](#-tech-stack--技术栈)
- [🔐 Security / 安全说明](#-security--安全说明)
- [❓ FAQ / 常见问题](#-faq--常见问题)
- [📜 License / 许可证](#-license--许可证)

---

## ✨ Features / 功能特性

### 🇨🇳 简体中文

- 🔐 **密码保护** - 本地密码保护应用访问安全
- 🌐 **多账户管理** - 支持接入多个 Cloudflare 账户
- 📊 **实时数据仪表盘** - 域名总数、DNS记录数等实时统计
- 📝 **完整 DNS 记录管理** - 支持 17+ 种 DNS 记录类型的增删改查
  - A / AAAA / CNAME / MX / TXT / NS / CAA / SRV / PTR / NAPTR / LOC / HTTPS / SVCB / SMIMEA / SSHFP / TLSA / URI
- ⚡ **Cloudflare 代理控制** - 一键切换橙云代理/灰云仅DNS
- 💎 **macOS 风格界面** - 毛玻璃效果 + 流畅动画
- 🔄 **智能数据缓存** - 5分钟本地缓存，减少API调用
- 🛡️ **数据保护** - 刷新失败自动保留旧数据

### 🇺🇸 English

- 🔐 **Password Protection** - Local password protection for app access
- 🌐 **Multi-Account Management** - Support for multiple Cloudflare accounts
- 📊 **Real-time Dashboard** - Live stats for domains and DNS records
- 📝 **Full DNS Record Management** - CRUD for 17+ DNS record types
  - A / AAAA / CNAME / MX / TXT / NS / CAA / SRV / PTR / NAPTR / LOC / HTTPS / SVCB / SMIMEA / SSHFP / TLSA / URI
- ⚡ **Cloudflare Proxy Toggle** - One-click switch between Orange Cloud proxy / Grey Cloud DNS-only
- 💎 **macOS-style UI** - Frosted glass effect + smooth animations
- 🔄 **Smart Data Caching** - 5-minute local cache to reduce API calls
- 🛡️ **Data Protection** - Auto-preserve old data on refresh failure

---

## 🎯 What You Can Do / 核心能力

| Feature | Description |
|---------|-------------|
| 📦 账户管理 | 添加/解绑 Cloudflare 账户，安全存储 API Key |
| 🌍 域名浏览 | 查看所有域名、状态、NS 服务器 |
| 📋 记录管理 | 添加、编辑、删除各类 DNS 记录 |
| 🎛️ 代理控制 | A/AAAA/CNAME 支持橙云代理隐藏真实 IP |
| 📊 统计分析 | 域名总数、DNS 记录数实时统计 |
| 🔐 安全保障 | 密码保护，API Key 本地加密存储 |

---

## 📸 Screenshots / 界面预览

```
┌─────────────────────────────────────────────┐
│  🦡 GuaDNS                          [设置]  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  128     │ │  2,048   │ │  89  🔐     │  │
│  │  域名    │ │ DNS 记录  │ │  账户      │  │
│  └──────────┘ └──────────┘ └────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  📋 DNS Records                     │    │
│  │  A     @        192.168.1.1    ✅    │    │
│  │  CNAME www      @              ✅    │    │
│  │  MX    @        mail.example.com 📧  │    │
│  │  TXT   @        v=spf1 ...      📝  │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Quick Start / 快速开始

### 🇨🇳 Windows（推荐）

双击运行 `快速构建.bat` 或在 PowerShell 中运行：

```powershell
.\install.ps1
```

### 🇨🇳 手动构建

```bash
# 1. 安装依赖
npm install

# 2. 启动开发模式
npm run tauri dev

# 3. 构建生产版本
npm run tauri build
```

### 🇺🇸 Windows (Recommended)

Double-click `快速构建.bat` or run in PowerShell:

```powershell
.\install.ps1
```

### 🇺🇸 Manual Build

```bash
# 1. Install dependencies
npm install

# 2. Start development mode
npm run tauri dev

# 3. Build production version
npm run tauri build
```

---

## 📖 Getting Cloudflare API Key / 获取API Key

### 🇨🇳 步骤说明

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 点击右上角头像 → **我的个人资料 (My Profile)**
3. 滚动到 **API Keys** 区域
4. 点击 **Global API Key** 旁的 **View**
5. 输入密码验证
6. 复制 API Key 到剪贴板

> ⚠️ **重要**: Global API Key 拥有完全访问权限，请妥善保管！

### 🇺🇸 Steps

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click your profile avatar → **My Profile**
3. Scroll down to **API Keys** section
4. Click **View** next to **Global API Key**
5. Verify with your password
6. Copy the API Key to clipboard

> ⚠️ **Important**: Global API Key has full access. Keep it secure!

---

## 🛠️ Development Setup / 开发环境搭建

### 🇨🇳 环境要求

| 工具 | 版本要求 |
|------|---------|
| Node.js | 18.0+ |
| npm / pnpm | 最新稳定版 |
| Rust | 最新稳定版 |
| 操作系统 | Windows / macOS / Linux |

### 🇨🇳 安装 Rust

**Windows:**
```powershell
winget install Rustlang.Rustlang
# 或
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**macOS:**
```bash
brew install rust
```

### 🇨🇳 安装 Node.js

**Windows:**
```powershell
winget install OpenJS.NodeJS.LTS
```

**macOS:**
```bash
brew install node@18
```

### 🇨🇳 启动开发

```bash
# 克隆仓库
git clone https://github.com/your-repo/guadns.git
cd guadns

# 安装依赖
npm install

# 启动开发服务器（会同时启动前端和后端）
npm run tauri dev

# 构建生产版本
npm run tauri build
```

### 🇺🇸 Requirements

| Tool | Version |
|------|---------|
| Node.js | 18.0+ |
| npm / pnpm | Latest stable |
| Rust | Latest stable |
| OS | Windows / macOS / Linux |

### 🇺🇸 Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 🇺🇸 Install Node.js

```bash
brew install node@18  # macOS
# or download from https://nodejs.org/
```

### 🇺🇸 Start Development

```bash
# Clone repository
git clone https://github.com/your-repo/guadns.git
cd guadns

# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build production version
npm run tauri build
```

---

## 📂 Project Structure / 项目结构

```
GUADNS/
├── 📁 src/                          # Frontend Source
│   ├── 📁 views/                     # Vue Pages
│   │   ├── LockScreen.vue            # Password Lock Screen
│   │   ├── SetupScreen.vue           # First-run Setup Wizard
│   │   ├── MainScreen.vue            # Main Interface Layout
│   │   ├── Dashboard.vue             # Analytics Dashboard
│   │   ├── DomainList.vue            # Domain List View
│   │   ├── DomainDetail.vue          # DNS Record Manager
│   │   └── Services.vue             # Account Management
│   ├── 📁 stores/                     # Pinia State Management
│   │   ├── auth.ts                   # Authentication Store
│   │   └── cloudflare.ts             # Cloudflare API + Data Store
│   ├── 📁 router/                     # Vue Router
│   │   └── index.ts                 # Route Definitions
│   ├── App.vue                       # Root Component
│   └── main.ts                       # Application Entry
│
├── 📁 src-tauri/                     # Tauri Backend (Rust)
│   ├── 📁 src/
│   │   ├── main.rs                   # Main Entry
│   │   └── lib.rs                    # Cloudflare API Client
│   ├── 📁 icons/                     # App Icons
│   ├── Cargo.toml                    # Rust Dependencies
│   └── tauri.conf.json               # Tauri Config
│
├── 📁 public/                        # Static Assets
├── index.html                        # HTML Entry
│
├── package.json                      # NPM Config
├── tsconfig.json                     # TypeScript Config
├── vite.config.ts                    # Vite Config
├── README.md                         # This File
├── LICENSE                           # MIT License
├── 快速构建.bat                       # Windows Quick Build
└── install.ps1                       # PowerShell Installer
```

---

## 📝 Tech Stack / 技术栈

### Frontend 前端

| Tech | Version | Purpose |
|------|---------|---------|
| [Vue.js](https://vuejs.org/) | 3.4+ | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.3+ | Type-safe JavaScript |
| [Pinia](https://pinia.vuejs.org/) | 2.1+ | State Management |
| [Vue Router](https://router.vuejs.org/) | 4.3+ | Routing |
| [Element Plus](https://element-plus.org/) | 2.7+ | UI Component Library |
| [Vite](https://vitejs.dev/) | 5.0+ | Build Tool |

### Backend 后端

| Tech | Version | Purpose |
|------|---------|---------|
| [Tauri](https://tauri.app/) | 2.0+ | Desktop App Framework |
| [Rust](https://www.rust-lang.org/) | Stable | Backend Language |
| [tokio](https://tokio.rs/) | 1.x | Async Runtime |
| [reqwest](https://docs.rs/reqwest) | 0.12+ | HTTP Client |

---

## 🔐 Security / 安全说明

### 🇨🇳 安全特性

- ✅ **API Key 本地存储** - 仅存储在用户本地 localStorage
- ✅ **密码保护** - 应用启动需要输入密码
- ✅ **数据隔离** - 无云端同步，数据完全本地
- ✅ **HTTPS 通信** - 所有 API 请求使用 HTTPS

### 🇨🇳 安全提示

> ⚠️ **Global API Key 权限很高**
> - 不要将 API Key 分享给他人
> - 定期更换 API Key
> - 使用应用后可考虑撤销并重新生成 Key

### 🇺🇸 Security Features

- ✅ **Local Storage Only** - API Keys stored only in user's localStorage
- ✅ **Password Protection** - App requires password on launch
- ✅ **No Cloud Sync** - All data stays local
- ✅ **HTTPS Only** - All API requests over HTTPS

### 🇺🇸 Security Tips

> ⚠️ **Global API Key has full access**
> - Never share your API Key
> - Rotate your API Key regularly
> - Consider revoking and regenerating after use

---

## ❓ FAQ / 常见问题

### 🇨🇳 常见问题

**Q: 密码忘记了怎么办？**
A: 删除本地存储数据或重新安装应用，然后重新设置密码和添加账户。

**Q: API Key 验证失败？**
A: 检查以下几点：
- 邮箱是否正确
- API Key 是否完整复制
- 网络连接是否正常
- Key 是否已被撤销

**Q: 刷新后数据丢失？**
A: 已在最新版本修复，刷新失败时会自动保留旧数据。

**Q: 支持哪些 DNS 记录类型？**
A: A, AAAA, CNAME, MX, TXT, NS, CAA, SRV, PTR, NAPTR, LOC, HTTPS, SVCB, SMIMEA, SSHFP, TLSA, URI 共 17 种。

**Q: 代理开关有什么用？**
A: 「橙云」经过 Cloudflare 代理，隐藏真实 IP、加速、提供 DDoS 防护；「灰云」仅做 DNS 解析。

**Q: 为什么有些记录不能代理？**
A: Cloudflare 代理仅支持 A、AAAA、CNAME 三种记录类型，其他类型只能灰云。

### 🇺🇸 FAQ

**Q: Forgot password?**
A: Clear localStorage or reinstall the app, then set up again.

**Q: API Key validation failed?**
A: Check:
- Correct email address
- Full API Key copied
- Network connection
- Key not revoked

**Q: Data lost on refresh?**
A: Fixed in latest version. Old data is preserved on refresh failure.

**Q: Supported DNS record types?**
A: 17 types: A, AAAA, CNAME, MX, TXT, NS, CAA, SRV, PTR, NAPTR, LOC, HTTPS, SVCB, SMIMEA, SSHFP, TLSA, URI.

**Q: What does the proxy switch do?**
A: "Orange Cloud" routes through Cloudflare (hides real IP, acceleration, DDoS). "Grey Cloud" is DNS-only.

**Q: Why can't some records be proxied?**
A: Cloudflare proxy only supports A, AAAA, CNAME types. Others must be grey cloud.

---

## 📜 License / 许可证

### 🇨🇳

本项目基于 [MIT License](LICENSE) 开源。

```
Copyright (c) 2024-2026 GuaDNS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files.
```

### 🇺🇸

This project is licensed under the [MIT License](LICENSE).

```
Copyright (c) 2024-2026 GuaDNS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files.
```

---

<div align="center">

### Made with ❤️ by GuaDNS Team

[⭐ Star](https://github.com/) · [🐛 Report Bug](https://github.com/) · [💡 Request Feature](https://github.com/)

</div>

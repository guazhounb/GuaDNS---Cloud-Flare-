# GuaDNS - Cloudflare DNS 管理工具

一个美观、高效的 Cloudflare DNS 管理桌面应用，支持 Windows、macOS 和 Linux。

## 功能特性

- 🔐 密码保护 + Windows Hello 支持
- 📊 实时数据仪表盘
- 🌐 多 Cloudflare 账户管理
- 📝 DNS 记录增删改查
- 💎 macOS 风格毛玻璃界面
- ✨ 流畅动画效果

## 快速开始

### Windows (推荐)

双击运行 `快速构建.bat` 或者用 PowerShell 运行 `install.ps1`

### 手动构建

```bash
# 安装依赖
npm install

# 构建应用
npm run tauri build
```

## 前置要求

- Node.js 18+
- Rust (最新稳定版)
- Windows / macOS / Linux

## 获取 Cloudflare API Key

1. 登录 https://dash.cloudflare.com
2. 点击右上角头像 → "My Profile"
3. 滚动到 "API Keys"
4. 点击 "View" 查看 "Global API Key"

## 项目结构

```
GUADNS/
├── src/
│   ├── views/          # 页面组件
│   ├── stores/         # 状态管理
│   ├── router/         # 路由配置
│   ├── App.vue
│   └── main.ts
├── src-tauri/          # Tauri 后端
├── install.ps1         # PowerShell 安装脚本
└── 快速构建.bat       # 一键构建脚本
```

## 许可证

MIT

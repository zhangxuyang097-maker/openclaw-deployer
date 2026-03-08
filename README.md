# OpenClaw 部署助手

<div align="center">

![OpenClaw](https://img.shields.io/badge/OpenClaw-部署助手-red?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**面向纯小白用户的 OpenClaw AI 智能体一键部署工具**

[下载最新版本](#下载安装) | [使用文档](#使用指南) | [问题反馈](https://github.com/zhangxuyang097-maker/openclaw-deployer/issues)

</div>

---

## 项目简介

OpenClaw 部署助手，基于 Electron 开发的 Windows 桌面应用程序，专为纯小白用户设计，提供零代码、可视化的 OpenClaw AI 智能体一键部署体验。

### 核心特性

- **Windows 专属**: 专为 Windows 系统优化
- **零代码操作**: 全程可视化界面，无需敲命令
- **自动请求管理员权限**: 启动时自动获取管理员权限，避免权限问题
- **国内镜像加速**: 所有下载均使用国内镜像源
- **自动环境检测**: 实时检测系统环境，智能提示缺失依赖
- **一键安装修复**: 自动安装/修复 Node.js、Git 等依赖
- **一键修复认证**: 自动生成带 token 的仪表盘链接，自动打开浏览器完成认证
- **安装进度可视化**: 实时显示下载百分比和进度条
- **服务全生命周期管理**: 一键启动/停止/升级 OpenClaw 服务
- **实时日志系统**: 全流程实时输出带时间戳的执行日志

## 技术栈

- **框架**: Electron 28.0+
- **前端**: 原生 HTML5 / CSS3 / JavaScript (ES6+)
- **构建**: electron-builder
- **脚本**: PowerShell

## 项目结构

```
openclaw-deployer/
├── src/
│   ├── main.js              # 主进程 - 窗口管理、系统操作
│   ├── preload.js           # 预加载脚本 - 安全桥接
│   └── renderer/            # 渲染进程
│       ├── index.html       # 主界面
│       ├── styles.css       # 样式表
│       └── app.js           # 前端逻辑
├── scripts/                 # 安装脚本
│   ├── install-nodejs-win.ps1   # Windows Node.js 安装
│   └── install-git-win.ps1      # Windows Git 安装
├── assets/                  # 图标资源
├── build-admin.ps1          # 管理员权限构建脚本
├── package.json             # 项目配置
└── README.md                # 说明文档
```

## 下载安装

### 方式一：从源码运行（推荐）

#### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

#### 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/zhangxuyang097-maker/openclaw-deployer.git
cd openclaw-deployer

# 2. 安装依赖
npm install

# 3. 启动应用（自动请求管理员权限）
npm start
```

### 方式二：构建 EXE 安装包

```bash
# 1. 克隆项目
git clone https://github.com/zhangxuyang097-maker/openclaw-deployer.git
cd openclaw-deployer

# 2. 安装依赖
npm install

# 3. 使用管理员权限构建（推荐）
# 方式 A: 双击运行 build-admin.ps1
# 方式 B: 右键 PowerShell 以管理员身份运行，然后执行:
.\build-admin.ps1

# 4. 构建完成后，EXE 文件位于:
# release/win-unpacked/OpenClaw 部署助手.exe
```

## 使用指南

### 1. 启动软件

```bash
# 开发模式（自动请求管理员权限）
npm start
```

启动时会自动弹出 UAC 提示，点击"是"授权即可。

### 2. 环境检测

软件启动后会自动检测：
- ✅ 管理员权限状态
- ✅ Node.js 版本 (需要 >= 22)
- ✅ Git 安装状态
- ✅ OpenClaw 安装状态

### 3. 一键安装

点击"🚀 开始一键安装"按钮，软件会自动：
1. 检测环境
2. 安装 Node.js（如需要）
3. 安装 Git（如需要）
4. 下载并安装 OpenClaw（显示下载进度百分比）
5. 安装依赖
6. 构建项目
7. 初始化配置

**安装进度显示：**
```
[====================] 45%
正在下载 OpenClaw... 45%
已下载: 12.34 MB / 25.67 MB
```

### 4. 一键修复认证

如果 OpenClaw 显示"离线"或需要 token：

1. 在环境检测页面找到 OpenClaw 卡片
2. 点击"🔧 修复认证"按钮
3. 自动生成带 token 的仪表盘链接
4. 自动打开浏览器完成认证
5. 等待几秒后网关状态变为"在线"

### 5. 启动服务

安装完成后：
1. 切换到"服务管理"页面
2. 点击"▶️ 启动服务"
3. 等待服务启动
4. 自动打开浏览器访问管理面板

## 功能模块

### 1. 系统环境一键检测

实时检测以下环境状态：
- ✅ 管理员权限状态
- ✅ Node.js 版本 (>= 22)
- ✅ Git 安装状态
- ✅ OpenClaw 安装状态

### 2. 依赖环境一键安装

自动安装/修复：
- 🚀 Node.js >= 22 (使用国内 npmmirror 镜像)
- 🚀 Git 版本控制工具

### 3. OpenClaw 核心管理

- ⬇️ 一键安装 OpenClaw 最新版本（带进度条）
- ⬆️ 一键升级 OpenClaw
- 🔧 一键修复认证（自动生成 token 链接）
- 🗑️ 一键卸载 OpenClaw

### 4. 自定义安装目录

- 📁 自定义 OpenClaw 安装路径
- 💾 配置自动保存到用户目录

在配置面板中可以设置自定义安装目录。

### 5. 可视化配置面板

支持配置：
- 🔑 大模型 API Key
- 🌐 Base URL
- 🤖 模型名称 (gpt-4, claude-3 等)
- 🔌 服务端口
- 🌡️ Temperature 参数

### 6. 服务全生命周期管理

- ▶️ 一键启动 OpenClaw 服务
- ⏹️ 一键停止服务
- 🌐 自动打开浏览器访问管理面板（带 token 自动认证）
- 📊 实时显示运行时间和状态

### 7. 实时日志系统

- 📝 全流程实时输出执行日志
- ⏰ 带时间戳的日志记录
- 🔍 日志过滤 (全部/信息/错误)

## 国内镜像源配置

项目默认使用以下国内镜像源：

| 资源 | 镜像地址 |
|------|----------|
| npm | https://registry.npmmirror.com |
| Node.js | https://npmmirror.com/mirrors/node |
| Git | https://npmmirror.com/mirrors/git-for-windows |
| GitHub | https://gh.api.99988866.xyz/https://github.com |
| Electron | https://npmmirror.com/mirrors/electron/ |

## 常见问题

### Q: Windows 安装时提示需要管理员权限？
A: 软件会自动请求管理员权限，点击 UAC 弹窗的"是"即可。如果未弹出，请右键以管理员身份运行。

### Q: 安装过程中网络超时？
A: 所有下载均使用国内镜像，如遇超时请检查网络连接或稍后重试。

### Q: 如何查看详细日志？
A: 切换到"运行日志"页面，可以查看所有操作的详细日志输出。

### Q: 服务启动失败？
A: 请检查：
1. OpenClaw 是否已正确安装
2. 端口 18789 是否被占用
3. 点击"🔧 修复认证"按钮重新获取 token

### Q: 网关显示"离线"？
A: 点击"🔧 修复认证"按钮，软件会自动生成带 token 的链接并打开浏览器完成认证。

### Q: 构建失败？
A: 请确保：
1. Node.js 版本 >= 18
2. 已正确安装所有依赖 (`npm install`)
3. 使用管理员权限运行构建脚本 (`.\build-admin.ps1`)

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式启动（自动请求管理员权限）
npm start

# 构建 Windows 版本（使用管理员权限）
.\build-admin.ps1

# 构建后的 EXE 位置
release/win-unpacked/OpenClaw 部署助手.exe
```

## 最新更新

### v1.0.0 (2024-03)

- ✅ 添加自动请求管理员权限功能
- ✅ 添加一键修复认证功能（自动生成 token 链接）
- ✅ 添加安装进度条和下载百分比显示
- ✅ 优化安装流程，减少安装时间
- ✅ 添加完整的异常捕获保护
- ✅ 修复临时文件删除权限问题

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

## 致谢

- [Electron](https://electronjs.org/) - 跨平台桌面应用框架
- [OpenClaw](https://github.com/openclaw/openclaw) - 小龙虾 AI 智能体
- [npmmirror](https://npmmirror.com/) - 国内 npm 镜像

---

<div align="center">

Made with ❤️ for OpenClaw Community

</div>

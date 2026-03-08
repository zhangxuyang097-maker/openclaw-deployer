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
- **国内镜像加速**: 所有下载均使用国内镜像源
- **自动环境检测**: 实时检测系统环境，智能提示缺失依赖
- **一键安装修复**: 自动安装/修复 Node.js、Git 等依赖
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
├── start.bat                # Windows 启动脚本
├── start.ps1                # PowerShell 启动脚本
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

# 3. 启动应用
npm start
```

### 方式二：构建后运行

```bash
# 1. 克隆项目
git clone https://github.com/zhangxuyang097-maker/openclaw-deployer.git
cd openclaw-deployer

# 2. 安装依赖
npm install

# 3. 构建应用
npm run build

# 4. 使用启动脚本运行
# 方式 A: 双击 start.bat
# 方式 B: 右键 start.ps1 -> 使用 PowerShell 运行
# 方式 C: 直接运行 release/win-unpacked/OpenClaw 部署助手.exe
```

## 使用指南

### 1. 启动软件

```bash
# 开发模式
npm start

# 或使用启动脚本（需先构建）
start.bat
```

### 2. 环境检测

软件启动后会自动检测：
- 管理员权限状态
- Node.js 版本 (需要 >= 22)
- Git 安装状态
- OpenClaw 安装状态

### 3. 一键安装

点击"一键安装"按钮，软件会自动：
1. 下载并安装 Node.js
2. 下载并安装 Git
3. 下载并安装 OpenClaw
4. 初始化配置

### 4. 启动服务

安装完成后：
1. 点击"启动服务"
2. 等待服务启动
3. 点击"打开面板"访问 OpenClaw

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

- ⬇️ 一键安装 OpenClaw 最新版本
- ⬆️ 一键升级 OpenClaw
- 🗑️ 一键卸载 OpenClaw

### 4. 可视化配置面板

支持配置：
- 🔑 大模型 API Key
- 🌐 Base URL
- 🤖 模型名称 (gpt-4, claude-3 等)
- 🔌 服务端口
- 🌡️ Temperature 参数

### 5. 服务全生命周期管理

- ▶️ 一键启动 OpenClaw 服务
- ⏹️ 一键停止服务
- 🌐 自动打开浏览器访问管理面板
- 📊 实时显示运行时间和状态

### 6. 实时日志系统

- 📝 全流程实时输出执行日志
- ⏰ 带时间戳的日志记录
- 🔍 日志过滤 (全部/信息/错误)
- 💾 日志导出功能

## 国内镜像源配置

项目默认使用以下国内镜像源：

| 资源 | 镜像地址 |
|------|----------|
| npm | https://registry.npmmirror.com |
| Node.js | https://npmmirror.com/mirrors/node |
| Git | https://npmmirror.com/mirrors/git-for-windows |
| GitHub | https://gh.api.99988866.xyz/https://github.com |

## 常见问题

### Q: Windows 安装时提示需要管理员权限？
A: 右键点击安装程序，选择"以管理员身份运行"。

### Q: 安装过程中网络超时？
A: 所有下载均使用国内镜像，如遇超时请检查网络连接或稍后重试。

### Q: 如何查看详细日志？
A: 切换到"运行日志"页面，可以查看所有操作的详细日志输出。

### Q: 服务启动失败？
A: 请检查：
1. OpenClaw 是否已正确安装
2. 端口 18789 是否被占用
3. 配置文件是否正确

### Q: 构建失败？
A: 请确保：
1. Node.js 版本 >= 18
2. 已正确安装所有依赖 (`npm install`)
3. 网络连接正常

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式启动
npm start

# 构建 Windows 版本
npm run build

# 构建后使用启动脚本运行
start.bat
```

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

/**
 * OpenClaw 部署助手 - 预加载脚本
 * 负责主进程与渲染进程之间的安全通信桥接
 * Windows 专属版本
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * API 暴露给渲染进程
 * 所有主进程功能通过这里安全暴露给前端
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ==================== 系统信息 ====================
  
  /**
   * 获取系统基本信息
   * @returns {Promise<Object>} 系统信息对象
   */
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // ==================== 环境检测 ====================
  
  /**
   * 检测管理员权限
   * @returns {Promise<Object>} { isAdmin: boolean, error?: string }
   */
  checkAdmin: () => ipcRenderer.invoke('check-admin'),

  /**
   * 检测 Node.js 安装状态
   * @returns {Promise<Object>} { installed: boolean, version?: string, majorVersion?: number, meetsRequirement?: boolean }
   */
  checkNodejs: () => ipcRenderer.invoke('check-nodejs'),

  /**
   * 检测 Git 安装状态
   * @returns {Promise<Object>} { installed: boolean, version?: string }
   */
  checkGit: () => ipcRenderer.invoke('check-git'),

  /**
   * 检测 OpenClaw 安装状态
   * @returns {Promise<Object>} { installed: boolean, path?: string, version?: string }
   */
  checkOpenClaw: () => ipcRenderer.invoke('check-openclaw'),

  /**
   * 检测 pnpm 安装状态
   * @returns {Promise<Object>} { installed: boolean, version?: string }
   */
  checkPnpm: () => ipcRenderer.invoke('check-pnpm'),

  // ==================== 依赖安装 ====================
  
  /**
   * Windows 安装 Node.js
   * @returns {Promise<Object>} 安装结果
   */
  installNodejsWindows: () => ipcRenderer.invoke('install-nodejs-windows'),

  /**
   * Windows 安装 Git
   * @returns {Promise<Object>} 安装结果
   */
  installGitWindows: () => ipcRenderer.invoke('install-git-windows'),

  /**
   * 安装 pnpm
   * @returns {Promise<Object>} 安装结果
   */
  installPnpm: () => ipcRenderer.invoke('install-pnpm'),

  // ==================== OpenClaw 管理 ====================
  
  /**
   * 安装 OpenClaw（一键完整安装）
   * @returns {Promise<Object>} 安装结果
   */
  installOpenClaw: () => ipcRenderer.invoke('install-openclaw'),

  /**
   * 一键完整安装 OpenClaw
   * @returns {Promise<Object>} 安装结果
   */
  installOpenClawFull: () => ipcRenderer.invoke('install-openclaw-full'),

  /**
   * 下载 OpenClaw 源码
   * @returns {Promise<Object>} 下载结果
   */
  downloadOpenClaw: () => ipcRenderer.invoke('download-openclaw'),

  /**
   * 安装 OpenClaw 依赖
   * @returns {Promise<Object>} 安装结果
   */
  installOpenClawDeps: () => ipcRenderer.invoke('install-openclaw-deps'),

  /**
   * 构建 OpenClaw
   * @returns {Promise<Object>} 构建结果
   */
  buildOpenClaw: () => ipcRenderer.invoke('build-openclaw'),

  /**
   * 初始化 OpenClaw 配置
   * @returns {Promise<Object>} 初始化结果
   */
  initOpenClawConfig: () => ipcRenderer.invoke('init-openclaw-config'),

  /**
   * 升级 OpenClaw
   * @returns {Promise<Object>} 升级结果
   */
  upgradeOpenClaw: () => ipcRenderer.invoke('upgrade-openclaw'),

  /**
   * 卸载 OpenClaw
   * @returns {Promise<Object>} 卸载结果
   */
  uninstallOpenClaw: () => ipcRenderer.invoke('uninstall-openclaw'),

  // ==================== ClawX 管理 ====================
  
  /**
   * 检测 ClawX 安装状态
   * @returns {Promise<Object>} { installed: boolean, path?: string, version?: string }
   */
  checkClawX: () => ipcRenderer.invoke('check-clawx'),

  /**
   * 下载 ClawX 源码
   * @returns {Promise<Object>} 下载结果
   */
  downloadClawX: () => ipcRenderer.invoke('download-clawx'),

  /**
   * 卸载 ClawX
   * @returns {Promise<Object>} 卸载结果
   */
  uninstallClawX: () => ipcRenderer.invoke('uninstall-clawx'),

  // ==================== 配置管理 ====================
  
  /**
   * 读取 OpenClaw 配置
   * @returns {Promise<Object>} { exists: boolean, config: Object, error?: string }
   */
  readOpenClawConfig: () => ipcRenderer.invoke('read-openclaw-config'),

  /**
   * 保存 OpenClaw 配置
   * @param {Object} config - 配置对象
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  saveOpenClawConfig: (config) => ipcRenderer.invoke('save-openclaw-config', config),

  // ==================== 服务管理 ====================
  
  /**
   * 启动 OpenClaw 服务
   * @returns {Promise<Object>} { success: boolean, started?: boolean, error?: string }
   */
  startService: () => ipcRenderer.invoke('start-service'),

  /**
   * 停止 OpenClaw 服务
   * @returns {Promise<Object>} { success: boolean, message?: string, error?: string }
   */
  stopService: () => ipcRenderer.invoke('stop-service'),

  /**
   * 检查服务运行状态
   * @returns {Promise<Object>} { running: boolean }
   */
  checkServiceStatus: () => ipcRenderer.invoke('check-service-status'),

  // ==================== 通用功能 ====================
  
  /**
   * 执行命令
   * @param {string} command - 命令字符串
   * @param {Object} options - 执行选项
   * @returns {Promise<Object>} 执行结果
   */
  executeCommand: (command, options = {}) => ipcRenderer.invoke('execute-command', command, options),

  /**
   * 执行命令（带实时输出）
   * @param {string} command - 命令
   * @param {Array} args - 参数数组
   * @param {Object} options - 执行选项
   * @returns {Promise<Object>} 执行结果
   */
  executeCommandStream: (command, args = [], options = {}) => 
    ipcRenderer.invoke('execute-command-stream', command, args, options),

  /**
   * 打开浏览器
   * @param {string} url - 要打开的 URL
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  openBrowser: (url) => ipcRenderer.invoke('open-browser', url),

  /**
   * 选择目录
   * @returns {Promise<Object>} { canceled: boolean, path?: string }
   */
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  /**
   * 获取安装路径配置
   * @returns {Promise<Object>} { openclawPath: string, clawxPath: string }
   */
  getInstallPaths: () => ipcRenderer.invoke('get-install-paths'),

  /**
   * 保存安装路径配置
   * @param {Object} paths - { openclawPath?: string, clawxPath?: string }
   * @returns {Promise<Object>} { success: boolean, error?: string }
   */
  saveInstallPaths: (paths) => ipcRenderer.invoke('save-install-paths', paths),

  /**
   * 显示消息对话框
   * @param {Object} options - 对话框选项
   * @returns {Promise<Object>} 用户选择结果
   */
  showMessage: (options) => ipcRenderer.invoke('show-message', options),

  /**
   * 下载文件
   * @param {string} url - 文件 URL
   * @param {string} destPath - 目标路径
   * @returns {Promise<Object>} 下载结果
   */
  downloadFile: (url, destPath) => ipcRenderer.invoke('download-file', url, destPath),

  // ==================== 事件监听 ====================
  
  /**
   * 监听命令输出
   * @param {Function} callback - 回调函数 (event, { type, data }) => {}
   */
  onCommandOutput: (callback) => {
    ipcRenderer.on('command-output', (event, data) => callback(data));
  },

  /**
   * 监听服务输出
   * @param {Function} callback - 回调函数 (event, { type, data }) => {}
   */
  onServiceOutput: (callback) => {
    ipcRenderer.on('service-output', (event, data) => callback(data));
  },

  /**
   * 监听服务状态变化
   * @param {Function} callback - 回调函数 (event, { running, code? }) => {}
   */
  onServiceStatus: (callback) => {
    ipcRenderer.on('service-status', (event, data) => callback(data));
  },

  /**
   * 监听下载进度
   * @param {Function} callback - 回调函数 (event, { progress, downloaded, total }) => {}
   */
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, data) => callback(data));
  },

  /**
   * 监听安装进度
   * @param {Function} callback - 回调函数 (event, { step, total, name }) => {}
   */
  onInstallProgress: (callback) => {
    ipcRenderer.on('install-progress', (event, data) => callback(data));
  },

  /**
   * 移除所有监听器
   */
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('command-output');
    ipcRenderer.removeAllListeners('service-output');
    ipcRenderer.removeAllListeners('service-status');
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('install-progress');
  }
});

/**
 * 暴露平台信息给渲染进程
 */
contextBridge.exposeInMainWorld('platform', {
  isWindows: true,
  arch: process.arch
});

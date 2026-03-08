/**
 * OpenClaw 部署助手 - 主进程
 * 负责窗口管理、系统权限处理、与渲染进程通信
 * 内置 OpenClaw 完整安装和管理功能
 * Windows 专属版本
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const os = require('os');
const { exec, spawn, execSync } = require('child_process');
const util = require('util');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const execPromise = util.promisify(exec);

// 全局窗口引用
let mainWindow = null;

// 服务进程管理
let serviceProcess = null;

// 国内镜像源配置
const MIRRORS = {
  npm: 'https://registry.npmmirror.com',
  nodeWin: 'https://npmmirror.com/mirrors/node',
  gitWin: 'https://npmmirror.com/mirrors/git-for-windows',
  github: 'https://gh.api.99988866.xyz/https://github.com',
  openclaw: 'https://github.com/openclaw/openclaw.git',
  openclawZip: 'https://github.com/openclaw/openclaw/archive/refs/heads/main.zip',
  clawx: 'https://github.com/ValueCell-ai/ClawX.git',
  clawxZip: 'https://gh.api.99988866.xyz/https://github.com/ValueCell-ai/ClawX/archive/refs/heads/main.zip'
};

// OpenClaw 默认端口
const OPENCLAW_PORT = 18789;

// 配置文件路径
const CONFIG_FILE = path.join(os.homedir(), '.openclaw-deployer.json');

// 读取配置
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return config;
    }
  } catch (e) {
    // 忽略错误
  }
  return {};
}

// 保存配置
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

// 获取 OpenClaw 安装路径
function getOpenClawPath() {
  const config = loadConfig();
  if (config.openclawPath && fs.existsSync(config.openclawPath)) {
    return config.openclawPath;
  }
  
  const primaryPath = path.join(os.homedir(), 'openclaw-main');
  const altPath = path.join(os.homedir(), '.openclaw');
  
  if (fs.existsSync(primaryPath)) {
    return primaryPath;
  } else if (fs.existsSync(altPath)) {
    return altPath;
  }
  return config.openclawPath || primaryPath;
}

// 获取 ClawX 安装路径
function getClawXPath() {
  const config = loadConfig();
  if (config.clawxPath && fs.existsSync(config.clawxPath)) {
    return config.clawxPath;
  }
  
  const primaryPath = path.join(os.homedir(), 'ClawX-main');
  const altPath = path.join(os.homedir(), 'ClawX');
  
  if (fs.existsSync(primaryPath)) {
    return primaryPath;
  } else if (fs.existsSync(altPath)) {
    return altPath;
  }
  return config.clawxPath || altPath;
}

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    title: 'OpenClaw 部署助手',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    center: true
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopService();
  });
}

// 应用初始化
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopService();
  app.quit();
});

app.on('before-quit', () => {
  stopService();
});

/**
 * ==================== IPC 通信处理 ====================
 */

// 获取系统信息
ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    isWindows: true,
    hostname: os.hostname(),
    userInfo: os.userInfo(),
    homedir: os.homedir(),
    mirrors: MIRRORS
  };
});

// 执行命令（通用）
ipcMain.handle('execute-command', async (event, command, options = {}) => {
  try {
    const { stdout, stderr } = await execPromise(command, {
      timeout: options.timeout || 60000,
      cwd: options.cwd || os.homedir(),
      env: { ...process.env, ...options.env }
    });
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
});

// 执行命令（实时输出）
ipcMain.handle('execute-command-stream', async (event, command, args = [], options = {}) => {
  return new Promise((resolve) => {
    const spawnOptions = {
      cwd: options.cwd || os.homedir(),
      env: { ...process.env, ...options.env },
      shell: true
    };

    const child = spawn(command, args, spawnOptions);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      event.sender.send('command-output', { type: 'stdout', data: chunk });
    });

    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      event.sender.send('command-output', { type: 'stderr', data: chunk });
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        code,
        stdout,
        stderr
      });
    });

    child.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        stdout,
        stderr
      });
    });

    if (options.timeout) {
      setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          error: '命令执行超时',
          stdout,
          stderr
        });
      }, options.timeout);
    }
  });
});

// 检测管理员权限
ipcMain.handle('check-admin', async () => {
  try {
    await execPromise('net session');
    return { isAdmin: true };
  } catch {
    return { isAdmin: false };
  }
});

// 检测 Node.js 安装
ipcMain.handle('check-nodejs', async () => {
  try {
    const { stdout } = await execPromise('node --version');
    const version = stdout.trim().replace('v', '');
    const majorVersion = parseInt(version.split('.')[0]);
    return {
      installed: true,
      version,
      majorVersion,
      meetsRequirement: majorVersion >= 22
    };
  } catch {
    return { installed: false };
  }
});

// 检测 Git 安装
ipcMain.handle('check-git', async () => {
  try {
    const { stdout } = await execPromise('git --version');
    const match = stdout.match(/git version (\d+\.\d+\.?\d*)/i);
    return {
      installed: true,
      version: match ? match[1] : 'unknown'
    };
  } catch {
    return { installed: false };
  }
});

// 检测 pnpm 安装
ipcMain.handle('check-pnpm', async () => {
  try {
    const { stdout } = await execPromise('pnpm --version');
    return {
      installed: true,
      version: stdout.trim()
    };
  } catch {
    return { installed: false };
  }
});

// 检测 OpenClaw 安装
ipcMain.handle('check-openclaw', async () => {
  const openclawPath = path.join(os.homedir(), 'openclaw-main');
  const altPath = path.join(os.homedir(), '.openclaw');
  
  let installPath = null;
  if (fs.existsSync(openclawPath)) {
    installPath = openclawPath;
  } else if (fs.existsSync(altPath)) {
    installPath = altPath;
  }
  
  if (!installPath) {
    return { installed: false };
  }

  let version = 'unknown';
  let built = false;
  
  try {
    const packageJsonPath = path.join(installPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      version = packageJson.version || 'unknown';
    }
    
    const distPath = path.join(installPath, 'dist');
    built = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.js'));
  } catch (e) {
    // 忽略错误
  }

  return {
    installed: true,
    path: installPath,
    version,
    built
  };
});

// 检测 ClawX 安装
ipcMain.handle('check-clawx', async () => {
  const clawxPath = getClawXPath();
  
  if (!fs.existsSync(clawxPath)) {
    return { installed: false };
  }

  let version = 'unknown';
  
  try {
    const packageJsonPath = path.join(clawxPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      version = packageJson.version || 'unknown';
    }
  } catch (e) {
    // 忽略错误
  }

  return {
    installed: true,
    path: clawxPath,
    version
  };
});

// 安装 pnpm
ipcMain.handle('install-pnpm', async (event) => {
  try {
    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在安装 pnpm...\n' });
    
    const child = spawn('npm', ['install', '-g', 'pnpm', '--registry=' + MIRRORS.npm], {
      shell: true,
      cwd: os.homedir()
    });
    
    const result = await handleStreamOutput(child, event);
    
    if (result.success) {
      event.sender.send('command-output', { type: 'stdout', data: '[成功] pnpm 安装完成\n' });
      
      try {
        execSync('pnpm config set registry ' + MIRRORS.npm, { shell: true });
        event.sender.send('command-output', { type: 'stdout', data: '[信息] pnpm 镜像已配置\n' });
      } catch (e) {
        // 忽略配置错误
      }
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 安装 Node.js (Windows)
ipcMain.handle('install-nodejs-windows', async (event) => {
  const installScript = path.join(__dirname, '../scripts/install-nodejs-win.ps1');
  
  try {
    const child = spawn('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-File', installScript
    ], { shell: true });

    return handleStreamOutput(child, event);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 安装 Git (Windows)
ipcMain.handle('install-git-windows', async (event) => {
  const installScript = path.join(__dirname, '../scripts/install-git-win.ps1');
  
  try {
    const child = spawn('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-File', installScript
    ], { shell: true });

    return handleStreamOutput(child, event);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 下载 OpenClaw
ipcMain.handle('download-openclaw', async (event) => {
  return downloadOpenClawInternal(event);
});

async function downloadOpenClawInternal(event) {
  const openclawPath = getOpenClawPath();
  const tempZip = path.join(os.tmpdir(), 'openclaw.zip');
  
  try {
    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在下载 OpenClaw...\n' });
    
    // 清理旧目录
    if (fs.existsSync(openclawPath)) {
      fs.rmSync(openclawPath, { recursive: true, force: true });
    }
    if (fs.existsSync(tempZip)) {
      fs.unlinkSync(tempZip);
    }
    
    // 下载 zip 文件
    await downloadFile(MIRRORS.openclawZip, tempZip, event);
    
    event.sender.send('command-output', { type: 'stdout', data: '[成功] 下载完成\n' });
    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在解压...\n' });
    
    // 解压
    const extractPath = path.join(os.homedir(), 'openclaw-temp');
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    
    // 使用 PowerShell 解压
    await execPromise(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${extractPath}' -Force"`);
    
    // 重命名目录
    const extractedDir = path.join(extractPath, 'openclaw-main');
    if (fs.existsSync(extractedDir)) {
      fs.renameSync(extractedDir, openclawPath);
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    
    // 清理临时文件
    fs.unlinkSync(tempZip);
    
    event.sender.send('command-output', { type: 'stdout', data: '[成功] 解压完成\n' });
    
    return { success: true };
  } catch (error) {
    event.sender.send('command-output', { type: 'stderr', data: `[错误] ${error.message}\n` });
    return { success: false, error: error.message };
  }
}

// 安装 OpenClaw 依赖
ipcMain.handle('install-openclaw-deps', async (event) => {
  return installOpenClawDepsInternal(event);
});

async function installOpenClawDepsInternal(event) {
  const openclawPath = getOpenClawPath();
  
  try {
    if (!fs.existsSync(openclawPath)) {
      return { success: false, error: 'OpenClaw 未下载' };
    }
    
    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在安装依赖...\n' });
    
    // 检查 pnpm 是否安装
    let pnpmInstalled = false;
    try {
      execSync('pnpm --version', { shell: true });
      pnpmInstalled = true;
    } catch (e) {
      // pnpm 未安装
    }
    
    if (!pnpmInstalled) {
      event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在安装 pnpm...\n' });
      await execPromise('npm install -g pnpm --registry=' + MIRRORS.npm);
      event.sender.send('command-output', { type: 'stdout', data: '[成功] pnpm 安装完成\n' });
    }
    
    // 配置 Git 使用 HTTPS 代替 SSH
    try {
      execSync('git config --global url."https://github.com/".insteadOf "ssh://git@github.com/"', { shell: true });
      execSync('git config --global url."https://github.com/".insteadOf "git@github.com:"', { shell: true });
    } catch (e) {
      // 忽略配置错误
    }
    
    // 使用 pnpm 安装依赖
    const child = spawn('pnpm', ['install'], {
      cwd: openclawPath,
      shell: true,
      env: { ...process.env }
    });
    
    const result = await handleStreamOutput(child, event);
    
    if (result.success) {
      event.sender.send('command-output', { type: 'stdout', data: '[成功] 依赖安装完成\n' });
    }
    
    return result;
  } catch (error) {
    event.sender.send('command-output', { type: 'stderr', data: `[错误] ${error.message}\n` });
    return { success: false, error: error.message };
  }
}

// 构建 OpenClaw
ipcMain.handle('build-openclaw', async (event) => {
  return buildOpenClawInternal(event);
});

async function buildOpenClawInternal(event) {
  const openclawPath = getOpenClawPath();
  
  try {
    if (!fs.existsSync(openclawPath)) {
      return { success: false, error: 'OpenClaw 未安装' };
    }
    
    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在构建 OpenClaw...\n' });
    
    const buildSteps = [
      { name: 'tsdown 构建', cmd: 'node', args: ['scripts/tsdown-build.mjs'] },
      { name: '复制 SDK 别名', cmd: 'node', args: ['scripts/copy-plugin-sdk-root-alias.mjs'] },
      { name: '生成类型定义', cmd: 'pnpm', args: ['build:plugin-sdk:dts'] },
      { name: '写入构建信息', cmd: 'node', args: ['--import', 'tsx', 'scripts/write-build-info.ts'] },
      { name: '写入启动元数据', cmd: 'node', args: ['--import', 'tsx', 'scripts/write-cli-startup-metadata.ts'] },
      { name: '写入兼容层', cmd: 'node', args: ['--import', 'tsx', 'scripts/write-cli-compat.ts'] }
    ];
    
    for (const step of buildSteps) {
      event.sender.send('command-output', { type: 'stdout', data: `[信息] ${step.name}...\n` });
      
      try {
        const child = spawn(step.cmd, step.args, {
          cwd: openclawPath,
          shell: true,
          env: { ...process.env }
        });
        
        await handleStreamOutput(child, event);
      } catch (e) {
        event.sender.send('command-output', { type: 'stderr', data: `[警告] ${step.name} 失败，继续...\n` });
      }
    }
    
    // 检查构建结果
    const distPath = path.join(openclawPath, 'dist');
    if (fs.existsSync(distPath)) {
      event.sender.send('command-output', { type: 'stdout', data: '[成功] OpenClaw 构建完成\n' });
      return { success: true };
    } else {
      event.sender.send('command-output', { type: 'stderr', data: '[错误] 构建失败，dist 目录不存在\n' });
      return { success: false, error: '构建失败' };
    }
  } catch (error) {
    event.sender.send('command-output', { type: 'stderr', data: `[错误] ${error.message}\n` });
    return { success: false, error: error.message };
  }
}

// 初始化 OpenClaw 配置
ipcMain.handle('init-openclaw-config', async (event) => {
  return initOpenClawConfigInternal(event);
});

async function initOpenClawConfigInternal(event) {
  const openclawPath = getOpenClawPath();
  
  try {
    if (!fs.existsSync(openclawPath)) {
      return { success: false, error: 'OpenClaw 未安装' };
    }
    
    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在初始化配置...\n' });
    
    const child = spawn('node', ['openclaw.mjs', 'onboard', '--non-interactive', '--accept-risk', '--mode', 'local'], {
      cwd: openclawPath,
      shell: true,
      env: { ...process.env }
    });
    
    const result = await handleStreamOutput(child, event);
    
    if (result.success) {
      event.sender.send('command-output', { type: 'stdout', data: '[成功] 配置初始化完成\n' });
    }
    
    return result;
  } catch (error) {
    event.sender.send('command-output', { type: 'stderr', data: `[错误] ${error.message}\n` });
    return { success: false, error: error.message };
  }
}

// 一键安装 OpenClaw（完整流程）
ipcMain.handle('install-openclaw-full', async (event) => {
  const steps = [
    { name: '下载 OpenClaw', fn: downloadOpenClawInternal },
    { name: '安装依赖', fn: installOpenClawDepsInternal },
    { name: '构建项目', fn: buildOpenClawInternal },
    { name: '初始化配置', fn: initOpenClawConfigInternal }
  ];
  
  const results = [];
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    event.sender.send('install-progress', { 
      step: i + 1, 
      total: steps.length, 
      name: step.name 
    });
    
    event.sender.send('command-output', { 
      type: 'stdout', 
      data: `\n========== ${step.name} (${i + 1}/${steps.length}) ==========\n` 
    });
    
    try {
      const result = await step.fn(event);
      results.push({ step: step.name, ...result });
      
      if (!result.success) {
        event.sender.send('command-output', { 
          type: 'stderr', 
          data: `[错误] ${step.name} 失败: ${result.error || '未知错误'}\n` 
        });
        return { success: false, step: step.name, error: result.error, results };
      }
    } catch (error) {
      results.push({ step: step.name, success: false, error: error.message });
      return { success: false, step: step.name, error: error.message, results };
    }
  }
  
  event.sender.send('command-output', { 
    type: 'stdout', 
    data: '\n========== 安装完成！ ==========\n' 
  });
  
  return { success: true, results };
});

// 安装 OpenClaw
ipcMain.handle('install-openclaw', async (event) => {
  return installOpenClawFull(event);
});

// 升级 OpenClaw
ipcMain.handle('upgrade-openclaw', async (event) => {
  const openclawPath = getOpenClawPath();
  
  try {
    if (!fs.existsSync(openclawPath)) {
      return { success: false, error: 'OpenClaw 未安装' };
    }

    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在更新 OpenClaw...\n' });
    
    const pullChild = spawn('git', ['pull'], {
      cwd: openclawPath,
      shell: true
    });

    const result = await handleStreamOutput(pullChild, event);
    
    if (result.success) {
      event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在更新依赖...\n' });
      
      const pnpmChild = spawn('pnpm', ['install'], {
        cwd: openclawPath,
        shell: true
      });
      
      await handleStreamOutput(pnpmChild, event);
      
      event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在重新构建...\n' });
      await buildOpenClawInternal(event);
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 卸载 OpenClaw
ipcMain.handle('uninstall-openclaw', async () => {
  const openclawPath = getOpenClawPath();
  
  try {
    await stopService();
    
    if (fs.existsSync(openclawPath)) {
      fs.rmSync(openclawPath, { recursive: true, force: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 下载 ClawX
ipcMain.handle('download-clawx', async (event) => {
  const clawxPath = getClawXPath();
  
  try {
    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在下载 ClawX...\n' });
    event.sender.send('command-output', { type: 'stdout', data: '[信息] 使用 git clone 方式下载...\n' });
    
    // 清理旧目录
    if (fs.existsSync(clawxPath)) {
      fs.rmSync(clawxPath, { recursive: true, force: true });
    }
    
    // 使用 git clone 下载
    const cloneUrl = 'https://github.com/ValueCell-ai/ClawX.git';
    
    const child = spawn('git', ['clone', cloneUrl, clawxPath], {
      shell: true,
      cwd: os.homedir()
    });
    
    const result = await handleStreamOutput(child, event);
    
    if (result.success) {
      event.sender.send('command-output', { type: 'stdout', data: '[成功] ClawX 下载完成\n' });
      event.sender.send('command-output', { type: 'stdout', data: '[信息] 请按照 ClawX 文档进行安装配置\n' });
      event.sender.send('command-output', { type: 'stdout', data: `[信息] ClawX 目录: ${clawxPath}\n` });
      return { success: true, path: clawxPath };
    } else {
      throw new Error(result.stderr || result.error || 'git clone 失败');
    }
  } catch (error) {
    event.sender.send('command-output', { type: 'stderr', data: `[错误] ${error.message}\n` });
    return { success: false, error: error.message };
  }
});

// 卸载 ClawX
ipcMain.handle('uninstall-clawx', async () => {
  const clawxPath = getClawXPath();
  
  try {
    if (fs.existsSync(clawxPath)) {
      fs.rmSync(clawxPath, { recursive: true, force: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 读取 OpenClaw 配置
ipcMain.handle('read-openclaw-config', async () => {
  const openclawPath = getOpenClawPath();
  const configPath = path.join(openclawPath, 'openclaw.json');
  
  try {
    if (!fs.existsSync(configPath)) {
      return { exists: false, config: {} };
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return { exists: true, config };
  } catch (error) {
    return { exists: false, error: error.message, config: {} };
  }
});

// 保存 OpenClaw 配置
ipcMain.handle('save-openclaw-config', async (event, config) => {
  const openclawDir = getOpenClawPath();
  const configPath = path.join(openclawDir, 'openclaw.json');
  
  try {
    if (!fs.existsSync(openclawDir)) {
      return { success: false, error: 'OpenClaw 未安装' };
    }
    
    let existingConfig = {};
    if (fs.existsSync(configPath)) {
      try {
        existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (e) {
        // 忽略解析错误
      }
    }
    
    const mergedConfig = { ...existingConfig, ...config };
    fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2), 'utf8');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 启动 OpenClaw 服务
ipcMain.handle('start-service', async (event) => {
  const openclawPath = getOpenClawPath();
  
  try {
    if (serviceProcess) {
      return { success: false, error: '服务已经在运行中' };
    }

    if (!fs.existsSync(openclawPath)) {
      return { success: false, error: 'OpenClaw 未安装' };
    }

    const distPath = path.join(openclawPath, 'dist');
    if (!fs.existsSync(distPath)) {
      return { success: false, error: 'OpenClaw 未构建，请先构建项目' };
    }

    event.sender.send('command-output', { type: 'stdout', data: '[信息] 正在启动 OpenClaw 服务...\n' });

    serviceProcess = spawn('node', ['openclaw.mjs', 'gateway', '--port', String(OPENCLAW_PORT), '--allow-unconfigured'], {
      cwd: openclawPath,
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' }
    });

    let started = false;

    serviceProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      event.sender.send('service-output', { type: 'stdout', data: chunk });
      
      if (chunk.includes('listening') || chunk.includes('started') || chunk.includes('running')) {
        started = true;
        event.sender.send('service-status', { running: true });
      }
    });

    serviceProcess.stderr.on('data', (data) => {
      event.sender.send('service-output', { type: 'stderr', data: data.toString() });
    });

    serviceProcess.on('close', (code) => {
      serviceProcess = null;
      event.sender.send('service-status', { running: false, code });
    });

    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (started) {
      event.sender.send('command-output', { type: 'stdout', data: `[成功] OpenClaw 服务已启动，访问地址: http://127.0.0.1:${OPENCLAW_PORT}\n` });
    }
    
    return { success: true, started, port: OPENCLAW_PORT };
  } catch (error) {
    event.sender.send('command-output', { type: 'stderr', data: `[错误] ${error.message}\n` });
    return { success: false, error: error.message };
  }
});

// 停止 OpenClaw 服务
ipcMain.handle('stop-service', async () => {
  return stopService();
});

// 检查服务状态
ipcMain.handle('check-service-status', async () => {
  return { running: serviceProcess !== null };
});

// 打开浏览器
ipcMain.handle('open-browser', async (event, url) => {
  try {
    const targetUrl = url || `http://127.0.0.1:${OPENCLAW_PORT}`;
    await shell.openExternal(targetUrl);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 选择目录
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  return { canceled: false, path: result.filePaths[0] };
});

// 获取安装路径配置
ipcMain.handle('get-install-paths', async () => {
  const config = loadConfig();
  return {
    openclawPath: config.openclawPath || '',
    clawxPath: config.clawxPath || ''
  };
});

// 保存安装路径配置
ipcMain.handle('save-install-paths', async (event, paths) => {
  try {
    const config = loadConfig();
    if (paths.openclawPath) {
      config.openclawPath = paths.openclawPath;
    }
    if (paths.clawxPath) {
      config.clawxPath = paths.clawxPath;
    }
    saveConfig(config);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 显示消息框
ipcMain.handle('show-message', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// 下载文件
ipcMain.handle('download-file', async (event, url, destPath) => {
  try {
    await downloadFile(url, destPath, event);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * ==================== 辅助函数 ====================
 */

// 下载文件
async function downloadFile(url, destPath, event) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {};
    if (url.startsWith('https')) {
      options.rejectUnauthorized = false;
    }
    
    const request = protocol.get(url, options, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(response.headers.location, destPath, event).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`下载失败: HTTP ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'] || '0');
      let downloaded = 0;

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (totalSize > 0 && event) {
          const progress = Math.round((downloaded / totalSize) * 100);
          event.sender.send('download-progress', { progress, downloaded, total: totalSize });
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });

    request.end();
  });
}

// 处理流输出
function handleStreamOutput(child, event) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      if (event && event.sender) {
        event.sender.send('command-output', { type: 'stdout', data: chunk });
      }
    });

    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      if (event && event.sender) {
        event.sender.send('command-output', { type: 'stderr', data: chunk });
      }
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        code,
        stdout,
        stderr
      });
    });

    child.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        stdout,
        stderr
      });
    });
  });
}

// 停止服务
function stopService() {
  return new Promise((resolve) => {
    if (!serviceProcess) {
      resolve({ success: true, message: '服务未运行' });
      return;
    }

    try {
      spawn('taskkill', ['/pid', serviceProcess.pid, '/f', '/t'], { shell: true });
      serviceProcess = null;
      resolve({ success: true });
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

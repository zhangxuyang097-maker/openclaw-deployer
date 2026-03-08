/**
 * OpenClaw 部署助手 - 前端应用逻辑
 * 负责 UI 交互、状态管理和与主进程通信
 * Windows 专属版本
 */

// ==================== 全局状态 ====================
const state = {
  systemInfo: null,
  envStatus: {
    admin: null,
    nodejs: null,
    git: null,
    openclaw: null
  },
  serviceRunning: false,
  serviceStartTime: null,
  logs: [],
  autoScroll: true,
  currentSection: 'dashboard'
};

// ==================== DOM 元素缓存 ====================
const elements = {};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', async () => {
  cacheElements();
  bindEvents();
  await initialize();
});

/**
 * 缓存 DOM 元素引用
 */
function cacheElements() {
  // 导航
  elements.navItems = document.querySelectorAll('.nav-item');
  elements.sections = document.querySelectorAll('.section');
  elements.pageTitle = document.getElementById('page-title');
  elements.platformBadge = document.getElementById('platform-badge');
  
  // 按钮
  elements.refreshBtn = document.getElementById('refresh-btn');
  elements.helpBtn = document.getElementById('help-btn');
  
  // 环境检测卡片
  elements.adminStatus = document.getElementById('admin-status');
  elements.adminDesc = document.getElementById('admin-desc');
  elements.adminFixBtn = document.getElementById('admin-fix-btn');
  
  elements.nodejsStatus = document.getElementById('nodejs-status');
  elements.nodejsDesc = document.getElementById('nodejs-desc');
  elements.nodejsVersion = document.getElementById('nodejs-version');
  elements.nodejsInstallBtn = document.getElementById('nodejs-install-btn');
  
  elements.gitStatus = document.getElementById('git-status');
  elements.gitDesc = document.getElementById('git-desc');
  elements.gitVersion = document.getElementById('git-version');
  elements.gitInstallBtn = document.getElementById('git-install-btn');
  
  elements.openclawStatus = document.getElementById('openclaw-status');
  elements.openclawDesc = document.getElementById('openclaw-desc');
  elements.openclawVersion = document.getElementById('openclaw-version');
  elements.openclawInstallBtn = document.getElementById('openclaw-install-btn');
  elements.openclawUpgradeBtn = document.getElementById('openclaw-upgrade-btn');
  elements.openclawUninstallBtn = document.getElementById('openclaw-uninstall-btn');
  
  elements.clawxStatus = document.getElementById('clawx-status');
  elements.clawxDesc = document.getElementById('clawx-desc');
  elements.clawxVersion = document.getElementById('clawx-version');
  elements.clawxInstallBtn = document.getElementById('clawx-install-btn');
  elements.clawxUninstallBtn = document.getElementById('clawx-uninstall-btn');
  
  // 一键修复
  elements.quickFixBtn = document.getElementById('quick-fix-btn');
  
  // 安装向导
  elements.startInstallBtn = document.getElementById('start-install-btn');
  elements.installProgress = document.getElementById('install-progress');
  elements.installActions = document.getElementById('install-actions');
  elements.progressFill = document.getElementById('progress-fill');
  elements.progressText = document.getElementById('progress-text');
  
  // 配置表单
  elements.configForm = document.getElementById('config-form');
  elements.apiKey = document.getElementById('api-key');
  elements.baseUrl = document.getElementById('base-url');
  elements.modelName = document.getElementById('model-name');
  elements.servicePort = document.getElementById('service-port');
  elements.temperature = document.getElementById('temperature');
  elements.temperatureValue = document.getElementById('temperature-value');
  elements.saveConfigBtn = document.getElementById('save-config-btn');
  elements.resetConfigBtn = document.getElementById('reset-config-btn');
  elements.presetBtns = document.querySelectorAll('.preset-btn');
  
  // 安装路径设置
  elements.openclawPath = document.getElementById('openclaw-path');
  elements.clawxPath = document.getElementById('clawx-path');
  elements.selectOpenclawPathBtn = document.getElementById('select-openclaw-path-btn');
  elements.selectClawXPathBtn = document.getElementById('select-clawx-path-btn');
  elements.savePathBtn = document.getElementById('save-path-btn');
  elements.resetPathBtn = document.getElementById('reset-path-btn');
  
  // 服务管理
  elements.serviceIndicator = document.getElementById('service-indicator');
  elements.statusDot = document.querySelector('.status-dot');
  elements.statusText = document.querySelector('.status-text');
  elements.startServiceBtn = document.getElementById('start-service-btn');
  elements.stopServiceBtn = document.getElementById('stop-service-btn');
  elements.openPanelBtn = document.getElementById('open-panel-btn');
  elements.serviceUrl = document.getElementById('service-url');
  elements.uptime = document.getElementById('uptime');
  elements.processStatus = document.getElementById('process-status');
  
  // 日志
  elements.logsOutput = document.getElementById('logs-output');
  elements.clearLogsBtn = document.getElementById('clear-logs-btn');
  elements.exportLogsBtn = document.getElementById('export-logs-btn');
  elements.autoScrollBtn = document.getElementById('auto-scroll-btn');
  elements.filterBtns = document.querySelectorAll('.filter-btn');
  
  // 遮罩
  elements.overlay = document.getElementById('overlay');
  elements.loadingText = document.getElementById('loading-text');
  elements.toastContainer = document.getElementById('toast-container');
}

/**
 * 绑定事件处理器
 */
function bindEvents() {
  // 导航切换
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => switchSection(item.dataset.section));
  });
  
  // 刷新按钮
  elements.refreshBtn.addEventListener('click', refreshAllStatus);
  
  // 帮助按钮
  elements.helpBtn.addEventListener('click', showHelp);
  
  // 环境修复按钮
  elements.adminFixBtn.addEventListener('click', fixAdmin);
  elements.nodejsInstallBtn.addEventListener('click', installNodejs);
  elements.gitInstallBtn.addEventListener('click', installGit);
  
  // OpenClaw 管理
  elements.openclawInstallBtn.addEventListener('click', installOpenClaw);
  elements.openclawUpgradeBtn.addEventListener('click', upgradeOpenClaw);
  elements.openclawUninstallBtn.addEventListener('click', uninstallOpenClaw);
  
  // ClawX 管理
  elements.clawxInstallBtn.addEventListener('click', downloadClawX);
  elements.clawxUninstallBtn.addEventListener('click', uninstallClawX);
  
  // 一键修复
  elements.quickFixBtn.addEventListener('click', quickFix);
  
  // 安装向导
  elements.startInstallBtn.addEventListener('click', startFullInstall);
  
  // 配置表单
  elements.temperature.addEventListener('input', (e) => {
    elements.temperatureValue.textContent = e.target.value;
  });
  elements.saveConfigBtn.addEventListener('click', saveConfig);
  elements.resetConfigBtn.addEventListener('click', resetConfig);
  elements.presetBtns.forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });
  
  // 安装路径设置
  elements.selectOpenclawPathBtn.addEventListener('click', selectOpenclawPath);
  elements.selectClawXPathBtn.addEventListener('click', selectClawXPath);
  elements.savePathBtn.addEventListener('click', saveInstallPaths);
  elements.resetPathBtn.addEventListener('click', resetInstallPaths);
  
  // 服务管理
  elements.startServiceBtn.addEventListener('click', startService);
  elements.stopServiceBtn.addEventListener('click', stopService);
  elements.openPanelBtn.addEventListener('click', openPanel);
  
  // 日志
  elements.clearLogsBtn.addEventListener('click', clearLogs);
  elements.exportLogsBtn.addEventListener('click', exportLogs);
  elements.autoScrollBtn.addEventListener('click', toggleAutoScroll);
  elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => filterLogs(btn.dataset.filter));
  });
  
  // 监听主进程事件
  window.electronAPI.onCommandOutput((data) => {
    addLog(data.data, data.type === 'stderr' ? 'error' : 'info');
  });
  
  window.electronAPI.onServiceOutput((data) => {
    addLog(data.data, data.type === 'stderr' ? 'error' : 'info');
  });
  
  window.electronAPI.onServiceStatus((data) => {
    updateServiceStatus(data.running);
  });
  
  window.electronAPI.onDownloadProgress((data) => {
    updateProgress(data.progress);
  });

  window.electronAPI.onInstallProgress((data) => {
    updateProgress(Math.round((data.step / data.total) * 100), data.name);
  });
}

/**
 * 初始化应用
 */
async function initialize() {
  try {
    showLoading('正在初始化...');
    
    // 获取系统信息
    state.systemInfo = await window.electronAPI.getSystemInfo();
    updatePlatformBadge();
    
    // 检测环境状态
    await refreshAllStatus();
    
    // 加载配置
    await loadConfig();
    
    // 加载安装路径配置
    await loadInstallPaths();
    
    // 检查服务状态
    await checkServiceStatus();
    
    hideLoading();
    showToast('初始化完成', 'success');
  } catch (error) {
    hideLoading();
    showToast('初始化失败: ' + error.message, 'error');
    console.error('初始化错误:', error);
  }
}

/**
 * 更新平台标识
 */
function updatePlatformBadge() {
  const { arch } = state.systemInfo;
  let platformText = 'Windows';
  
  if (arch === 'x64') {
    platformText += ' (64位)';
  } else if (arch === 'arm64') {
    platformText += ' (ARM64)';
  }
  
  elements.platformBadge.textContent = platformText;
}

/**
 * 切换页面区块
 */
function switchSection(sectionName) {
  // 更新导航状态
  elements.navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionName);
  });
  
  // 更新页面显示
  elements.sections.forEach(section => {
    section.classList.toggle('active', section.id === `${sectionName}-section`);
  });
  
  // 更新标题
  const titles = {
    dashboard: '环境检测',
    install: '一键安装',
    config: '配置面板',
    service: '服务管理',
    logs: '运行日志'
  };
  elements.pageTitle.textContent = titles[sectionName] || 'OpenClaw 部署助手';
  
  state.currentSection = sectionName;
}

/**
 * 刷新所有状态
 */
async function refreshAllStatus() {
  showLoading('正在检测环境...');
  
  try {
    const [admin, nodejs, git, openclaw, clawx] = await Promise.all([
      window.electronAPI.checkAdmin(),
      window.electronAPI.checkNodejs(),
      window.electronAPI.checkGit(),
      window.electronAPI.checkOpenClaw(),
      window.electronAPI.checkClawX()
    ]);
    
    state.envStatus = { admin, nodejs, git, openclaw, clawx };
    
    updateAdminUI(admin);
    updateNodejsUI(nodejs);
    updateGitUI(git);
    updateOpenClawUI(openclaw);
    updateClawXUI(clawx);
    
    hideLoading();
  } catch (error) {
    hideLoading();
    showToast('状态检测失败: ' + error.message, 'error');
  }
}

/**
 * 更新管理员权限 UI
 */
function updateAdminUI(status) {
  state.envStatus.admin = status;
  
  if (status.isAdmin) {
    elements.adminStatus.textContent = '已获得';
    elements.adminStatus.className = 'status-badge success';
    elements.adminDesc.textContent = '已获取管理员权限，可以正常安装软件';
    elements.adminFixBtn.disabled = true;
  } else {
    elements.adminStatus.textContent = '未获得';
    elements.adminStatus.className = 'status-badge warning';
    elements.adminDesc.textContent = '需要管理员权限才能安装系统组件';
    elements.adminFixBtn.disabled = false;
  }
}

/**
 * 更新 Node.js UI
 */
function updateNodejsUI(status) {
  state.envStatus.nodejs = status;
  
  if (status.installed) {
    if (status.meetsRequirement) {
      elements.nodejsStatus.textContent = '已安装';
      elements.nodejsStatus.className = 'status-badge success';
      elements.nodejsDesc.textContent = 'Node.js 版本符合要求';
    } else {
      elements.nodejsStatus.textContent = '版本过低';
      elements.nodejsStatus.className = 'status-badge warning';
      elements.nodejsDesc.textContent = `当前版本 ${status.version}，需要 >= 22`;
    }
    elements.nodejsVersion.textContent = `v${status.version}`;
    elements.nodejsInstallBtn.textContent = '重新安装';
  } else {
    elements.nodejsStatus.textContent = '未安装';
    elements.nodejsStatus.className = 'status-badge error';
    elements.nodejsDesc.textContent = '需要安装 Node.js >= 22';
    elements.nodejsVersion.textContent = '';
    elements.nodejsInstallBtn.textContent = '安装';
  }
  elements.nodejsInstallBtn.disabled = false;
}

/**
 * 更新 Git UI
 */
function updateGitUI(status) {
  state.envStatus.git = status;
  
  if (status.installed) {
    elements.gitStatus.textContent = '已安装';
    elements.gitStatus.className = 'status-badge success';
    elements.gitDesc.textContent = 'Git 已正确安装';
    elements.gitVersion.textContent = `v${status.version}`;
    elements.gitInstallBtn.textContent = '重新安装';
  } else {
    elements.gitStatus.textContent = '未安装';
    elements.gitStatus.className = 'status-badge error';
    elements.gitDesc.textContent = '需要安装 Git 版本控制工具';
    elements.gitVersion.textContent = '';
    elements.gitInstallBtn.textContent = '安装';
  }
  elements.gitInstallBtn.disabled = false;
}

/**
 * 更新 OpenClaw UI
 */
function updateOpenClawUI(status) {
  state.envStatus.openclaw = status;
  
  if (status.installed) {
    elements.openclawStatus.textContent = '已安装';
    elements.openclawStatus.className = 'status-badge success';
    elements.openclawDesc.textContent = 'OpenClaw 已准备就绪';
    elements.openclawVersion.textContent = `v${status.version}`;
    elements.openclawInstallBtn.disabled = true;
    elements.openclawUpgradeBtn.disabled = false;
    elements.openclawUninstallBtn.disabled = false;
  } else {
    elements.openclawStatus.textContent = '未安装';
    elements.openclawStatus.className = 'status-badge error';
    elements.openclawDesc.textContent = '需要安装 OpenClaw';
    elements.openclawVersion.textContent = '';
    elements.openclawInstallBtn.disabled = false;
    elements.openclawUpgradeBtn.disabled = true;
    elements.openclawUninstallBtn.disabled = true;
  }
}

/**
 * 更新 ClawX UI
 */
function updateClawXUI(status) {
  state.envStatus.clawx = status;
  
  if (status.installed) {
    elements.clawxStatus.textContent = '已下载';
    elements.clawxStatus.className = 'status-badge success';
    elements.clawxDesc.textContent = 'ClawX 已下载，请按文档安装';
    elements.clawxVersion.textContent = `v${status.version}`;
    elements.clawxInstallBtn.textContent = '重新下载';
    elements.clawxInstallBtn.disabled = false;
    elements.clawxUninstallBtn.disabled = false;
  } else {
    elements.clawxStatus.textContent = '未下载';
    elements.clawxStatus.className = 'status-badge warning';
    elements.clawxDesc.textContent = '下载 ClawX 源码';
    elements.clawxVersion.textContent = '';
    elements.clawxInstallBtn.textContent = '下载';
    elements.clawxInstallBtn.disabled = false;
    elements.clawxUninstallBtn.disabled = true;
  }
}

// ==================== 安装功能 ====================

/**
 * 安装 Node.js
 */
async function installNodejs() {
  showLoading('正在安装 Node.js...');
  addLog('开始安装 Node.js...', 'info');
  
  try {
    const result = await window.electronAPI.installNodejsWindows();
    
    if (result.success) {
      showToast('Node.js 安装成功', 'success');
      addLog('Node.js 安装完成', 'success');
      await refreshAllStatus();
    } else {
      throw new Error(result.error || '安装失败');
    }
  } catch (error) {
    showToast('Node.js 安装失败: ' + error.message, 'error');
    addLog('Node.js 安装失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 安装 Git
 */
async function installGit() {
  showLoading('正在安装 Git...');
  addLog('开始安装 Git...', 'info');
  
  try {
    const result = await window.electronAPI.installGitWindows();
    
    if (result.success) {
      showToast('Git 安装成功', 'success');
      addLog('Git 安装完成', 'success');
      await refreshAllStatus();
    } else {
      throw new Error(result.error || '安装失败');
    }
  } catch (error) {
    showToast('Git 安装失败: ' + error.message, 'error');
    addLog('Git 安装失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 安装 OpenClaw
 */
async function installOpenClaw() {
  if (!state.envStatus.nodejs?.installed || !state.envStatus.nodejs?.meetsRequirement) {
    showToast('请先安装 Node.js >= 22', 'warning');
    switchSection('dashboard');
    return;
  }
  
  if (!state.envStatus.git?.installed) {
    showToast('请先安装 Git', 'warning');
    switchSection('dashboard');
    return;
  }
  
  showLoading('正在安装 OpenClaw...');
  addLog('开始安装 OpenClaw...', 'info');
  addLog('将执行以下步骤：下载源码 → 安装依赖 → 构建项目 → 初始化配置', 'info');
  
  try {
    const result = await window.electronAPI.installOpenClawFull();
    
    if (result.success) {
      showToast('OpenClaw 安装成功！', 'success');
      addLog('OpenClaw 安装完成！', 'success');
      await refreshAllStatus();
    } else {
      throw new Error(result.error || '安装失败');
    }
  } catch (error) {
    showToast('OpenClaw 安装失败: ' + error.message, 'error');
    addLog('OpenClaw 安装失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 升级 OpenClaw
 */
async function upgradeOpenClaw() {
  showLoading('正在升级 OpenClaw...');
  addLog('开始升级 OpenClaw...', 'info');
  
  try {
    const result = await window.electronAPI.upgradeOpenClaw();
    
    if (result.success) {
      showToast('OpenClaw 升级成功', 'success');
      addLog('OpenClaw 升级完成', 'success');
      await refreshAllStatus();
    } else {
      throw new Error(result.error || '升级失败');
    }
  } catch (error) {
    showToast('OpenClaw 升级失败: ' + error.message, 'error');
    addLog('OpenClaw 升级失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 卸载 OpenClaw
 */
async function uninstallOpenClaw() {
  const result = await window.electronAPI.showMessage({
    type: 'question',
    buttons: ['取消', '确认卸载'],
    defaultId: 0,
    title: '确认卸载',
    message: '确定要卸载 OpenClaw 吗？',
    detail: '这将删除所有 OpenClaw 文件，但保留配置文件。'
  });
  
  if (result.response !== 1) return;
  
  showLoading('正在卸载 OpenClaw...');
  addLog('开始卸载 OpenClaw...', 'info');
  
  try {
    // 先停止服务
    await window.electronAPI.stopService();
    
    const result = await window.electronAPI.uninstallOpenClaw();
    
    if (result.success) {
      showToast('OpenClaw 已卸载', 'success');
      addLog('OpenClaw 卸载完成', 'success');
      await refreshAllStatus();
    } else {
      throw new Error(result.error || '卸载失败');
    }
  } catch (error) {
    showToast('卸载失败: ' + error.message, 'error');
    addLog('卸载失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 下载 ClawX
 */
async function downloadClawX() {
  showLoading('正在下载 ClawX...');
  addLog('开始下载 ClawX...', 'info');
  addLog('仓库地址: https://github.com/ValueCell-ai/ClawX', 'info');
  
  try {
    const result = await window.electronAPI.downloadClawX();
    
    if (result.success) {
      showToast('ClawX 下载成功！请按照文档进行安装配置', 'success');
      addLog('ClawX 下载完成，请查看文档进行安装', 'success');
      await refreshAllStatus();
    } else {
      throw new Error(result.error || '下载失败');
    }
  } catch (error) {
    showToast('ClawX 下载失败: ' + error.message, 'error');
    addLog('ClawX 下载失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 卸载 ClawX
 */
async function uninstallClawX() {
  const result = await window.electronAPI.showMessage({
    type: 'question',
    buttons: ['取消', '确认删除'],
    defaultId: 0,
    title: '确认删除',
    message: '确定要删除 ClawX 吗？',
    detail: '这将删除 ClawX 源码目录。'
  });
  
  if (result.response !== 1) return;
  
  showLoading('正在删除 ClawX...');
  addLog('开始删除 ClawX...', 'info');
  
  try {
    const result = await window.electronAPI.uninstallClawX();
    
    if (result.success) {
      showToast('ClawX 已删除', 'success');
      addLog('ClawX 删除完成', 'success');
      await refreshAllStatus();
    } else {
      throw new Error(result.error || '删除失败');
    }
  } catch (error) {
    showToast('删除失败: ' + error.message, 'error');
    addLog('删除失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 一键修复
 */
async function quickFix() {
  switchSection('install');
  await startFullInstall();
}

/**
 * 开始完整安装流程
 */
async function startFullInstall() {
  elements.installActions.style.display = 'none';
  elements.installProgress.style.display = 'block';
  
  const steps = [
    { name: '检测环境', fn: refreshAllStatus, progress: 10 },
    { name: '安装 Node.js', fn: installNodejsIfNeeded, progress: 25 },
    { name: '安装 Git', fn: installGitIfNeeded, progress: 35 },
    { name: '安装 OpenClaw', fn: installOpenClawFull, progress: 95 },
    { name: '完成', fn: completeInstall, progress: 100 }
  ];
  
  try {
    for (const step of steps) {
      updateProgress(step.progress, step.name);
      await step.fn();
      await sleep(500);
    }
    
    showToast('安装完成！', 'success');
    updateWizardStep(3);
  } catch (error) {
    showToast('安装过程中出现错误', 'error');
    elements.installActions.style.display = 'block';
  }
}

async function installOpenClawFull() {
  if (!state.envStatus.openclaw?.installed) {
    await installOpenClaw();
  }
}

async function installNodejsIfNeeded() {
  if (!state.envStatus.nodejs?.installed || !state.envStatus.nodejs?.meetsRequirement) {
    await installNodejs();
  }
}

async function installGitIfNeeded() {
  if (!state.envStatus.git?.installed) {
    await installGit();
  }
}

async function completeInstall() {
  elements.progressText.textContent = '安装完成！';
  elements.serviceUrl.textContent = 'http://127.0.0.1:18789';
  await refreshAllStatus();
}

function updateProgress(progress, text) {
  elements.progressFill.style.width = `${progress}%`;
  if (text) {
    elements.progressText.textContent = text;
  }
}

function updateWizardStep(step) {
  document.querySelectorAll('.step').forEach((el, index) => {
    el.classList.remove('active', 'completed');
    if (index + 1 < step) {
      el.classList.add('completed');
    } else if (index + 1 === step) {
      el.classList.add('active');
    }
  });
}

// ==================== 配置管理 ====================

/**
 * 加载配置
 */
async function loadConfig() {
  try {
    const result = await window.electronAPI.readOpenClawConfig();
    if (result.exists && result.config) {
      const config = result.config;
      elements.apiKey.value = config.apiKey || '';
      elements.baseUrl.value = config.baseUrl || '';
      elements.modelName.value = config.modelName || '';
      elements.servicePort.value = '18789';
      elements.temperature.value = config.temperature || 0.7;
      elements.temperatureValue.textContent = config.temperature || 0.7;
    }
    elements.serviceUrl.textContent = 'http://127.0.0.1:18789';
  } catch (error) {
    console.error('加载配置失败:', error);
  }
}

/**
 * 保存配置
 */
async function saveConfig() {
  const config = {
    apiKey: elements.apiKey.value,
    baseUrl: elements.baseUrl.value,
    modelName: elements.modelName.value,
    port: 18789,
    temperature: parseFloat(elements.temperature.value)
  };
  
  showLoading('正在保存配置...');
  
  try {
    const result = await window.electronAPI.saveOpenClawConfig(config);
    
    if (result.success) {
      showToast('配置保存成功', 'success');
      elements.serviceUrl.textContent = 'http://127.0.0.1:18789';
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    showToast('配置保存失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 重置配置
 */
function resetConfig() {
  elements.apiKey.value = '';
  elements.baseUrl.value = '';
  elements.modelName.value = '';
  elements.servicePort.value = '18789';
  elements.temperature.value = 0.7;
  elements.temperatureValue.textContent = '0.7';
  showToast('配置已重置', 'info');
}

/**
 * 选择 OpenClaw 安装目录
 */
async function selectOpenclawPath() {
  const result = await window.electronAPI.selectDirectory();
  if (!result.canceled && result.path) {
    elements.openclawPath.value = result.path;
  }
}

/**
 * 选择 ClawX 安装目录
 */
async function selectClawXPath() {
  const result = await window.electronAPI.selectDirectory();
  if (!result.canceled && result.path) {
    elements.clawxPath.value = result.path;
  }
}

/**
 * 保存安装路径配置
 */
async function saveInstallPaths() {
  const paths = {
    openclawPath: elements.openclawPath.value,
    clawxPath: elements.clawxPath.value
  };
  
  try {
    const result = await window.electronAPI.saveInstallPaths(paths);
    if (result.success) {
      showToast('安装路径已保存', 'success');
      await refreshAllStatus();
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    showToast('保存失败: ' + error.message, 'error');
  }
}

/**
 * 重置安装路径
 */
async function resetInstallPaths() {
  elements.openclawPath.value = '';
  elements.clawxPath.value = '';
  
  const result = await window.electronAPI.saveInstallPaths({});
  if (result.success) {
    showToast('已重置为默认路径', 'success');
    await refreshAllStatus();
  }
}

/**
 * 加载安装路径配置
 */
async function loadInstallPaths() {
  try {
    const result = await window.electronAPI.getInstallPaths();
    if (result) {
      elements.openclawPath.value = result.openclawPath || '';
      elements.clawxPath.value = result.clawxPath || '';
    }
  } catch (error) {
    console.error('加载安装路径失败:', error);
  }
}

/**
 * 应用预设
 */
function applyPreset(preset) {
  const presets = {
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      modelName: 'gpt-4'
    },
    azure: {
      baseUrl: 'https://your-resource.openai.azure.com/',
      modelName: 'gpt-4'
    },
    claude: {
      baseUrl: 'https://api.anthropic.com',
      modelName: 'claude-3-opus-20240229'
    },
    custom: {
      baseUrl: '',
      modelName: ''
    }
  };
  
  const config = presets[preset];
  if (config) {
    elements.baseUrl.value = config.baseUrl;
    elements.modelName.value = config.modelName;
    showToast(`已应用 ${preset.toUpperCase()} 预设`, 'success');
  }
}

// ==================== 服务管理 ====================

/**
 * 检查服务状态
 */
async function checkServiceStatus() {
  try {
    const result = await window.electronAPI.checkServiceStatus();
    updateServiceStatus(result.running);
  } catch (error) {
    console.error('检查服务状态失败:', error);
  }
}

/**
 * 更新服务状态 UI
 */
function updateServiceStatus(running) {
  state.serviceRunning = running;
  
  if (running) {
    elements.statusDot.classList.add('running');
    elements.statusText.textContent = '服务运行中';
    elements.processStatus.textContent = '运行中';
    elements.startServiceBtn.disabled = true;
    elements.stopServiceBtn.disabled = false;
    elements.openPanelBtn.disabled = false;
    
    if (!state.serviceStartTime) {
      state.serviceStartTime = Date.now();
      startUptimeTimer();
    }
  } else {
    elements.statusDot.classList.remove('running');
    elements.statusText.textContent = '服务未运行';
    elements.processStatus.textContent = '已停止';
    elements.startServiceBtn.disabled = false;
    elements.stopServiceBtn.disabled = true;
    elements.openPanelBtn.disabled = true;
    
    state.serviceStartTime = null;
    elements.uptime.textContent = '--';
  }
}

/**
 * 启动服务
 */
async function startService() {
  if (!state.envStatus.openclaw?.installed) {
    showToast('请先安装 OpenClaw', 'warning');
    switchSection('dashboard');
    return;
  }
  
  showLoading('正在启动服务...');
  addLog('正在启动 OpenClaw 服务...', 'info');
  
  try {
    const result = await window.electronAPI.startService();
    
    if (result.success) {
      showToast('服务启动成功', 'success');
      addLog('OpenClaw 服务已启动', 'success');
      updateServiceStatus(true);
      
      // 自动打开面板
      setTimeout(() => openPanel(), 2000);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    showToast('服务启动失败: ' + error.message, 'error');
    addLog('服务启动失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 停止服务
 */
async function stopService() {
  showLoading('正在停止服务...');
  addLog('正在停止 OpenClaw 服务...', 'info');
  
  try {
    const result = await window.electronAPI.stopService();
    
    if (result.success) {
      showToast('服务已停止', 'success');
      addLog('OpenClaw 服务已停止', 'info');
      updateServiceStatus(false);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    showToast('停止服务失败: ' + error.message, 'error');
    addLog('停止服务失败: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * 打开管理面板
 */
async function openPanel() {
  const url = 'http://127.0.0.1:18789';
  
  try {
    await window.electronAPI.openBrowser(url);
    addLog(`已打开浏览器: ${url}`, 'info');
  } catch (error) {
    showToast('打开浏览器失败', 'error');
  }
}

/**
 * 启动运行时间计时器
 */
function startUptimeTimer() {
  const updateUptime = () => {
    if (!state.serviceStartTime) return;
    
    const diff = Date.now() - state.serviceStartTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    elements.uptime.textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  setInterval(updateUptime, 1000);
  updateUptime();
}

// ==================== 日志管理 ====================

/**
 * 添加日志
 */
function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = {
    timestamp,
    message: message.trim(),
    type
  };
  
  state.logs.push(logEntry);
  
  // 限制日志数量
  if (state.logs.length > 1000) {
    state.logs.shift();
  }
  
  // 渲染日志
  renderLogEntry(logEntry);
  
  // 自动滚动
  if (state.autoScroll) {
    scrollToBottom();
  }
}

/**
 * 渲染单条日志
 */
function renderLogEntry(entry) {
  const logElement = document.createElement('div');
  logElement.className = `log-entry ${entry.type}`;
  logElement.innerHTML = `<span class="log-timestamp">[${entry.timestamp}]</span> ${escapeHtml(entry.message)}`;
  
  elements.logsOutput.appendChild(logElement);
}

/**
 * 清空日志
 */
function clearLogs() {
  state.logs = [];
  elements.logsOutput.innerHTML = '';
  showToast('日志已清空', 'info');
}

/**
 * 导出日志
 */
function exportLogs() {
  const content = state.logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `openclaw-logs-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  
  URL.revokeObjectURL(url);
  showToast('日志已导出', 'success');
}

/**
 * 切换自动滚动
 */
function toggleAutoScroll() {
  state.autoScroll = !state.autoScroll;
  elements.autoScrollBtn.classList.toggle('active', state.autoScroll);
  showToast(state.autoScroll ? '自动滚动已开启' : '自动滚动已关闭', 'info');
}

/**
 * 过滤日志
 */
function filterLogs(filter) {
  elements.filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  elements.logsOutput.innerHTML = '';
  
  const filtered = filter === 'all' 
    ? state.logs 
    : state.logs.filter(log => log.type === filter);
  
  filtered.forEach(entry => renderLogEntry(entry));
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
  elements.logsOutput.scrollTop = elements.logsOutput.scrollHeight;
}

// ==================== 工具函数 ====================

/**
 * 显示加载遮罩
 */
function showLoading(text = '处理中...') {
  elements.loadingText.textContent = text;
  elements.overlay.style.display = 'flex';
}

/**
 * 隐藏加载遮罩
 */
function hideLoading() {
  elements.overlay.style.display = 'none';
}

/**
 * 显示 Toast 提示
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * 显示帮助
 */
function showHelp() {
  const helpContent = `
OpenClaw 部署助手使用指南：

1. 环境检测 - 检查系统是否满足运行要求
2. 一键安装 - 自动安装所有依赖和 OpenClaw
3. 配置面板 - 设置大模型 API 参数
4. 服务管理 - 启动/停止 OpenClaw 服务
5. 运行日志 - 查看部署和运行日志

常见问题：
• 如果安装失败，请检查网络连接
• Windows 需要管理员权限
• 所有下载均使用国内镜像加速
  `;
  
  window.electronAPI.showMessage({
    type: 'info',
    title: '使用帮助',
    message: 'OpenClaw 部署助手',
    detail: helpContent
  });
}

/**
 * 修复管理员权限
 */
async function fixAdmin() {
  showToast('请以管理员身份重新运行此程序', 'warning');
  addLog('提示：请右键选择"以管理员身份运行"', 'warning');
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 睡眠函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 错误处理 ====================

window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  showToast('发生错误: ' + event.error.message, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  showToast('操作失败: ' + event.reason.message, 'error');
});

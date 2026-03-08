# 以管理员身份运行构建
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
cd $scriptPath

# 检查是否以管理员运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    # 如果不是管理员，重新以管理员启动
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# 清理之前的构建
Remove-Item -Recurse -Force release -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules\electron-builder" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder" -ErrorAction SilentlyContinue

# 设置环境变量
$env:ELECTRON_SKIP_BINARY_DOWNLOAD = "true"
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"

# 运行构建
npm run build

Write-Host "构建完成！按任意键退出..."
Read-Host

@echo off
chcp 65001 >nul
echo 正在启动国际物流用户管理系统...

REM 检查后端依赖是否已安装
if not exist "server\node_modules" (
    echo 后端依赖未安装，正在安装...
    cd server
    call npm install
    cd ..
)

REM 检查前端依赖是否已安装
if not exist "node_modules" (
    echo 前端依赖未安装，正在安装...
    call npm install
)

REM 启动后端服务
echo 启动后端服务...
start "后端服务" cmd /k "cd server && npm run dev"

REM 等待后端服务启动
timeout /t 3 /nobreak >nul

REM 启动前端服务
echo 启动前端服务...
call npm run dev


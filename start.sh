#!/bin/bash

# 启动脚本 - 同时启动前端和后端

echo "正在启动国际物流用户管理系统..."

# 检查后端依赖是否已安装
if [ ! -d "server/node_modules" ]; then
    echo "后端依赖未安装，正在安装..."
    cd server
    npm install
    cd ..
fi

# 检查前端依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "前端依赖未安装，正在安装..."
    npm install
fi

# 启动后端服务（后台运行）
echo "启动后端服务..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端服务启动
sleep 2

# 启动前端服务
echo "启动前端服务..."
npm run dev

# 清理：当脚本退出时杀死后端进程
trap "kill $BACKEND_PID" EXIT


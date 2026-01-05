#!/bin/bash

echo "🚀 启动MongoDB Docker容器..."

# 检查Docker是否运行
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker Desktop"
    exit 1
fi

# 检查MongoDB容器是否存在
if docker ps -a | grep -q "wladmin-mongodb"; then
    echo "📦 发现已存在的MongoDB容器，正在启动..."
    docker start wladmin-mongodb
else
    echo "📦 创建新的MongoDB容器..."
    docker run -d \
        --name wladmin-mongodb \
        -p 27017:27017 \
        -v wladmin-mongodb-data:/data/db \
        mongo:latest
fi

# 等待MongoDB启动
echo "⏳ 等待MongoDB启动..."
sleep 3

# 检查端口
if lsof -i :27017 > /dev/null 2>&1; then
    echo "✅ MongoDB已成功启动在端口27017"
    echo "📝 连接字符串: mongodb://localhost:27017/wladmin"
else
    echo "❌ MongoDB启动失败，请检查Docker日志: docker logs wladmin-mongodb"
    exit 1
fi


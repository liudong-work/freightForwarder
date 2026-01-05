#!/bin/bash

# 服务器端一键配置脚本
# 在服务器上直接运行此脚本

set -e

echo "=========================================="
echo "🚀 服务器环境配置"
echo "=========================================="

# 1. 安装Node.js
echo ""
echo "1. 安装Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi
echo "✅ Node.js版本: $(node -v)"

# 2. 安装PM2和serve
echo ""
echo "2. 安装PM2和serve..."
npm install -g pm2 serve
echo "✅ PM2版本: $(pm2 --version)"

# 3. 安装并启动MongoDB
echo ""
echo "3. 配置MongoDB..."
if ! docker ps | grep -q mongodb; then
    if docker ps -a | grep -q mongodb; then
        echo "启动现有MongoDB容器..."
        docker start mongodb
    else
        echo "创建新的MongoDB容器..."
        docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest
    fi
    sleep 3
fi
echo "✅ MongoDB运行中: $(docker ps | grep mongo | awk '{print $1}')"

# 4. 创建目录
echo ""
echo "4. 创建部署目录..."
mkdir -p /opt/wladmin/{frontend,backend,logs}
echo "✅ 目录创建完成"

# 5. 配置防火墙
echo ""
echo "5. 配置防火墙..."
firewall-cmd --permanent --add-port=3004/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=3002/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true
echo "✅ 防火墙配置完成"

echo ""
echo "=========================================="
echo "✅ 服务器环境配置完成！"
echo "=========================================="
echo ""
echo "接下来请："
echo "1. 上传文件到 /opt/wladmin/"
echo "2. 运行: cd /opt/wladmin/backend && npm install --production"
echo "3. 运行: cd /opt/wladmin && pm2 start ecosystem.config.js"
echo "=========================================="

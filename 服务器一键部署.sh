#!/bin/bash

# 服务器端一键部署脚本
# 在服务器上直接执行此脚本

set -e

echo "=========================================="
echo "🚀 服务器端一键部署"
echo "=========================================="

# 1. 安装Node.js
echo ""
echo "1️⃣ 安装Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi
echo "✅ Node.js: $(node -v)"

# 2. 安装PM2和serve
echo ""
echo "2️⃣ 安装PM2和serve..."
npm install -g pm2 serve
echo "✅ PM2: $(pm2 --version)"

# 3. 启动MongoDB
echo ""
echo "3️⃣ 启动MongoDB..."
if docker ps | grep -q mongodb; then
    echo "MongoDB已运行"
else
    docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest || docker start mongodb
    sleep 3
fi
echo "✅ MongoDB运行中"

# 4. 创建目录
echo ""
echo "4️⃣ 创建部署目录..."
mkdir -p /opt/wladmin/{frontend,backend,logs}
echo "✅ 目录创建完成"

# 5. 检查文件
echo ""
echo "5️⃣ 检查文件..."
if [ ! -f "/opt/wladmin/backend/package.json" ]; then
    echo "❌ 后端文件不存在，请先上传文件"
    echo "执行: scp -r server/* root@182.92.59.70:/opt/wladmin/backend/"
    exit 1
fi
if [ ! -f "/opt/wladmin/frontend/index.html" ]; then
    echo "❌ 前端文件不存在，请先上传文件"
    echo "执行: scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/"
    exit 1
fi
echo "✅ 文件检查完成"

# 6. 安装后端依赖
echo ""
echo "6️⃣ 安装后端依赖..."
cd /opt/wladmin/backend
npm install --production
echo "✅ 依赖安装完成"

# 7. 启动服务
echo ""
echo "7️⃣ 启动服务..."
cd /opt/wladmin
pm2 delete wladmin-api wladmin-frontend 2>/dev/null || true

if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    echo "使用手动方式启动..."
    cd backend
    PORT=3002 pm2 start index.js --name wladmin-api
    cd ..
    pm2 start "serve -s frontend -l 3004" --name wladmin-frontend
fi

pm2 save
echo "✅ 服务启动完成"

# 8. 配置防火墙
echo ""
echo "8️⃣ 配置防火墙..."
firewall-cmd --permanent --add-port=3004/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=3002/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true
echo "✅ 防火墙配置完成"

# 9. 检查状态
echo ""
echo "9️⃣ 检查服务状态..."
sleep 2
pm2 list

echo ""
echo "🔟 检查端口监听..."
netstat -tlnp | grep -E "3004|3002" || ss -tlnp | grep -E "3004|3002"

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo "访问地址: http://182.92.59.70:3004"
echo "=========================================="

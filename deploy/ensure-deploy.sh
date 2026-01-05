#!/bin/bash

# 确保部署成功的脚本

SERVER_IP="182.92.59.70"
SERVER_USER="root"

echo "=========================================="
echo "🔧 确保部署成功"
echo "=========================================="

# 在服务器上执行完整部署
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

echo "1. 检查并安装Node.js..."
if ! command -v node &> /dev/null; then
    echo "安装Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi
echo "✅ Node.js: $(node -v)"

echo ""
echo "2. 检查并安装PM2和serve..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
if ! command -v serve &> /dev/null; then
    npm install -g serve
fi
echo "✅ PM2: $(pm2 --version)"

echo ""
echo "3. 检查并启动MongoDB..."
if ! docker ps | grep -q mongodb; then
    if docker ps -a | grep -q mongodb; then
        docker start mongodb
    else
        docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest
    fi
    sleep 3
fi
echo "✅ MongoDB运行中"

echo ""
echo "4. 创建目录..."
mkdir -p /opt/wladmin/{frontend,backend,logs}
echo "✅ 目录创建完成"

echo ""
echo "5. 检查文件是否存在..."
if [ ! -f "/opt/wladmin/backend/package.json" ]; then
    echo "⚠️  后端文件不存在，请先上传文件"
    exit 1
fi
if [ ! -f "/opt/wladmin/frontend/index.html" ]; then
    echo "⚠️  前端文件不存在，请先上传文件"
    exit 1
fi
echo "✅ 文件检查完成"

echo ""
echo "6. 安装后端依赖..."
cd /opt/wladmin/backend
npm install --production
echo "✅ 依赖安装完成"

echo ""
echo "7. 停止旧服务..."
pm2 delete wladmin-api wladmin-frontend 2>/dev/null || true

echo ""
echo "8. 启动服务..."
cd /opt/wladmin
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

echo ""
echo "9. 配置防火墙..."
firewall-cmd --permanent --add-port=3004/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=3002/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true
echo "✅ 防火墙配置完成"

echo ""
echo "10. 检查服务状态..."
sleep 3
pm2 list

echo ""
echo "11. 检查端口..."
netstat -tlnp | grep -E "3004|3002" || ss -tlnp | grep -E "3004|3002"

echo ""
echo "12. 测试服务..."
curl -s http://localhost:3002/api/health || echo "后端健康检查失败"
curl -s http://localhost:3004 | head -5 || echo "前端访问失败"

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
ENDSSH

echo ""
echo "访问地址: http://182.92.59.70:3004"

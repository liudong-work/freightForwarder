#!/bin/bash

# 一键部署脚本

SERVER_IP="182.92.59.70"
SERVER_USER="root"

echo "=========================================="
echo "🚀 开始部署到服务器"
echo "=========================================="

# 1. 打包
echo ""
echo "📦 打包前端..."
npm run build

# 2. 上传文件
echo ""
echo "📤 上传文件..."
echo "请执行以下命令上传文件："
echo ""
echo "scp -r dist/* root@$SERVER_IP:/opt/wladmin/frontend/"
echo "scp -r server/* root@$SERVER_IP:/opt/wladmin/backend/"
echo "scp deploy/ecosystem.config.js root@$SERVER_IP:/opt/wladmin/"
echo ""

# 3. 服务器配置命令
echo "然后在服务器上执行以下命令："
cat << 'EOF'
ssh root@182.92.59.70

# 执行以下命令：
bash << 'SETUP'
set -e
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
npm install -g pm2 serve
docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest || docker start mongodb
mkdir -p /opt/wladmin/{frontend,backend,logs}
cd /opt/wladmin/backend && npm install --production
cd /opt/wladmin && pm2 start ecosystem.config.js
pm2 save
firewall-cmd --permanent --add-port=3004/tcp && firewall-cmd --permanent --add-port=3002/tcp && firewall-cmd --reload
pm2 list
SETUP
EOF

echo ""
echo "=========================================="

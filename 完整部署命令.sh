#!/bin/bash

# 完整部署命令 - 复制执行即可

SERVER_IP="182.92.59.70"
SERVER_USER="root"

echo "=========================================="
echo "🚀 完整部署流程"
echo "服务器: $SERVER_IP"
echo "=========================================="
echo ""

# 1. 打包
echo "步骤1: 打包前端..."
npm run build

echo ""
echo "=========================================="
echo "步骤2: 请执行以下命令上传文件"
echo "=========================================="
echo ""
echo "scp -r dist/* root@$SERVER_IP:/opt/wladmin/frontend/"
echo "scp -r server/* root@$SERVER_IP:/opt/wladmin/backend/"
echo "scp deploy/ecosystem.config.js root@$SERVER_IP:/opt/wladmin/"
echo ""

echo "=========================================="
echo "步骤3: SSH连接服务器并执行以下命令"
echo "=========================================="
echo ""
echo "ssh root@$SERVER_IP"
echo ""
echo "然后在服务器上执行："
cat << 'SERVER_CMD'
# 一键配置和启动（复制全部执行）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - && \
yum install -y nodejs && \
npm install -g pm2 serve && \
docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest || docker start mongodb && \
mkdir -p /opt/wladmin/{frontend,backend,logs} && \
cd /opt/wladmin/backend && npm install --production && \
cd /opt/wladmin && pm2 start ecosystem.config.js && \
pm2 save && \
firewall-cmd --permanent --add-port=3004/tcp && \
firewall-cmd --permanent --add-port=3002/tcp && \
firewall-cmd --reload && \
pm2 list && \
netstat -tlnp | grep -E "3004|3002"
SERVER_CMD

echo ""
echo "=========================================="
echo "步骤4: 配置阿里云安全组"
echo "=========================================="
echo "1. 登录阿里云控制台"
echo "2. ECS -> 安全组 -> 配置规则"
echo "3. 添加端口 3004 和 3002"
echo ""
echo "=========================================="
echo "完成！访问: http://$SERVER_IP:3004"
echo "=========================================="

#!/bin/bash

# 快速部署脚本 - 简化版
# 适用于已经配置好环境的服务器

SERVER_IP="182.92.59.70"
SERVER_USER="root"
DEPLOY_PORT="3004"
API_PORT="3002"

echo "=========================================="
echo "快速部署到服务器: $SERVER_IP"
echo "=========================================="

# 1. 打包前端
echo "1. 打包前端..."
cd /Users/liudong/Desktop/myGitProgect/wladmin
npm run build

# 2. 创建部署包
echo "2. 创建部署包..."
rm -rf deploy-package
mkdir -p deploy-package/frontend deploy-package/backend deploy-package/config

# 复制前端文件
cp -r dist/* deploy-package/frontend/

# 复制后端文件
cp -r server/* deploy-package/backend/

# 复制配置文件
cp deploy/ecosystem.config.js deploy-package/config/

# 3. 打包
cd deploy-package
tar -czf ../wladmin-deploy.tar.gz .
cd ..

echo "3. 上传到服务器..."
# 上传压缩包（使用sshpass自动输入密码）
sshpass -p 'ryg@893012' scp wladmin-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

echo "4. 在服务器上解压和启动..."
sshpass -p 'ryg@893012' ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /opt
mkdir -p wladmin
cd wladmin
tar -xzf /tmp/wladmin-deploy.tar.gz

# 安装后端依赖
cd backend
npm install --production

# 安装PM2和serve（如果未安装）
npm install -g pm2 serve 2>/dev/null || true

# 停止旧进程
pm2 delete wladmin-api wladmin-frontend 2>/dev/null || true

# 启动服务
cd /opt/wladmin
pm2 start config/ecosystem.config.js
pm2 save

echo "✅ 部署完成！"
echo "访问地址: http://182.92.59.70:3004"
ENDSSH

echo "=========================================="
echo "✅ 部署完成！"
echo "访问地址: http://$SERVER_IP:$DEPLOY_PORT"
echo "=========================================="

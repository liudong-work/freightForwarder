#!/bin/bash

# 部署脚本 - 上传到阿里云服务器
# 服务器信息
SERVER_IP="182.92.59.70"
SERVER_USER="root"
SERVER_PASSWORD="ryg@893012"
DEPLOY_PORT="3004"  # 前端端口
API_PORT="3002"      # 后端API端口

echo "=========================================="
echo "开始部署到服务器: $SERVER_IP"
echo "前端端口: $DEPLOY_PORT"
echo "后端API端口: $API_PORT"
echo "=========================================="

# 1. 打包前端
echo "1. 打包前端项目..."
cd /Users/liudong/Desktop/myGitProgect/wladmin
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 前端打包失败"
    exit 1
fi

echo "✅ 前端打包完成"

# 2. 创建部署目录
echo "2. 创建服务器部署目录..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
mkdir -p /opt/wladmin
mkdir -p /opt/wladmin/frontend
mkdir -p /opt/wladmin/backend
mkdir -p /opt/wladmin/logs
EOF

# 3. 上传前端文件
echo "3. 上传前端文件..."
sshpass -p "$SERVER_PASSWORD" scp -r dist/* $SERVER_USER@$SERVER_IP:/opt/wladmin/frontend/

# 4. 上传后端文件
echo "4. 上传后端文件..."
sshpass -p "$SERVER_PASSWORD" scp -r server/* $SERVER_USER@$SERVER_IP:/opt/wladmin/backend/

# 5. 上传配置文件
echo "5. 上传配置文件..."
sshpass -p "$SERVER_PASSWORD" scp deploy/ecosystem.config.js $SERVER_USER@$SERVER_IP:/opt/wladmin/
sshpass -p "$SERVER_PASSWORD" scp deploy/nginx.conf $SERVER_USER@$SERVER_IP:/opt/wladmin/

echo "✅ 文件上传完成"

# 6. 在服务器上执行部署命令
echo "6. 在服务器上执行部署..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
cd /opt/wladmin/backend

# 安装后端依赖
echo "安装后端依赖..."
npm install --production

# 安装PM2（如果未安装）
if ! command -v pm2 &> /dev/null; then
    echo "安装PM2..."
    npm install -g pm2
fi

# 停止旧进程（如果存在）
pm2 delete wladmin-api 2>/dev/null || true
pm2 delete wladmin-frontend 2>/dev/null || true

# 启动后端服务
echo "启动后端服务..."
pm2 start ecosystem.config.js --only wladmin-api

# 启动前端服务
pm2 start ecosystem.config.js --only wladmin-frontend

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup | grep -v PM2 | bash || true

echo "✅ 服务启动完成"
EOF

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo "访问地址: http://$SERVER_IP:$DEPLOY_PORT"
echo "API地址: http://$SERVER_IP:$API_PORT"
echo ""
echo "PM2管理命令:"
echo "  ssh $SERVER_USER@$SERVER_IP 'pm2 list'"
echo "  ssh $SERVER_USER@$SERVER_IP 'pm2 logs'"
echo "  ssh $SERVER_USER@$SERVER_IP 'pm2 restart all'"
echo "=========================================="

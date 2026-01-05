#!/bin/bash

# 更新部署脚本 - 保留现有数据
# 服务器信息
SERVER_IP="182.92.59.70"
SERVER_USER="root"
SERVER_PASSWORD="ryg@893012"
DEPLOY_PORT="3004"  # 前端端口
API_PORT="3002"      # 后端API端口

echo "=========================================="
echo "开始更新部署到服务器: $SERVER_IP"
echo "⚠️  注意：将保留所有现有数据"
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

# 2. 上传前端文件
echo "2. 上传前端文件..."
sshpass -p "$SERVER_PASSWORD" scp -r dist/* $SERVER_USER@$SERVER_IP:/opt/wladmin/frontend/

# 3. 上传后端文件（保留node_modules，只更新代码）
echo "3. 上传后端文件..."
sshpass -p "$SERVER_PASSWORD" scp -r server/config/* $SERVER_USER@$SERVER_IP:/opt/wladmin/backend/config/ 2>/dev/null || true
sshpass -p "$SERVER_PASSWORD" scp -r server/models/* $SERVER_USER@$SERVER_IP:/opt/wladmin/backend/models/ 2>/dev/null || true
sshpass -p "$SERVER_PASSWORD" scp -r server/routes/* $SERVER_USER@$SERVER_IP:/opt/wladmin/backend/routes/ 2>/dev/null || true
sshpass -p "$SERVER_PASSWORD" scp -r server/services/* $SERVER_USER@$SERVER_IP:/opt/wladmin/backend/services/ 2>/dev/null || true
sshpass -p "$SERVER_PASSWORD" scp -r server/utils/* $SERVER_USER@$SERVER_IP:/opt/wladmin/backend/utils/ 2>/dev/null || true
sshpass -p "$SERVER_PASSWORD" scp server/index.js $SERVER_USER@$SERVER_IP:/opt/wladmin/backend/ 2>/dev/null || true
sshpass -p "$SERVER_PASSWORD" scp server/package.json $SERVER_USER@$SERVER_IP:/opt/wladmin/backend/ 2>/dev/null || true

# 4. 在服务器上执行更新
echo "4. 在服务器上执行更新..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /opt/wladmin/backend

# 安装新的依赖（如果有）
echo "检查并安装新的依赖..."
npm install --production

# 重启服务（保留数据）
echo "重启服务..."
pm2 restart all || pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

echo "✅ 更新完成！"
ENDSSH

echo ""
echo "=========================================="
echo "✅ 部署更新完成！"
echo "=========================================="
echo "访问地址: http://$SERVER_IP:$DEPLOY_PORT"
echo "API地址: http://$SERVER_IP:$API_PORT"
echo ""
echo "⚠️  所有数据已保留在MongoDB中"
echo "=========================================="


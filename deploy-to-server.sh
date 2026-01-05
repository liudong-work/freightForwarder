#!/bin/bash

# 部署脚本 - 保留用户数据，删除阿里巴巴客户数据
# 服务器: root@服务器IP
# 密码: ryg@893012

SERVER_IP="182.92.59.70"
SERVER_USER="root"
SERVER_PASSWORD="ryg@893012"
DEPLOY_PORT="3004"
API_PORT="3001"

echo "=========================================="
echo "部署到服务器: $SERVER_IP"
echo "保留用户数据，删除阿里巴巴客户数据"
echo "=========================================="
echo ""

# 1. 打包前端
echo "步骤1: 打包前端项目..."
cd /Users/liudong/Desktop/myGitProgect/wladmin
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 前端打包失败，请检查错误信息"
    exit 1
fi

echo "✅ 前端打包完成"
echo ""

# 2. 创建部署包
echo "步骤2: 创建部署包..."
rm -rf deploy-package
mkdir -p deploy-package/frontend deploy-package/backend deploy-package/config

# 复制前端文件
cp -r dist/* deploy-package/frontend/

# 复制后端文件（排除node_modules）
rsync -av --exclude='node_modules' server/ deploy-package/backend/

# 复制配置文件
cp deploy/ecosystem.config.js deploy-package/config/

# 打包
cd deploy-package
tar -czf ../wladmin-deploy.tar.gz .
cd ..

echo "✅ 部署包创建完成: wladmin-deploy.tar.gz"
echo ""

# 3. 检查sshpass是否安装
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass未安装，正在安装..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        echo "请手动安装sshpass: sudo apt-get install sshpass 或 sudo yum install sshpass"
        exit 1
    fi
fi

# 4. 上传到服务器
echo "步骤3: 上传文件到服务器..."
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no wladmin-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

if [ $? -ne 0 ]; then
    echo "❌ 文件上传失败"
    exit 1
fi

echo "✅ 文件上传成功"
echo ""

# 5. 在服务器上执行部署
echo "步骤4: 在服务器上部署..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

echo "开始部署..."

# 创建目录
mkdir -p /opt/wladmin
cd /opt/wladmin

# 备份现有配置（如果有）
if [ -d "backend" ]; then
    echo "备份现有配置..."
    cp -r backend/config /tmp/wladmin-config-backup 2>/dev/null || true
fi

# 解压文件
echo "解压部署包..."
tar -xzf /tmp/wladmin-deploy.tar.gz

# 恢复配置（如果有备份）
if [ -d "/tmp/wladmin-config-backup" ]; then
    echo "恢复配置..."
    cp -r /tmp/wladmin-config-backup/* backend/config/ 2>/dev/null || true
fi

# 安装Node.js（如果未安装）
if ! command -v node &> /dev/null; then
    echo "安装Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
fi

# 安装PM2和serve（如果未安装）
if ! command -v pm2 &> /dev/null; then
    echo "安装PM2..."
    npm install -g pm2 serve
fi

# 安装后端依赖
echo "安装后端依赖..."
cd backend
npm install --production

# 停止旧进程
echo "停止旧服务..."
pm2 delete wladmin-backend 2>/dev/null || true
pm2 delete wladmin-frontend 2>/dev/null || true

# 启动后端服务
echo "启动后端服务..."
cd /opt/wladmin
pm2 start config/ecosystem.config.js

# 等待后端启动
sleep 3

# 删除阿里巴巴客户数据（保留用户数据）
echo "删除阿里巴巴客户数据..."
cd /opt/wladmin/backend
node scripts/clearAlibabaCustomers.js

# 保存PM2配置
pm2 save

# 设置开机自启（如果需要）
pm2 startup | grep -v "PM2" | bash || true

# 开放防火墙端口（如果需要）
firewall-cmd --permanent --add-port=3004/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=3001/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "访问地址: http://182.92.59.70:3004"
echo "API地址: http://182.92.59.70:3001"
echo "=========================================="
echo ""
echo "服务状态:"
pm2 list
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ 部署成功完成！"
    echo "访问地址: http://$SERVER_IP:$DEPLOY_PORT"
    echo "API地址: http://$SERVER_IP:$API_PORT"
    echo "=========================================="
else
    echo ""
    echo "❌ 部署过程中出现错误，请检查上面的输出"
    exit 1
fi


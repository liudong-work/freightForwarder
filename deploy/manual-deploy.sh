#!/bin/bash

# 手动部署脚本 - 分步执行，更安全

SERVER_IP="182.92.59.70"
SERVER_USER="root"
DEPLOY_PORT="3004"
API_PORT="3002"

echo "=========================================="
echo "手动部署到服务器: $SERVER_IP"
echo "前端端口: $DEPLOY_PORT"
echo "后端API端口: $API_PORT"
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

# 创建部署说明文件
cat > deploy-package/README.txt << EOF
部署说明
========

1. 解压文件到 /opt/wladmin
2. 安装后端依赖: cd /opt/wladmin/backend && npm install --production
3. 启动服务: cd /opt/wladmin && pm2 start config/ecosystem.config.js
4. 保存PM2配置: pm2 save

访问地址: http://$SERVER_IP:$DEPLOY_PORT
EOF

# 打包
cd deploy-package
tar -czf ../wladmin-deploy.tar.gz .
cd ..

echo "✅ 部署包创建完成: wladmin-deploy.tar.gz"
echo ""

# 3. 显示上传命令
echo "步骤3: 上传文件到服务器"
echo "请执行以下命令上传文件:"
echo ""
echo "scp wladmin-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/"
echo ""
echo "然后SSH连接到服务器:"
echo "ssh $SERVER_USER@$SERVER_IP"
echo ""
echo "在服务器上执行以下命令:"
echo ""
cat << 'EOF'
# 创建目录
mkdir -p /opt/wladmin
cd /opt/wladmin

# 解压文件
tar -xzf /tmp/wladmin-deploy.tar.gz

# 安装Node.js（如果未安装）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 安装PM2和serve（如果未安装）
npm install -g pm2 serve

# 安装后端依赖
cd backend
npm install --production

# 启动服务
cd /opt/wladmin
pm2 start config/ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup

# 开放防火墙端口
firewall-cmd --permanent --add-port=3004/tcp
firewall-cmd --permanent --add-port=3002/tcp
firewall-cmd --reload

echo "✅ 部署完成！访问: http://182.92.59.70:3004"
EOF

echo ""
echo "=========================================="
echo "部署包已准备好: wladmin-deploy.tar.gz"
echo "请按照上面的步骤手动上传和部署"
echo "=========================================="

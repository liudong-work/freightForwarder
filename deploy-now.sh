#!/bin/bash
set -e
SERVER_IP="182.92.59.70"
SERVER_USER="root"
SERVER_PASSWORD="ryg@893012"
echo "开始部署..."
npm run build
echo "上传文件..."
expect << 'EXPECT_SCRIPT'
set timeout 300
spawn scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/
expect "password:" { send "ryg@893012\r" }
expect eof
spawn scp -r server/* root@182.92.59.70:/opt/wladmin/backend/
expect "password:" { send "ryg@893012\r" }
expect eof
spawn scp deploy/ecosystem.config.js root@182.92.59.70:/opt/wladmin/
expect "password:" { send "ryg@893012\r" }
expect eof
EXPECT_SCRIPT
echo "配置服务器..."
expect << 'EXPECT_SSH'
set timeout 600
spawn ssh root@182.92.59.70
expect "password:" { send "ryg@893012\r" }
expect "# " { send "curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - && yum install -y nodejs && npm install -g pm2 serve && docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest || docker start mongodb && mkdir -p /opt/wladmin/{frontend,backend,logs} && cd /opt/wladmin/backend && npm install --production && cd /opt/wladmin && pm2 start ecosystem.config.js && pm2 save && firewall-cmd --permanent --add-port=3004/tcp && firewall-cmd --permanent --add-port=3002/tcp && firewall-cmd --reload && pm2 list\r" }
expect "# " { send "exit\r" }
expect eof
EXPECT_SSH
echo "部署完成！访问: http://182.92.59.70:3004"

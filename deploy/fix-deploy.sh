#!/bin/bash

# 修复部署脚本 - 解决502错误

SERVER_IP="182.92.59.70"
SERVER_USER="root"

echo "=========================================="
echo "修复服务器部署问题"
echo "=========================================="

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'

echo "1. 检查Node.js版本..."
node -v || echo "Node.js未安装"

echo ""
echo "2. 检查PM2..."
pm2 --version || echo "PM2未安装，正在安装..."
npm install -g pm2 serve 2>/dev/null || true

echo ""
echo "3. 检查MongoDB..."
if ! docker ps | grep -q mongodb; then
    echo "MongoDB未运行，正在启动..."
    docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest
    sleep 5
fi

echo ""
echo "4. 检查部署目录..."
if [ ! -d "/opt/wladmin" ]; then
    echo "创建部署目录..."
    mkdir -p /opt/wladmin/{frontend,backend,logs}
fi

echo ""
echo "5. 检查PM2进程..."
pm2 list

echo ""
echo "6. 如果服务未运行，启动服务..."
if ! pm2 list | grep -q wladmin-api; then
    echo "启动后端服务..."
    cd /opt/wladmin/backend
    npm install --production 2>/dev/null || true
    cd /opt/wladmin
    pm2 start ecosystem.config.js 2>/dev/null || {
        echo "PM2配置不存在，手动启动..."
        cd /opt/wladmin/backend
        PORT=3002 pm2 start index.js --name wladmin-api
    }
fi

if ! pm2 list | grep -q wladmin-frontend; then
    echo "启动前端服务..."
    cd /opt/wladmin
    pm2 start "serve -s frontend -l 3004" --name wladmin-frontend || {
        npx serve -s frontend -l 3004 &
    }
fi

echo ""
echo "7. 检查端口..."
netstat -tlnp | grep -E "3004|3002"

echo ""
echo "8. 检查防火墙..."
firewall-cmd --list-ports 2>/dev/null || iptables -L -n | grep -E "3004|3002"

echo ""
echo "9. 查看服务日志..."
pm2 logs --lines 10 --nostream

echo ""
echo "=========================================="
echo "修复完成！"
echo "=========================================="

ENDSSH

echo ""
echo "如果问题仍然存在，请检查："
echo "1. 阿里云安全组是否开放了3004和3002端口"
echo "2. 服务器防火墙是否开放了端口"
echo "3. 查看详细日志: ssh $SERVER_USER@$SERVER_IP 'pm2 logs'"

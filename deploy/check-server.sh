#!/bin/bash

# 服务器状态检查脚本

SERVER_IP="182.92.59.70"
SERVER_USER="root"

echo "=========================================="
echo "检查服务器状态: $SERVER_IP"
echo "=========================================="

# 检查服务是否运行
echo ""
echo "1. 检查PM2服务状态..."
ssh $SERVER_USER@$SERVER_IP 'pm2 list' || echo "PM2未安装或服务未运行"

# 检查端口是否监听
echo ""
echo "2. 检查端口监听状态..."
ssh $SERVER_USER@$SERVER_IP 'netstat -tlnp | grep -E "3004|3002|27017"' || echo "端口未监听"

# 检查MongoDB
echo ""
echo "3. 检查MongoDB状态..."
ssh $SERVER_USER@$SERVER_IP 'docker ps | grep mongo || systemctl status mongod 2>/dev/null | head -5' || echo "MongoDB未运行"

# 检查日志
echo ""
echo "4. 查看最近的服务日志..."
ssh $SERVER_USER@$SERVER_IP 'pm2 logs --lines 20 --nostream' || echo "无法获取日志"

echo ""
echo "=========================================="

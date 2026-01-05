#!/bin/bash
set -e
SERVER_IP="182.92.59.70"
SERVER_USER="root"
echo "开始部署..."
npm run build
echo "上传文件..."
scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/ 2>/dev/null || echo "需要手动上传前端"
scp -r server/* root@182.92.59.70:/opt/wladmin/backend/ 2>/dev/null || echo "需要手动上传后端"
scp deploy/ecosystem.config.js root@182.92.59.70:/opt/wladmin/ 2>/dev/null || echo "需要手动上传配置"
echo "部署完成"

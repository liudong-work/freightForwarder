#!/bin/bash

# MongoDB安装脚本（Alibaba Cloud Linux）

echo "开始安装MongoDB..."

# 1. 创建MongoDB仓库文件
cat > /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

# 2. 安装MongoDB
yum install -y mongodb-org

# 3. 启动MongoDB服务
systemctl start mongod
systemctl enable mongod

# 4. 检查状态
systemctl status mongod

echo "✅ MongoDB安装完成"
echo "MongoDB运行在: mongodb://localhost:27017"

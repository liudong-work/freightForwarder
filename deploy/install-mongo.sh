#!/bin/bash
set -e

# 检查MongoDB是否已安装
if command -v mongod &> /dev/null; then
    echo "MongoDB已安装"
    systemctl start mongod || true
    systemctl enable mongod || true
    exit 0
fi

# 创建MongoDB仓库配置
cat > /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF

# 安装MongoDB
yum install -y mongodb-org

# 启动并设置开机自启
systemctl start mongod
systemctl enable mongod

echo "MongoDB安装完成"

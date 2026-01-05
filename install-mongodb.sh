#!/bin/bash

echo "📦 使用Homebrew安装MongoDB..."

# 检查Homebrew是否安装
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew未安装，请先安装Homebrew: https://brew.sh"
    exit 1
fi

# 添加MongoDB tap
echo "🔧 添加MongoDB tap..."
brew tap mongodb/brew

# 安装MongoDB
echo "📥 安装MongoDB..."
brew install mongodb-community@8.0

# 启动MongoDB服务
echo "🚀 启动MongoDB服务..."
brew services start mongodb-community@8.0

# 等待启动
sleep 3

# 检查状态
if lsof -i :27017 > /dev/null 2>&1; then
    echo "✅ MongoDB已成功启动在端口27017"
    echo "📝 连接字符串: mongodb://localhost:27017/wladmin"
else
    echo "❌ MongoDB启动失败，请检查服务状态: brew services list"
    exit 1
fi


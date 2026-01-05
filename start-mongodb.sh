#!/bin/bash
echo "检查MongoDB安装状态..."
while ps aux | grep -q "[b]rew.rb install mongodb"; do
  echo "MongoDB正在安装中，请等待..."
  sleep 10
done
echo "MongoDB安装完成，正在启动服务..."
if brew services start mongodb-community@8.0 2>/dev/null; then
  echo "✅ MongoDB服务启动成功"
elif brew services start mongodb-community 2>/dev/null; then
  echo "✅ MongoDB服务启动成功"
else
  echo "❌ MongoDB服务启动失败"
  exit 1
fi
sleep 5
if lsof -ti:27017 > /dev/null; then
  echo "✅ MongoDB已在端口27017运行"
fi

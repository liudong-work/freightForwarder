#!/bin/bash

# 故障排查脚本
# 在服务器上执行此脚本来检查问题

echo "=========================================="
echo "开始排查部署问题..."
echo "=========================================="

# 1. 检查PM2服务状态
echo ""
echo "1. 检查PM2服务状态:"
pm2 list

# 2. 检查端口占用
echo ""
echo "2. 检查端口占用情况:"
echo "端口3004:"
netstat -tlnp | grep 3004 || echo "  端口3004未被占用"
echo "端口3002:"
netstat -tlnp | grep 3002 || echo "  端口3002未被占用"

# 3. 检查MongoDB
echo ""
echo "3. 检查MongoDB状态:"
docker ps | grep mongo || echo "  MongoDB容器未运行"
systemctl status mongod 2>/dev/null | head -5 || echo "  MongoDB服务未安装或未运行"

# 4. 检查文件是否存在
echo ""
echo "4. 检查部署文件:"
ls -la /opt/wladmin/ 2>/dev/null || echo "  /opt/wladmin 目录不存在"
ls -la /opt/wladmin/frontend/ 2>/dev/null | head -5 || echo "  前端文件不存在"
ls -la /opt/wladmin/backend/ 2>/dev/null | head -5 || echo "  后端文件不存在"

# 5. 检查PM2日志
echo ""
echo "5. 最近的错误日志:"
pm2 logs --lines 20 --nostream 2>/dev/null || echo "  无法获取日志"

# 6. 检查防火墙
echo ""
echo "6. 检查防火墙规则:"
firewall-cmd --list-ports 2>/dev/null || echo "  防火墙未运行或无法访问"

echo ""
echo "=========================================="
echo "排查完成"
echo "=========================================="

# 502错误排查指南

## 问题现象
访问 http://182.92.59.70:3004 出现 HTTP ERROR 502

## 排查步骤

### 1. 检查服务是否运行

SSH连接到服务器：
```bash
ssh root@182.92.59.70
```

检查PM2服务：
```bash
pm2 list
```

应该看到：
- wladmin-api (后端)
- wladmin-frontend (前端)

如果没有，启动服务：
```bash
cd /opt/wladmin
pm2 start ecosystem.config.js
```

### 2. 检查端口是否监听

```bash
netstat -tlnp | grep -E "3004|3002"
```

应该看到：
- 3004端口（前端）
- 3002端口（后端）

如果没有，检查服务日志：
```bash
pm2 logs
```

### 3. 检查MongoDB

```bash
# Docker方式
docker ps | grep mongo

# 或系统服务
systemctl status mongod
```

如果MongoDB未运行：
```bash
docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest
```

### 4. 检查防火墙

```bash
# 查看已开放端口
firewall-cmd --list-ports

# 如果没有3004和3002，添加：
firewall-cmd --permanent --add-port=3004/tcp
firewall-cmd --permanent --add-port=3002/tcp
firewall-cmd --reload
```

### 5. 检查阿里云安全组

1. 登录阿里云控制台
2. ECS -> 安全组 -> 配置规则
3. 确保有入站规则：
   - 端口3004，TCP，0.0.0.0/0
   - 端口3002，TCP，0.0.0.0/0

### 6. 手动启动服务（如果PM2有问题）

```bash
# 启动后端
cd /opt/wladmin/backend
PORT=3002 node index.js &

# 启动前端
cd /opt/wladmin
npx serve -s frontend -l 3004 &
```

### 7. 检查文件是否存在

```bash
# 检查前端文件
ls -la /opt/wladmin/frontend/

# 检查后端文件
ls -la /opt/wladmin/backend/

# 检查PM2配置
ls -la /opt/wladmin/ecosystem.config.js
```

### 8. 重新部署（如果文件缺失）

在本地执行：
```bash
cd /Users/liudong/Desktop/myGitProgect/wladmin

# 重新打包
npm run build

# 上传文件
scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/
scp -r server/* root@182.92.59.70:/opt/wladmin/backend/
scp deploy/ecosystem.config.js root@182.92.59.70:/opt/wladmin/
```

在服务器上：
```bash
cd /opt/wladmin/backend
npm install --production

cd /opt/wladmin
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

## 快速修复脚本

运行修复脚本：
```bash
bash deploy/fix-deploy.sh
```

## 常见问题

### 问题1: PM2未安装
```bash
npm install -g pm2 serve
```

### 问题2: Node.js未安装
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
```

### 问题3: 端口被占用
```bash
# 查看占用端口的进程
lsof -i:3004
lsof -i:3002

# 杀死进程
kill -9 <PID>
```

### 问题4: MongoDB连接失败
```bash
# 检查MongoDB是否运行
docker ps | grep mongo

# 重启MongoDB
docker restart mongodb
```

## 查看详细日志

```bash
# PM2日志
pm2 logs

# 系统日志
journalctl -u mongod
tail -f /opt/wladmin/logs/*.log
```

# 502错误排查指南

## 问题现象
访问 http://182.92.59.70:3004 出现 HTTP ERROR 502

## 排查步骤

### 1. 连接服务器
```bash
ssh root@182.92.59.70
# 密码: ryg@893012
```

### 2. 检查PM2服务状态
```bash
pm2 list
```

**如果服务未运行，执行：**
```bash
cd /opt/wladmin
pm2 start ecosystem.config.js
pm2 save
```

### 3. 检查端口是否监听
```bash
netstat -tlnp | grep 3004
netstat -tlnp | grep 3002
```

**如果端口未监听，检查日志：**
```bash
pm2 logs
```

### 4. 检查MongoDB是否运行
```bash
# Docker方式
docker ps | grep mongo

# 如果未运行，启动：
docker start mongodb
# 或重新创建：
docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest
```

### 5. 检查文件是否存在
```bash
ls -la /opt/wladmin/
ls -la /opt/wladmin/frontend/
ls -la /opt/wladmin/backend/
```

### 6. 重新启动服务
```bash
cd /opt/wladmin
pm2 restart all
# 或
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### 7. 检查防火墙
```bash
firewall-cmd --list-ports
# 如果没有3004和3002，添加：
firewall-cmd --permanent --add-port=3004/tcp
firewall-cmd --permanent --add-port=3002/tcp
firewall-cmd --reload
```

### 8. 检查阿里云安全组
- 登录阿里云控制台
- ECS -> 安全组 -> 配置规则
- 确保端口3004和3002已开放

## 快速修复脚本

在服务器上执行：
```bash
# 上传修复脚本
# 在本地执行：
scp deploy/fix-deploy.sh root@182.92.59.70:/tmp/

# 在服务器上执行：
chmod +x /tmp/fix-deploy.sh
bash /tmp/fix-deploy.sh
```

## 常见问题

### 问题1: PM2未安装
```bash
npm install -g pm2
```

### 问题2: serve未安装
```bash
npm install -g serve
```

### 问题3: 后端依赖未安装
```bash
cd /opt/wladmin/backend
npm install --production
```

### 问题4: MongoDB连接失败
```bash
# 检查MongoDB是否运行
docker ps | grep mongo

# 检查端口27017是否监听
netstat -tlnp | grep 27017
```

### 问题5: 端口被占用
```bash
# 查看占用端口的进程
lsof -i:3004
lsof -i:3002

# 杀死进程
kill -9 <PID>
```

## 验证部署

```bash
# 1. 检查服务状态
pm2 list

# 2. 检查端口
netstat -tlnp | grep -E "3004|3002"

# 3. 测试API
curl http://localhost:3002/api/health

# 4. 测试前端
curl http://localhost:3004
```

## 如果仍然无法访问

1. 检查服务器是否能访问：
   ```bash
   ping 182.92.59.70
   ```

2. 检查服务器上的服务：
   ```bash
   ssh root@182.92.59.70 'pm2 list'
   ```

3. 查看详细日志：
   ```bash
   ssh root@182.92.59.70 'pm2 logs --lines 50'
   ```

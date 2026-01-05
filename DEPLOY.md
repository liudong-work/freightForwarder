# 部署指南

## 服务器信息
- **IP地址**: 182.92.59.70
- **用户名**: root
- **密码**: ryg@893012
- **系统**: Alibaba Cloud Linux 3.2104 LTS

## 端口分配
- **前端端口**: 3004
- **后端API端口**: 3002

## 快速部署步骤

### 1. 准备部署文件

在本地执行：
```bash
cd /Users/liudong/Desktop/myGitProgect/wladmin

# 打包前端
npm run build
```

### 2. 连接服务器并准备环境

```bash
ssh root@182.92.59.70
# 输入密码: ryg@893012
```

### 3. 在服务器上安装必要软件

```bash
# 安装Node.js（如果未安装）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 安装PM2（进程管理器）
npm install -g pm2

# 安装serve（静态文件服务器）
npm install -g serve

# 安装MongoDB（如果未安装）
# 方法1: 使用Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest

# 方法2: 使用yum安装
bash <(curl -s https://raw.githubusercontent.com/mongodb/mongodb-org/main/scripts/install-mongodb.sh)
systemctl start mongod
systemctl enable mongod
```

### 4. 创建部署目录

```bash
mkdir -p /opt/wladmin/{frontend,backend,logs}
```

### 5. 上传文件（在本地执行）

```bash
# 上传前端文件
scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/

# 上传后端文件
scp -r server/* root@182.92.59.70:/opt/wladmin/backend/

# 上传PM2配置文件
scp deploy/ecosystem.config.js root@182.92.59.70:/opt/wladmin/
```

### 6. 在服务器上安装依赖并启动

```bash
# 安装后端依赖
cd /opt/wladmin/backend
npm install --production

# 启动服务
cd /opt/wladmin
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
# 执行上面命令输出的命令（通常是 sudo env PATH=...）
```

### 7. 配置防火墙

```bash
# 开放端口
firewall-cmd --permanent --add-port=3004/tcp
firewall-cmd --permanent --add-port=3002/tcp
firewall-cmd --reload

# 或者如果使用iptables
iptables -A INPUT -p tcp --dport 3004 -j ACCEPT
iptables -A INPUT -p tcp --dport 3002 -j ACCEPT
service iptables save
```

### 8. 配置阿里云安全组

1. 登录阿里云控制台
2. 进入 ECS实例 -> 安全组
3. 添加入站规则：
   - 端口3004（前端）
   - 端口3002（后端API）
   - 协议：TCP
   - 授权对象：0.0.0.0/0

## 访问地址

- **前端**: http://182.92.59.70:3004
- **后端API**: http://182.92.59.70:3002

## PM2管理命令

```bash
# 查看服务状态
pm2 list

# 查看日志
pm2 logs

# 查看特定服务日志
pm2 logs wladmin-api
pm2 logs wladmin-frontend

# 重启服务
pm2 restart all
pm2 restart wladmin-api
pm2 restart wladmin-frontend

# 停止服务
pm2 stop all

# 删除服务
pm2 delete all
```

## 更新部署

当需要更新代码时：

```bash
# 1. 在本地重新打包
npm run build

# 2. 上传新文件
scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/
scp -r server/* root@182.92.59.70:/opt/wladmin/backend/

# 3. 在服务器上重启服务
ssh root@182.92.59.70 'cd /opt/wladmin/backend && npm install --production && pm2 restart all'
```

## 注意事项

1. ✅ 端口3004和3002不会影响其他服务
2. ✅ 所有文件部署在 `/opt/wladmin` 目录
3. ✅ 日志文件在 `/opt/wladmin/logs` 目录
4. ✅ 使用PM2管理进程，支持自动重启
5. ✅ 确保MongoDB运行在27017端口

## 故障排查

### 服务无法启动
```bash
# 查看PM2日志
pm2 logs

# 检查端口是否被占用
netstat -tlnp | grep 3004
netstat -tlnp | grep 3002

# 检查MongoDB是否运行
systemctl status mongod
# 或
docker ps | grep mongo
```

### 无法访问
1. 检查防火墙规则
2. 检查阿里云安全组配置
3. 检查服务是否正常运行：`pm2 list`

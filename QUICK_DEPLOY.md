# 快速部署指南

## 📋 服务器信息
- **IP**: 182.92.59.70
- **用户**: root  
- **密码**: ryg@893012
- **前端端口**: 3004
- **后端端口**: 3002

## 🚀 一键部署（推荐）

### 步骤1: 本地打包
```bash
cd /Users/liudong/Desktop/myGitProgect/wladmin
npm run build
```

### 步骤2: 连接服务器
```bash
ssh root@182.92.59.70
# 密码: ryg@893012
```

### 步骤3: 在服务器上执行以下命令

```bash
# ===== 1. 安装Node.js =====
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# ===== 2. 安装PM2和serve =====
npm install -g pm2 serve

# ===== 3. 安装MongoDB（使用Docker） =====
docker run -d --name mongodb -p 27017:27017 --restart=always mongo:latest

# ===== 4. 创建目录 =====
mkdir -p /opt/wladmin/{frontend,backend,logs}

# ===== 5. 开放防火墙端口 =====
firewall-cmd --permanent --add-port=3004/tcp
firewall-cmd --permanent --add-port=3002/tcp
firewall-cmd --reload
```

### 步骤4: 上传文件（在本地新终端执行）

```bash
# 上传前端
scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/

# 上传后端
scp -r server/* root@182.92.59.70:/opt/wladmin/backend/

# 上传PM2配置
scp deploy/ecosystem.config.js root@182.92.59.70:/opt/wladmin/

# 上传配置文件
scp public/config.js root@182.92.59.70:/opt/wladmin/frontend/
```

### 步骤5: 在服务器上启动服务

```bash
# 安装后端依赖
cd /opt/wladmin/backend
npm install --production

# 启动服务
cd /opt/wladmin
pm2 start ecosystem.config.js

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
# 执行上面命令输出的sudo命令
```

### 步骤6: 配置阿里云安全组

1. 登录阿里云控制台
2. ECS -> 安全组 -> 配置规则
3. 添加入站规则：
   - 端口3004，TCP，0.0.0.0/0
   - 端口3002，TCP，0.0.0.0/0

## ✅ 完成！

访问地址: **http://182.92.59.70:3004**

## 📝 常用命令

```bash
# 查看服务状态
pm2 list

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all
```

## 🔄 更新部署

```bash
# 1. 本地重新打包
npm run build

# 2. 上传新文件
scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/
scp -r server/* root@182.92.59.70:/opt/wladmin/backend/

# 3. 服务器上重启
ssh root@182.92.59.70 'cd /opt/wladmin/backend && npm install --production && pm2 restart all'
```

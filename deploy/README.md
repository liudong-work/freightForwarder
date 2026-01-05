# 部署说明

## 服务器信息
- IP: 182.92.59.70
- 用户: root
- 密码: ryg@893012
- 系统: Alibaba Cloud Linux 3.2104 LTS

## 端口分配
- 前端端口: 3004
- 后端API端口: 3002

## 部署步骤

### 方法一：使用部署脚本（推荐）

1. 安装 sshpass（如果未安装）
```bash
# macOS
brew install sshpass

# Linux
sudo apt-get install sshpass  # Ubuntu/Debian
sudo yum install sshpass      # CentOS/RHEL
```

2. 给脚本添加执行权限
```bash
chmod +x deploy.sh
```

3. 执行部署
```bash
./deploy.sh
```

### 方法二：手动部署

1. **打包前端**
```bash
npm run build
```

2. **连接服务器**
```bash
ssh root@182.92.59.70
# 密码: ryg@893012
```

3. **在服务器上创建目录**
```bash
mkdir -p /opt/wladmin/{frontend,backend,logs}
```

4. **上传文件（在本地执行）**
```bash
# 上传前端
scp -r dist/* root@182.92.59.70:/opt/wladmin/frontend/

# 上传后端
scp -r server/* root@182.92.59.70:/opt/wladmin/backend/

# 上传PM2配置
scp deploy/ecosystem.config.js root@182.92.59.70:/opt/wladmin/
```

5. **在服务器上安装依赖和启动**
```bash
# 安装Node.js（如果未安装）
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 安装PM2
npm install -g pm2

# 安装后端依赖
cd /opt/wladmin/backend
npm install --production

# 安装serve（用于前端静态文件服务）
npm install -g serve

# 启动服务
cd /opt/wladmin
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

6. **配置防火墙（如果需要）**
```bash
# 开放端口
firewall-cmd --permanent --add-port=3004/tcp
firewall-cmd --permanent --add-port=3002/tcp
firewall-cmd --reload

# 或者使用iptables
iptables -A INPUT -p tcp --dport 3004 -j ACCEPT
iptables -A INPUT -p tcp --dport 3002 -j ACCEPT
```

7. **配置阿里云安全组**
- 登录阿里云控制台
- 进入ECS实例 -> 安全组
- 添加规则：
  - 端口3004（前端）
  - 端口3002（后端API）

## 访问地址
- 前端: http://182.92.59.70:3004
- 后端API: http://182.92.59.70:3002

## PM2管理命令
```bash
# 查看服务状态
pm2 list

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all

# 删除服务
pm2 delete all
```

## 注意事项
1. 确保MongoDB已安装并运行在27017端口
2. 如果MongoDB未安装，需要先安装MongoDB
3. 确保端口3002和3004未被占用
4. 部署前建议备份现有数据

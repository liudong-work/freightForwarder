#!/bin/bash

# 手动部署步骤说明脚本
# 如果自动部署脚本不可用，可以按照此脚本的步骤手动执行

echo "=========================================="
echo "手动部署步骤"
echo "=========================================="
echo ""
echo "1. 打包前端:"
echo "   cd /Users/liudong/Desktop/myGitProgect/wladmin"
echo "   npm run build"
echo ""
echo "2. 上传文件到服务器:"
echo "   scp -r server dist package.json root@182.92.59.70:/opt/wladmin/"
echo ""
echo "3. SSH连接到服务器:"
echo "   ssh root@182.92.59.70"
echo ""
echo "4. 在服务器上执行以下命令:"
echo ""
cat << 'EOF'
   # 创建目录
   mkdir -p /opt/wladmin/logs
   cd /opt/wladmin
   
   # 安装Node.js（如果未安装）
   curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
   yum install -y nodejs
   
   # 安装PM2
   npm install -g pm2
   
   # 安装后端依赖
   cd server
   npm install --production
   
   # 安装MongoDB（如果未安装）
   # 参考: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-red-hat/
   
   # 启动MongoDB
   systemctl start mongod
   systemctl enable mongod
   
   # 启动后端服务
   cd /opt/wladmin
   pm2 start server/index.js --name wladmin-backend --env production
   pm2 save
   pm2 startup
   
   # 安装Nginx
   yum install -y nginx
   
   # 配置Nginx
   cat > /etc/nginx/conf.d/wladmin.conf << 'NGINXEOF'
   server {
       listen 8080;
       server_name 182.92.59.70;
       
       location / {
           root /opt/wladmin/dist;
           try_files $uri $uri/ /index.html;
           index index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   NGINXEOF
   
   # 测试并启动Nginx
   nginx -t
   systemctl start nginx
   systemctl enable nginx
   systemctl reload nginx
   
   # 配置防火墙
   firewall-cmd --permanent --add-port=8080/tcp
   firewall-cmd --reload
EOF

echo ""
echo "5. 访问地址: http://182.92.59.70:8080"
echo ""
echo "=========================================="

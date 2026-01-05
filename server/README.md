# 后端服务

Node.js + Express 后端服务，为国际物流用户管理系统提供 API 接口。

## 技术栈

- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB 对象建模工具
- **CORS** - 跨域资源共享
- **JWT** - JSON Web Token 认证
- **bcryptjs** - 密码加密

## 项目结构

```
server/
├── config/          # 配置文件
│   └── database.js  # MongoDB 连接配置
├── models/          # 数据模型
│   └── User.js      # 用户模型（Schema）
├── routes/          # 路由文件
│   ├── auth.js      # 认证相关路由
│   └── user.js      # 用户相关路由
├── services/        # 业务逻辑层
│   ├── authService.js    # 认证服务
│   └── userService.js    # 用户服务
├── utils/           # 工具函数
│   ├── auth.js      # JWT 认证工具
│   └── fileStorage.js  # 文件存储工具（已弃用）
├── scripts/         # 脚本文件
│   └── migrateToMongoDB.js  # 数据迁移脚本
├── data/            # 数据存储目录（JSON 文件，已弃用）
│   └── users.json   # 用户数据文件
├── index.js         # 入口文件
└── package.json     # 项目配置
```

## 快速开始

### 1. 安装 MongoDB

**macOS (使用 Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
下载并安装 MongoDB Community Server: https://www.mongodb.com/try/download/community

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# CentOS/RHEL
sudo yum install mongodb-server
```

### 2. 安装依赖

```bash
cd server
npm install
```

### 3. 配置数据库连接（可选）

创建 `.env` 文件（可选，默认使用本地 MongoDB）：
```bash
MONGODB_URI=mongodb://localhost:27017/wladmin
PORT=3001
```

### 4. 数据迁移（如果之前使用 JSON 文件存储）

如果之前使用 JSON 文件存储，需要迁移数据到 MongoDB：
```bash
npm run migrate
```

### 5. 启动服务

开发模式（支持热重载）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务默认运行在 `http://localhost:3001`

## API 接口

### 获取用户列表

```
GET /api/users
查询参数：
  - page: 页码（默认 1）
  - pageSize: 每页数量（默认 10）
  - username: 用户名（可选，模糊搜索）
  - email: 邮箱（可选，模糊搜索）
  - status: 状态（可选，active/inactive）
```

响应示例：
```json
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 10
  },
  "message": "获取成功"
}
```

### 获取用户详情

```
GET /api/users/:id
```

### 创建用户

```
POST /api/users
请求体：
{
  "username": "用户名（必填）",
  "email": "邮箱（必填）",
  "phone": "电话（必填）",
  "company": "公司名称（必填）",
  "country": "国家/地区（必填）",
  "status": "状态（可选，默认 active）",
  "remark": "备注（可选）"
}
```

### 更新用户

```
PUT /api/users/:id
请求体：同创建用户（所有字段可选）
```

### 删除用户

```
DELETE /api/users/:id
```

## 数据存储

**当前使用 MongoDB 数据库存储用户数据。**

### 数据库配置

- **数据库名称**: `wladmin`
- **集合名称**: `users`
- **连接字符串**: `mongodb://localhost:27017/wladmin`

### 数据模型

用户模型包含以下字段：
- `username` - 用户名（唯一索引）
- `password` - 密码（加密存储）
- `email` - 邮箱（唯一索引）
- `phone` - 电话
- `company` - 公司名称
- `country` - 国家/地区
- `status` - 状态（active/inactive）
- `remark` - 备注
- `createdAt` - 创建时间（自动）
- `updatedAt` - 更新时间（自动）

### 数据迁移

如果之前使用 JSON 文件存储，运行迁移脚本：
```bash
npm run migrate
```

迁移脚本会：
1. 读取 `data/users.json` 中的数据
2. 检查数据库中是否已有数据
3. 将数据导入到 MongoDB
4. 自动处理密码加密

## 环境变量

可以通过环境变量配置：

- `MONGODB_URI`: MongoDB 连接字符串（默认 `mongodb://localhost:27017/wladmin`）
- `PORT`: 服务端口（默认 3001）

示例：
```bash
# 使用自定义 MongoDB 连接
MONGODB_URI=mongodb://localhost:27017/wladmin PORT=8080 npm start

# 使用 MongoDB Atlas（云数据库）
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wladmin npm start
```

## 错误处理

所有接口统一返回格式：
```json
{
  "code": 状态码,
  "message": "错误信息",
  "data": 数据（可选）
}
```

常见状态码：
- 200: 成功
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器内部错误


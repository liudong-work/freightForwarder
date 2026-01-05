# 国际物流用户管理系统

基于 Vue 3 + Ant Design Vue 开发的国际物流用户管理系统。

## 功能特性

- ✅ 用户列表展示（支持分页）
- ✅ 用户搜索和筛选（用户名、邮箱、状态）
- ✅ 新增用户
- ✅ 编辑用户信息
- ✅ 删除用户（带确认提示）
- ✅ 查看用户详情
- ✅ 用户状态管理（启用/禁用）
- ✅ 响应式设计，适配不同屏幕尺寸

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Ant Design Vue** - 企业级 UI 组件库
- **Vue Router** - 官方路由管理器
- **Axios** - HTTP 客户端
- **Vite** - 下一代前端构建工具
- **Day.js** - 轻量级日期处理库

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **CORS** - 跨域资源共享
- **UUID** - 唯一标识符生成

## 项目结构

```
wladmin/
├── server/            # 后端服务
│   ├── routes/        # 路由文件
│   │   └── user.js    # 用户相关路由
│   ├── services/      # 业务逻辑层
│   │   └── userService.js
│   ├── utils/         # 工具函数
│   │   └── fileStorage.js
│   ├── data/          # 数据存储目录
│   │   └── users.json
│   ├── index.js       # 后端入口文件
│   └── package.json   # 后端依赖配置
├── src/               # 前端源码
│   ├── api/           # API 接口
│   │   └── user.js    # 用户相关 API
│   ├── layouts/       # 布局组件
│   │   └── BasicLayout.vue
│   ├── views/         # 页面组件
│   │   └── UserManagement.vue
│   ├── router/        # 路由配置
│   │   └── index.js
│   ├── utils/         # 工具函数
│   │   ├── request.js # Axios 封装
│   │   └── format.js  # 格式化工具
│   ├── mock/          # 模拟数据
│   │   └── user.js
│   ├── styles/        # 样式文件
│   │   └── main.css
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
├── index.html
├── vite.config.js
└── package.json       # 前端依赖配置
```

## 快速开始

### 1. 安装前端依赖

```bash
npm install
```

### 2. 安装后端依赖

```bash
cd server
npm install
cd ..
```

### 3. 启动后端服务

```bash
cd server
npm run dev
```

后端服务运行在 `http://localhost:3001`

### 4. 启动前端开发服务器

在项目根目录下：

```bash
npm run dev
```

前端应用运行在 `http://localhost:3003`

### 5. 访问应用

打开浏览器访问 http://localhost:3003

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 环境配置

项目默认连接 Node.js 后端服务。开发环境下，Vite 会自动代理 `/api` 请求到后端服务。

### 前端环境变量

创建 `.env` 文件（可选）：

```env
# API 基础地址（开发环境通过 Vite 代理，生产环境需要配置实际地址）
VITE_API_BASE_URL=/api

# 是否使用模拟数据（true/false，默认 false）
VITE_USE_MOCK=false
```

### 后端环境变量

后端服务支持通过环境变量配置：

```bash
PORT=3001 npm run dev
```

### 使用模拟数据

如果不想启动后端服务，可以设置 `VITE_USE_MOCK=true` 使用前端模拟数据。

## API 接口说明

### 获取用户列表

```
GET /api/users
参数：
  - page: 页码（默认 1）
  - pageSize: 每页数量（默认 10）
  - username: 用户名（可选）
  - email: 邮箱（可选）
  - status: 状态（active/inactive，可选）
```

### 创建用户

```
POST /api/users
Body:
  - username: 用户名（必填）
  - email: 邮箱（必填）
  - phone: 电话（必填）
  - company: 公司名称（必填）
  - country: 国家/地区（必填）
  - status: 状态（active/inactive，默认 active）
  - remark: 备注（可选）
```

### 更新用户

```
PUT /api/users/:id
Body: 同创建用户
```

### 删除用户

```
DELETE /api/users/:id
```

### 获取用户详情

```
GET /api/users/:id
```

## 开发说明

### 添加新功能

1. 在 `src/views/` 目录下创建新的页面组件
2. 在 `src/router/index.js` 中添加路由配置
3. 如需 API 调用，在 `src/api/` 目录下创建对应的 API 文件
4. 如需模拟数据，在 `src/mock/` 目录下创建对应的 Mock 文件

### 代码规范

- 使用 ES6+ 语法
- 组件使用 Composition API
- 遵循 Vue 3 最佳实践
- 使用 Ant Design Vue 组件库规范

## 浏览器支持

现代浏览器和 IE11+（需要 polyfills）

## 许可证

MIT



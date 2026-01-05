import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { connectDB } from './config/database.js'
import userRoutes from './routes/user.js'
import authRoutes from './routes/auth.js'
import alibabaCustomerRoutes from './routes/alibabaCustomer.js'
import amazonCustomerRoutes from './routes/amazonCustomer.js'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 连接 MongoDB
connectDB().catch(console.error)

// 根路径 - API信息
app.get('/', (req, res) => {
  res.json({ 
    name: 'WLAdmin API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      alibabaCustomers: '/api/alibaba-customers',
      amazonCustomers: '/api/amazon-customers'
    }
  })
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/alibaba-customers', alibabaCustomerRoutes)
app.use('/api/amazon-customers', amazonCustomerRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ code: 500, message: '服务器内部错误', error: err.message })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})


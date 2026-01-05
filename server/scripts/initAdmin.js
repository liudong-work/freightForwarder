import { connectDB, disconnectDB } from '../config/database.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

async function initAdmin() {
  try {
    console.log('开始初始化管理员账户...')
    
    // 连接数据库
    await connectDB()
    console.log('✅ 数据库连接成功')
    
    // 检查是否已有管理员账户
    const existingAdmin = await User.findOne({ username: 'admin' })
    if (existingAdmin) {
      console.log('⚠️  管理员账户已存在，跳过创建')
      await disconnectDB()
      process.exit(0)
    }
    
    // 加密密码（默认密码：123456）
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    // 创建管理员用户
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      phone: '13800138000',
      company: '系统管理员',
      country: '中国',
      status: 'active',
      role: 'admin',
      remark: '系统管理员账户'
    })
    
    await adminUser.save()
    console.log('✅ 管理员账户创建成功！')
    console.log('用户名: admin')
    console.log('密码: 123456')
    
    // 断开连接
    await disconnectDB()
    process.exit(0)
  } catch (error) {
    console.error('❌ 初始化失败:', error)
    await disconnectDB()
    process.exit(1)
  }
}

// 执行初始化
initAdmin()


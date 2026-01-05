import { connectDB, disconnectDB } from '../config/database.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

async function initManager() {
  try {
    console.log('开始初始化管理员账户...')
    
    // 连接数据库
    await connectDB()
    console.log('✅ 数据库连接成功')
    
    // 检查是否已有manager账户
    const existingManager = await User.findOne({ username: 'manager' })
    if (existingManager) {
      console.log('⚠️  manager账户已存在')
      console.log('用户名: manager')
      console.log('密码: 123456')
      await disconnectDB()
      process.exit(0)
    }
    
    // 加密密码（默认密码：123456）
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    // 创建manager用户
    const managerUser = new User({
      username: 'manager',
      password: hashedPassword,
      email: 'manager@example.com',
      phone: '13800000001',
      company: '管理部',
      status: 'active',
      role: 'admin',
      remark: '管理员账号'
    })
    
    await managerUser.save()
    console.log('✅ manager账户创建成功！')
    console.log('用户名: manager')
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
initManager()


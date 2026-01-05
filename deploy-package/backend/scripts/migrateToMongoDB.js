import { connectDB, disconnectDB } from '../config/database.js'
import User from '../models/User.js'
import { readUsers } from '../utils/fileStorage.js'
import bcrypt from 'bcryptjs'

async function migrate() {
  try {
    console.log('开始迁移数据到 MongoDB...')
    
    // 连接数据库
    await connectDB()
    
    // 检查是否已有数据
    const existingCount = await User.countDocuments()
    if (existingCount > 0) {
      console.log(`⚠️  数据库中已有 ${existingCount} 条用户数据`)
      console.log('是否继续迁移？这将跳过已存在的用户（基于用户名和邮箱）')
      // 继续执行，但会跳过已存在的用户
    }
    
    // 读取 JSON 文件中的数据
    const jsonUsers = await readUsers()
    console.log(`从 JSON 文件读取到 ${jsonUsers.length} 条用户数据`)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    // 迁移数据
    for (const jsonUser of jsonUsers) {
      try {
        // 检查用户是否已存在
        const existingUser = await User.findOne({
          $or: [
            { username: jsonUser.username },
            { email: jsonUser.email }
          ]
        })
        
        if (existingUser) {
          console.log(`跳过已存在的用户: ${jsonUser.username}`)
          skipCount++
          continue
        }
        
        // 处理密码
        let password = jsonUser.password
        if (!password) {
          // 如果没有密码，使用默认密码
          password = await bcrypt.hash('123456', 10)
        } else if (!password.startsWith('$2')) {
          // 如果密码不是 bcrypt 加密格式，则加密
          password = await bcrypt.hash(password, 10)
        }
        
        // 创建用户
        const user = new User({
          username: jsonUser.username,
          password: password,
          email: jsonUser.email,
          phone: jsonUser.phone,
          company: jsonUser.company,
          country: jsonUser.country,
          status: jsonUser.status || 'active',
          remark: jsonUser.remark || '',
          createTime: jsonUser.createTime ? new Date(jsonUser.createTime) : new Date()
        })
        
        await user.save()
        successCount++
        console.log(`✓ 迁移用户: ${jsonUser.username}`)
      } catch (error) {
        console.error(`✗ 迁移用户失败 ${jsonUser.username}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n迁移完成！')
    console.log(`成功: ${successCount} 条`)
    console.log(`跳过: ${skipCount} 条`)
    console.log(`失败: ${errorCount} 条`)
    
    // 断开连接
    await disconnectDB()
    process.exit(0)
  } catch (error) {
    console.error('迁移失败:', error)
    await disconnectDB()
    process.exit(1)
  }
}

// 执行迁移
migrate()

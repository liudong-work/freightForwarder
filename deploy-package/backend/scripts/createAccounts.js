import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '../config/database.js'
import User from '../models/User.js'

// 要创建的账号列表
const accounts = [
  {
    username: 'manager',
    password: '123456',
    phone: '13800000001',
    company: '管理部',
    status: 'active',
    remark: '管理员账号'
  },
  {
    username: 'sales01',
    password: '123456',
    phone: '13800000002',
    company: '销售部',
    status: 'active',
    remark: '销售账号1'
  },
  {
    username: 'sales02',
    password: '123456',
    phone: '13800000003',
    company: '销售部',
    status: 'active',
    remark: '销售账号2'
  },
  {
    username: 'service01',
    password: '123456',
    phone: '13800000004',
    company: '客服部',
    status: 'active',
    remark: '客服账号1'
  },
  {
    username: 'service02',
    password: '123456',
    phone: '13800000005',
    company: '客服部',
    status: 'active',
    remark: '客服账号2'
  }
]

async function createAccounts() {
  try {
    // 连接数据库
    await connectDB()
    console.log('✅ 数据库连接成功')
    
    const results = {
      success: [],
      failed: []
    }
    
    for (const account of accounts) {
      try {
        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username: account.username })
        if (existingUser) {
          console.log(`⚠️  账号 ${account.username} 已存在，跳过`)
          results.failed.push({
            username: account.username,
            reason: '账号已存在'
          })
          continue
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(account.password, 10)
        
        // 创建用户
        const newUser = new User({
          username: account.username,
          password: hashedPassword,
          phone: account.phone,
          company: account.company,
          status: account.status || 'active',
          remark: account.remark || ''
        })
        
        const savedUser = await newUser.save()
        
        console.log(`✅ 成功创建账号: ${account.username}`)
        results.success.push({
          username: account.username,
          id: savedUser._id.toString()
        })
      } catch (error) {
        console.error(`❌ 创建账号 ${account.username} 失败:`, error.message)
        results.failed.push({
          username: account.username,
          reason: error.message
        })
      }
    }
    
    // 输出结果汇总
    console.log('\n========== 创建结果汇总 ==========')
    console.log(`✅ 成功创建: ${results.success.length} 个账号`)
    console.log(`❌ 失败: ${results.failed.length} 个账号`)
    
    if (results.success.length > 0) {
      console.log('\n成功创建的账号:')
      results.success.forEach(item => {
        console.log(`  - ${item.username} (ID: ${item.id})`)
      })
    }
    
    if (results.failed.length > 0) {
      console.log('\n失败的账号:')
      results.failed.forEach(item => {
        console.log(`  - ${item.username}: ${item.reason}`)
      })
    }
    
    console.log('\n========== 账号信息 ==========')
    console.log('所有账号默认密码: 123456')
    console.log('账号列表:')
    accounts.forEach(acc => {
      console.log(`  用户名: ${acc.username} | 公司: ${acc.company} | 电话: ${acc.phone}`)
    })
    
    await mongoose.disconnect()
    console.log('\n✅ 完成')
  } catch (error) {
    console.error('❌ 错误:', error)
    process.exit(1)
  }
}

createAccounts()

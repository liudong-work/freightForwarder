import { connectDB, disconnectDB } from '../config/database.js'
import AlibabaCustomer from '../models/AlibabaCustomer.js'

async function clearAlibabaCustomers() {
  try {
    console.log('开始连接数据库...')
    
    // 连接数据库
    await connectDB()
    console.log('✅ 数据库连接成功')
    
    // 删除所有阿里巴巴客户数据
    const result = await AlibabaCustomer.deleteMany({})
    console.log(`✅ 成功删除所有阿里巴巴客户数据，共 ${result.deletedCount} 条`)
    
    // 断开连接
    await disconnectDB()
    console.log('✅ 数据库连接已断开')
    process.exit(0)
  } catch (error) {
    console.error('❌ 操作失败:', error)
    await disconnectDB()
    process.exit(1)
  }
}

// 执行清理
clearAlibabaCustomers()


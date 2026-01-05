import mongoose from 'mongoose'
import { connectDB } from '../config/database.js'

async function removeEmailIndex() {
  try {
    await connectDB()
    
    const db = mongoose.connection.db
    const collection = db.collection('users')
    
    // 获取所有索引
    const indexes = await collection.indexes()
    console.log('当前索引:', indexes)
    
    // 删除email的唯一索引
    try {
      await collection.dropIndex('email_1')
      console.log('✅ 成功删除email唯一索引')
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠️  email索引不存在，无需删除')
      } else {
        throw error
      }
    }
    
    // 删除email_1索引（如果存在）
    try {
      await collection.dropIndex('email_1')
    } catch (error) {
      // 忽略索引不存在的错误
    }
    
    // 显示更新后的索引
    const newIndexes = await collection.indexes()
    console.log('更新后的索引:', newIndexes)
    
    await mongoose.disconnect()
    console.log('✅ 完成')
  } catch (error) {
    console.error('❌ 错误:', error)
    process.exit(1)
  }
}

removeEmailIndex()

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wladmin'

// 连接 MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10秒超时
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    })
    console.log('✅ MongoDB 连接成功')
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message)
    console.error('提示: 请确保MongoDB服务已启动')
    throw error
  }
}

// 断开连接
export async function disconnectDB() {
  try {
    await mongoose.disconnect()
    console.log('MongoDB 连接已断开')
  } catch (error) {
    console.error('断开 MongoDB 连接失败:', error.message)
  }
}

// 监听连接事件
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 连接错误:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 连接已断开')
})

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB 重新连接成功')
})

export default mongoose

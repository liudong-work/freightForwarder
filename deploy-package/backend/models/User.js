import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    unique: false,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  company: {
    type: String,
    required: false,
    trim: true,
    default: '',
    index: true
  },
  country: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  remark: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'sub'],
    default: 'admin'
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  collection: 'users' // 指定集合名称
})

// 创建索引以提高查询性能（username 和 email 已有 unique 索引，无需重复创建）
userSchema.index({ status: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ role: 1 })
userSchema.index({ parentId: 1 })
userSchema.index({ createdBy: 1 })

// 转换为 JSON 时移除密码字段
userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  return obj
}

const User = mongoose.model('User', userSchema)

export default User

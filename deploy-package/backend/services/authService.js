import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/auth.js'
import User from '../models/User.js'

// 用户登录
export async function login(username, password) {
  try {
    const user = await User.findOne({ username })

    if (!user) {
      return null
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return null
    }

    // 生成 token（包含角色信息）
    // 如果用户没有role字段，默认设置为admin（兼容旧数据）
    const userRole = user.role || 'admin'
    const token = generateToken({
      id: user._id.toString(),
      userId: user._id.toString(),
      username: user.username,
      role: userRole,
      parentId: user.parentId ? user.parentId.toString() : null
    })

    // 返回用户信息（不包含密码）和 token
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone,
        company: user.company,
        country: user.country,
        status: user.status,
        role: userRole,
        parentId: user.parentId ? user.parentId.toString() : null,
        remark: user.remark || '',
        createTime: user.createdAt ? new Date(user.createdAt).toISOString().replace('T', ' ').substring(0, 19) : ''
      },
      token
    }
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

// 用户注册
export async function register(userData) {
  try {
    // 检查用户名和邮箱是否已存在
    const existingUser = await User.findOne({
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    })

    if (existingUser) {
      throw new Error('用户名或邮箱已存在')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    const newUser = new User({
      username: userData.username,
      password: hashedPassword,
      email: userData.email,
      phone: userData.phone,
      company: userData.company,
      country: userData.country,
      status: 'active',
      remark: ''
    })

    const savedUser = await newUser.save()

    // 生成 token（包含角色信息）
    const token = generateToken({
      id: savedUser._id.toString(),
      userId: savedUser._id.toString(),
      username: savedUser.username,
      role: savedUser.role || 'admin',
      parentId: savedUser.parentId ? savedUser.parentId.toString() : null
    })

    // 返回用户信息（不包含密码）和 token
    return {
      user: {
        id: savedUser._id.toString(),
        username: savedUser.username,
        email: savedUser.email,
        phone: savedUser.phone,
        company: savedUser.company,
        country: savedUser.country,
        status: savedUser.status,
        role: savedUser.role || 'admin',
        parentId: savedUser.parentId ? savedUser.parentId.toString() : null,
        remark: savedUser.remark || '',
        createTime: savedUser.createdAt ? new Date(savedUser.createdAt).toISOString().replace('T', ' ').substring(0, 19) : ''
      },
      token
    }
  } catch (error) {
    console.error('注册失败:', error)
    if (error.message === '用户名或邮箱已存在') {
      throw error
    }
    throw new Error('注册失败')
  }
}

// 获取当前用户信息
export async function getCurrentUser(userId) {
  try {
    const user = await User.findById(userId).lean()
    if (!user) {
      return null
    }
    
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      company: user.company,
      country: user.country,
      status: user.status,
      role: user.role || 'admin',
      parentId: user.parentId ? user.parentId.toString() : null,
      remark: user.remark || '',
      createTime: user.createdAt ? new Date(user.createdAt).toISOString().replace('T', ' ').substring(0, 19) : ''
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}

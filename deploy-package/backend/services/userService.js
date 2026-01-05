import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User.js'

// 获取状态值（支持中英文，导入时默认为未合作）
function getStatusValue(status, isImport = false) {
  if (!status) {
    // 导入时默认为未合作，其他情况默认为合作中
    return isImport ? 'pending' : 'active'
  }
  const statusStr = status.toString().trim()
  if (statusStr === '暂停合作' || statusStr === 'inactive') {
    return 'inactive'
  }
  if (statusStr === '未合作' || statusStr === 'pending') {
    return 'pending'
  }
  if (statusStr === '合作中' || statusStr === 'active') {
    return 'active'
  }
  // 导入时默认为未合作，其他情况默认为合作中
  return isImport ? 'pending' : 'active'
}

// 获取用户列表（带分页和筛选）
export async function getUserList(params, currentUser) {
  const { page = 1, pageSize = 10, username, phone, status } = params
  
  // 构建查询条件
  const query = {}
  
  // 根据当前用户角色过滤数据
  // 客户数据没有role字段，用户账号有role字段（'admin'或'sub'）
  if (currentUser) {
    const userRole = currentUser.role || 'admin' // 兼容旧数据，默认admin
    const userId = currentUser.id || currentUser.userId || currentUser._id
    
    if (userRole === 'sub' && userId) {
      // 子账号只能看到：自己创建的 + 主账号导入的
      const parentId = currentUser.parentId || userId
      // 构建查询条件，MongoDB会自动处理ObjectId转换
      try {
        query.$or = [
          { createdBy: userId }, // 自己创建的
          { createdBy: parentId } // 主账号导入的
        ]
      } catch (error) {
        console.error('构建查询条件失败:', error)
        // 如果转换失败，只查询自己创建的
        query.createdBy = userId
      }
      // 排除用户账号（只显示客户数据，客户数据没有role字段）
      query.role = { $exists: false }
    } else {
      // 主账号可以看到所有客户数据（排除用户账号）
      query.role = { $exists: false }
    }
  } else {
    // 如果没有用户信息，默认只显示客户数据
    query.role = { $exists: false }
  }
  
  if (username) {
    query.username = { $regex: username, $options: 'i' } // 不区分大小写的模糊搜索
  }
  
  if (phone) {
    query.phone = { $regex: phone, $options: 'i' }
  }
  
  if (status) {
    query.status = status
  }
  
  try {
    // 获取总数
    const total = await User.countDocuments(query)
    
    // 分页查询
    const skip = (page - 1) * pageSize
    const list = await User.find(query)
      .sort({ createdAt: -1 }) // 按创建时间倒序
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean() // 返回普通对象，不是 Mongoose 文档
    
    // 格式化数据
    const formattedList = list.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      company: user.company,
      country: user.country,
      status: user.status,
      remark: user.remark || '',
      createTime: user.createdAt ? new Date(user.createdAt).toISOString().replace('T', ' ').substring(0, 19) : ''
    }))
    
    return {
      list: formattedList,
      total
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    throw error
  }
}

// 根据 ID 获取用户
export async function getUserById(id) {
  try {
    const user = await User.findById(id).lean()
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
      remark: user.remark || '',
      createTime: user.createdAt ? new Date(user.createdAt).toISOString().replace('T', ' ').substring(0, 19) : ''
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    throw error
  }
}

// 创建用户（客户数据）
export async function createUser(userData, createdById) {
  try {
    // 验证至少需要客户名称或公司名称之一
    const username = userData.username ? userData.username.trim() : ''
    const company = userData.company ? userData.company.trim() : ''
    
    if (!username && !company) {
      throw new Error('至少需要填写客户名称或公司名称之一')
    }
    
    // 生成唯一用户名（如果没有提供，使用公司名称）
    let finalUsername = username
    if (!finalUsername) {
      finalUsername = company
      // 确保用户名唯一（只检查客户数据，排除用户账号）
      let counter = 1
      const baseUsername = finalUsername
      while (await User.findOne({ username: finalUsername, role: { $exists: false } })) {
        finalUsername = `${baseUsername}_${counter}`
        counter++
      }
    } else {
      // 检查用户名是否已存在（只检查客户数据）
      const existingUser = await User.findOne({ username: finalUsername, role: { $exists: false } })
      if (existingUser) {
        throw new Error('客户名称已存在')
      }
    }
    
    // 如果有密码，则加密
    let password = userData.password
    if (password) {
      password = await bcrypt.hash(password, 10)
    } else {
      // 默认密码：123456
      password = await bcrypt.hash('123456', 10)
    }
    
    const userObj = {
      username: finalUsername,
      password: password,
      phone: userData.phone ? userData.phone.trim() : '',
      company: company || '',
      country: userData.country ? userData.country.trim() : '',
      status: getStatusValue(userData.status),
      remark: userData.remark || '',
      createdBy: createdById || null // 记录创建者
    }
    
    // 只有当email不为空时才设置email字段
    if (userData.email && userData.email.trim()) {
      userObj.email = userData.email.trim().toLowerCase()
    }
    
    const newUser = new User(userObj)
    
    const savedUser = await newUser.save()
    
    // 返回时不包含密码
    return {
      id: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email,
      phone: savedUser.phone,
      company: savedUser.company,
      country: savedUser.country,
      status: savedUser.status,
      remark: savedUser.remark || '',
      createTime: savedUser.createdAt ? new Date(savedUser.createdAt).toISOString().replace('T', ' ').substring(0, 19) : ''
    }
  } catch (error) {
    console.error('创建用户失败:', error)
    if (error.message === '用户名或邮箱已存在' || error.message === '客户名称已存在') {
      throw error
    }
    throw new Error('创建用户失败')
  }
}

// 更新用户
export async function updateUser(id, userData) {
  try {
    const user = await User.findById(id)
    
    if (!user) {
      return null
    }
    
    // 检查用户名是否与其他用户冲突
    if (userData.username) {
      const conflictUser = await User.findOne({
        _id: { $ne: id },
        username: userData.username.trim()
      })
      if (conflictUser) {
        throw new Error('客户名称已被其他用户使用')
      }
    }
    
    // 处理密码更新
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10)
    } else {
      // 如果没有提供密码，保持原密码不变
      delete userData.password
    }
    
    // 更新用户信息
    Object.assign(user, userData)
    const updatedUser = await user.save()
    
    // 返回时不包含密码
    return {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      company: updatedUser.company,
      country: updatedUser.country,
      status: updatedUser.status,
      remark: updatedUser.remark || '',
      createTime: updatedUser.createdAt ? new Date(updatedUser.createdAt).toISOString().replace('T', ' ').substring(0, 19) : ''
    }
  } catch (error) {
    console.error('更新用户失败:', error)
    if (error.message === '用户名或邮箱已被其他用户使用') {
      throw error
    }
    throw new Error('更新用户失败')
  }
}

// 删除用户
export async function deleteUser(id) {
  try {
    const result = await User.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error('删除用户失败:', error)
    throw error
  }
}

// 批量删除用户
export async function deleteUsers(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('请选择要删除的用户')
    }
    
    const result = await User.deleteMany({ _id: { $in: ids } })
    return {
      deletedCount: result.deletedCount,
      total: ids.length
    }
  } catch (error) {
    console.error('批量删除用户失败:', error)
    throw error
  }
}

// 批量导入用户
export async function importUsers(usersData, createdById) {
  const results = {
    success: [],
    failed: [],
    total: usersData.length
  }
  
  const defaultPassword = await bcrypt.hash('123456', 10)
  
  for (let i = 0; i < usersData.length; i++) {
    const userData = usersData[i]
    const rowNumber = i + 2 // Excel行号（第1行是表头，所以从第2行开始）
    
    try {
      // 提取字段，允许为空
      const username = userData.username ? userData.username.toString().trim() : ''
      const email = userData.email ? userData.email.toString().trim() : ''
      const phone = userData.phone ? userData.phone.toString().trim() : ''
      const company = userData.company ? userData.company.toString().trim() : ''
      const country = userData.country ? userData.country.toString().trim() : ''
      
      // 至少需要有客户名称或公司名称之一才能创建用户
      if (!username && !company) {
        results.failed.push({
          row: rowNumber,
          data: userData,
          error: '至少需要填写客户名称或公司名称之一'
        })
        continue
      }
      
      // 生成唯一用户名（如果没有提供，使用公司名称或生成一个）
      let finalUsername = username
      if (!finalUsername) {
        // 如果没有客户名称，使用公司名称或生成一个
        finalUsername = company || `user_${Date.now()}_${i}`
        // 确保用户名唯一（只检查客户数据）
        let counter = 1
        const baseUsername = finalUsername
        while (await User.findOne({ username: finalUsername, role: { $exists: false } })) {
          finalUsername = `${baseUsername}_${counter}`
          counter++
        }
      } else {
        // 如果提供了用户名，检查是否已存在（只检查客户数据）
        const existingUser = await User.findOne({ username: finalUsername, role: { $exists: false } })
        if (existingUser) {
          results.failed.push({
            row: rowNumber,
            data: userData,
            error: '客户名称已存在'
          })
          continue
        }
      }
      
      // 创建用户（邮箱字段可选，其他字段也是可选的）
      // 导入时默认状态为未合作，创建时间为当前时间
      const currentTime = new Date()
      const userObj = {
        username: finalUsername,
        password: defaultPassword,
        phone: phone || '',
        company: company || '',
        country: country || '',
        status: getStatusValue(userData.status, true), // 导入时默认为未合作
        remark: (userData.remark || '').trim(),
        createdBy: createdById || null, // 记录创建者
        createTime: currentTime, // 显式设置导入时间为创建时间
        createdAt: currentTime, // 同时设置timestamps的createdAt
        updatedAt: currentTime // 设置updatedAt
      }
      
      // 只有当email不为空时才设置email字段，避免空字符串触发唯一索引错误
      if (email && email.trim()) {
        userObj.email = email.toLowerCase()
      }
      
      const newUser = new User(userObj)
      
      const savedUser = await newUser.save()
      
      results.success.push({
        row: rowNumber,
        id: savedUser._id.toString(),
        username: savedUser.username
      })
    } catch (error) {
      console.error(`导入第${rowNumber}行失败:`, error)
      results.failed.push({
        row: rowNumber,
        data: userData,
        error: error.message || '导入失败'
      })
    }
  }
  
  return results
}

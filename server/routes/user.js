import express from 'express'
import multer from 'multer'
import xlsx from 'xlsx'
import bcrypt from 'bcryptjs'
import {
  getUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteUsers,
  importUsers
} from '../services/userService.js'
import { authenticateToken } from '../utils/auth.js'
import User from '../models/User.js'

// 配置multer用于文件上传（内存存储）
const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

// 所有用户管理接口都需要认证
router.use(authenticateToken)

// 获取用户列表（客户数据）
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, username, email, status } = req.query
    
    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      username,
      email,
      status
    }
    
    // 传递当前用户信息用于权限过滤
    const result = await getUserList(params, req.user)
    res.json({
      code: 200,
      data: result,
      message: '获取成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '获取用户列表失败'
    })
  }
})

// 子账号管理 - 获取子账号列表（仅主账号可用）
// 注意：这个路由必须在 /:id 之前，否则 "sub-accounts" 会被当作 id
router.get('/sub-accounts', async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '只有主账号可以查看子账号列表'
      })
    }
    
    const { page = 1, pageSize = 10 } = req.query
    
    const userId = req.user.id || req.user.userId || req.user._id
    const query = {
      role: 'sub',
      parentId: userId
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize)
    const total = await User.countDocuments(query)
    const list = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean()
    
    const formattedList = list.map(user => ({
      id: user._id.toString(),
      username: user.username,
      phone: user.phone,
      company: user.company,
      status: user.status,
      remark: user.remark || '',
      createTime: user.createdAt ? new Date(user.createdAt).toISOString().replace('T', ' ').substring(0, 19) : ''
    }))
    
    res.json({
      code: 200,
      data: {
        list: formattedList,
        total
      },
      message: '获取成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '获取子账号列表失败'
    })
  }
})

// 创建子账号（仅主账号可用）
router.post('/sub-accounts', async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '只有主账号可以创建子账号'
      })
    }
    
    const { username, password, phone, company, remark } = req.body
    
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      })
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在'
      })
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建子账号
    const userId = req.user.id || req.user.userId || req.user._id
    const subAccount = new User({
      username,
      password: hashedPassword,
      phone: phone || '',
      company: company || '',
      remark: remark || '',
      role: 'sub',
      parentId: userId,
      status: 'active'
    })
    
    const savedAccount = await subAccount.save()
    
    res.status(201).json({
      code: 200,
      data: {
        id: savedAccount._id.toString(),
        username: savedAccount.username,
        phone: savedAccount.phone,
        company: savedAccount.company,
        status: savedAccount.status
      },
      message: '创建子账号成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '创建子账号失败'
    })
  }
})

// 删除子账号（仅主账号可用）
router.delete('/sub-accounts/:id', async (req, res) => {
  try {
    // 检查是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '只有主账号可以删除子账号'
      })
    }
    
    const { id } = req.params
    
    // 检查子账号是否存在且属于当前主账号
    const userId = req.user.id || req.user.userId || req.user._id
    const subAccount = await User.findOne({
      _id: id,
      role: 'sub',
      parentId: userId
    })
    
    if (!subAccount) {
      return res.status(404).json({
        code: 404,
        message: '子账号不存在或无权删除'
      })
    }
    
    await User.findByIdAndDelete(id)
    
    res.json({
      code: 200,
      message: '删除子账号成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '删除子账号失败'
    })
  }
})

// 获取用户详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await getUserById(id)
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    res.json({
      code: 200,
      data: user,
      message: '获取成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '获取用户详情失败'
    })
  }
})

// 创建用户
router.post('/', async (req, res) => {
  try {
    const userData = req.body
    
    // 验证至少需要客户名称或公司名称之一
    const { username, company } = userData
    if (!username && !company) {
      return res.status(400).json({
        code: 400,
        message: '至少需要填写客户名称或公司名称之一'
      })
    }
    
    // 如果有邮箱，验证邮箱格式
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email)) {
        return res.status(400).json({
          code: 400,
          message: '邮箱格式不正确'
        })
      }
    }
    
    // 传递当前用户ID作为创建者
    const user = await createUser(userData, req.user.id)
    res.status(201).json({
      code: 200,
      data: user,
      message: '创建成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '创建用户失败'
    })
  }
})

// 更新用户
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userData = req.body
    
    // 验证邮箱格式（如果提供了邮箱）
    if (userData.email && userData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email)) {
        return res.status(400).json({
          code: 400,
          message: '邮箱格式不正确'
        })
      }
    }
    
    const user = await updateUser(id, userData)
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    res.json({
      code: 200,
      data: user,
      message: '更新成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '更新用户失败'
    })
  }
})

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const success = await deleteUser(id)
    
    if (!success) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '删除用户失败'
    })
  }
})

// 批量删除用户
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要删除的用户'
      })
    }
    
    const result = await deleteUsers(ids)
    
    res.json({
      code: 200,
      data: result,
      message: `成功删除 ${result.deletedCount} 个用户`
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '批量删除用户失败'
    })
  }
})

// Excel导入用户
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传Excel文件'
      })
    }
    
    // 检查文件类型
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      return res.status(400).json({
        code: 400,
        message: '只支持Excel文件格式（.xlsx, .xls）'
      })
    }
    
    // 解析Excel文件
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 转换为JSON格式
    const data = xlsx.utils.sheet_to_json(worksheet)
    
    if (data.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Excel文件中没有数据'
      })
    }
    
    // 字段映射（支持中英文表头，邮箱字段可选）
    const fieldMapping = {
      '客户名称': 'username',
      '用户名': 'username',
      'username': 'username',
      '邮箱': 'email',
      'email': 'email',
      '电话': 'phone',
      '手机': 'phone',
      '联系方式': 'phone',
      '联系人电话': 'phone',
      '联系电话': 'phone',
      'phone': 'phone',
      '公司名称': 'company',
      '公司': 'company',
      'company': 'company',
      '国家/地区': 'country',
      '国家': 'country',
      'country': 'country',
      '合作状态': 'status',
      '状态': 'status',
      'status': 'status',
      '备注': 'remark',
      'remark': 'remark'
    }
    
    // 转换数据格式
    const usersData = data.map(row => {
      const userData = {}
      Object.keys(row).forEach(key => {
        // 检查字段映射
        if (fieldMapping[key]) {
          const mappedKey = fieldMapping[key]
          // 如果字段已存在，合并值（优先使用非空值）
          if (userData[mappedKey] && !userData[mappedKey].toString().trim()) {
            userData[mappedKey] = row[key]
          } else if (!userData[mappedKey]) {
            userData[mappedKey] = row[key]
          }
        } else {
          // 如果没有映射，尝试使用小写键名
          const lowerKey = key.toLowerCase()
          if (!userData[lowerKey]) {
            userData[lowerKey] = row[key]
          }
        }
      })
      return userData
    })
    
    // 批量导入用户，传递当前用户ID作为创建者
    const results = await importUsers(usersData, req.user.id)
    
    res.json({
      code: 200,
      data: {
        total: results.total,
        success: results.success.length,
        failed: results.failed.length,
        successList: results.success,
        failedList: results.failed
      },
      message: `导入完成：成功 ${results.success.length} 条，失败 ${results.failed.length} 条`
    })
  } catch (error) {
    console.error('导入Excel失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '导入Excel失败'
    })
  }
})

export default router


import express from 'express'
import { login, register, getCurrentUser } from '../services/authService.js'
import { authenticateToken } from '../utils/auth.js'

const router = express.Router()

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      })
    }

    const result = await login(username, password)

    if (!result) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    res.json({
      code: 200,
      data: result,
      message: '登录成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '登录失败'
    })
  }
})

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, phone, company, country } = req.body

    if (!username || !password || !email || !phone || !company || !country) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段'
      })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        message: '邮箱格式不正确'
      })
    }

    const result = await register({
      username,
      password,
      email,
      phone,
      company,
      country
    })

    res.status(201).json({
      code: 200,
      data: result,
      message: '注册成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '注册失败'
    })
  }
})

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId)
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    // 移除密码字段
    const { password, ...userInfo } = user

    res.json({
      code: 200,
      data: userInfo,
      message: '获取成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '获取用户信息失败'
    })
  }
})

export default router


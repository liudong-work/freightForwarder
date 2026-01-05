import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'wladmin-secret-key-2024'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// 生成 token
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// 验证 token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// 认证中间件
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌'
    })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(403).json({
      code: 403,
      message: '无效或过期的令牌'
    })
  }

  req.user = decoded
  next()
}


import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDefaultUsers } from './initDefaultUsers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// 读取用户数据
export async function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // 如果文件不存在，创建默认数据
      const defaultUsers = await getDefaultUsers()
      await saveUsers(defaultUsers)
      return defaultUsers
    }
    
    const data = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取用户数据失败:', error)
    // 如果读取失败，返回默认数据
    return await getDefaultUsers()
  }
}

// 保存用户数据
export function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
  } catch (error) {
    console.error('保存用户数据失败:', error)
    throw error
  }
}


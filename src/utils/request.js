import axios from 'axios'
import { message } from 'ant-design-vue'

// 获取API基础URL
// 开发环境：使用空字符串（走Vite代理）
// 生产环境：优先使用window配置，其次使用环境变量
const getBaseURL = () => {
  // 开发环境：使用Vite代理，baseURL为空字符串
  if (import.meta.env.DEV) {
    return ''
  }
  // 生产环境：使用配置的API地址
  if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
    return window.__APP_CONFIG__.API_BASE_URL || ''
  }
  return import.meta.env.VITE_API_BASE_URL || ''
}

// 创建 axios 实例
const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000 // 增加到15秒，避免数据库查询超时
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加 token 认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 如果是FormData，让浏览器自动设置Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 如果后端返回的数据格式是 { code, data, message }
    if (res.code !== undefined) {
      if (res.code === 200 || res.code === 0) {
        return res
      } else {
        message.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
    }
    
    // 如果后端直接返回数据
    return { data: res }
  },
  (error) => {
    // 处理 401 未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      message.error('登录已过期，请重新登录')
    } else {
      message.error(error.response?.data?.message || error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default service


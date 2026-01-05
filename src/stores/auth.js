import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  // 安全地解析用户信息，避免 undefined 导致的 JSON 解析错误
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null
      }
      return JSON.parse(userStr)
    } catch (error) {
      console.error('解析用户信息失败:', error)
      return null
    }
  }
  const user = ref(getUserFromStorage())

  // 设置 token
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 设置用户信息
  function setUser(userInfo) {
    user.value = userInfo
    localStorage.setItem('user', JSON.stringify(userInfo))
  }

  // 清除认证信息
  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 检查是否已登录
  function isAuthenticated() {
    return !!token.value
  }

  return {
    token,
    user,
    setToken,
    setUser,
    clearAuth,
    isAuthenticated
  }
})


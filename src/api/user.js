import request from '@/utils/request'
import {
  getMockUserList,
  createMockUser,
  updateMockUser,
  deleteMockUser,
  getMockUserDetail
} from '@/mock/user'

// 是否使用模拟数据（默认 false，使用真实后端）
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 获取用户列表
export function getUserList(params) {
  if (USE_MOCK) {
    return getMockUserList(params)
  }
  return request({
    url: '/api/users',
    method: 'get',
    params
  })
}

// 创建用户
export function createUser(data) {
  if (USE_MOCK) {
    return createMockUser(data)
  }
  return request({
    url: '/api/users',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id, data) {
  if (USE_MOCK) {
    return updateMockUser(id, data)
  }
  return request({
    url: `/api/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  if (USE_MOCK) {
    return deleteMockUser(id)
  }
  return request({
    url: `/api/users/${id}`,
    method: 'delete'
  })
}

// 批量删除用户
export function deleteUsers(ids) {
  return request({
    url: '/api/users',
    method: 'delete',
    data: { ids }
  })
}

// 获取用户详情
export function getUserDetail(id) {
  if (USE_MOCK) {
    return getMockUserDetail(id)
  }
  return request({
    url: `/api/users/${id}`,
    method: 'get'
  })
}

// 导入Excel用户
export function importUsers(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/api/users/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取子账号列表
export function getSubAccounts(params) {
  return request({
    url: '/api/users/sub-accounts',
    method: 'get',
    params
  })
}

// 创建子账号
export function createSubAccount(data) {
  return request({
    url: '/api/users/sub-accounts',
    method: 'post',
    data
  })
}

// 删除子账号
export function deleteSubAccount(id) {
  return request({
    url: `/api/users/sub-accounts/${id}`,
    method: 'delete'
  })
}


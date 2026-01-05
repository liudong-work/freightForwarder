// 模拟用户数据
let mockUsers = [
  {
    id: 1,
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    company: '顺丰速运',
    country: '中国',
    status: 'active',
    createTime: '2024-01-15 10:30:00',
    remark: 'VIP客户'
  },
  {
    id: 2,
    username: 'lisi',
    email: 'lisi@example.com',
    phone: '13800138002',
    company: 'DHL国际快递',
    country: '德国',
    status: 'active',
    createTime: '2024-01-16 14:20:00',
    remark: ''
  },
  {
    id: 3,
    username: 'wangwu',
    email: 'wangwu@example.com',
    phone: '13800138003',
    company: 'FedEx联邦快递',
    country: '美国',
    status: 'inactive',
    createTime: '2024-01-17 09:15:00',
    remark: '暂停合作'
  },
  {
    id: 4,
    username: 'zhaoliu',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    company: 'UPS联合包裹',
    country: '美国',
    status: 'active',
    createTime: '2024-01-18 16:45:00',
    remark: ''
  },
  {
    id: 5,
    username: 'sunqi',
    email: 'sunqi@example.com',
    phone: '13800138005',
    company: 'TNT快递',
    country: '荷兰',
    status: 'active',
    createTime: '2024-01-19 11:30:00',
    remark: '长期合作伙伴'
  }
]

let nextId = 6

// 模拟 API 延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 获取用户列表
export async function getMockUserList(params) {
  await delay()
  
  let filteredUsers = [...mockUsers]
  
  // 搜索过滤
  if (params.username) {
    filteredUsers = filteredUsers.filter(user =>
      user.username.toLowerCase().includes(params.username.toLowerCase())
    )
  }
  
  if (params.email) {
    filteredUsers = filteredUsers.filter(user =>
      user.email.toLowerCase().includes(params.email.toLowerCase())
    )
  }
  
  if (params.status) {
    filteredUsers = filteredUsers.filter(user => user.status === params.status)
  }
  
  // 分页
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    code: 200,
    data: {
      list: filteredUsers.slice(start, end),
      total: filteredUsers.length
    }
  }
}

// 创建用户
export async function createMockUser(data) {
  await delay()
  
  const newUser = {
    id: nextId++,
    ...data,
    createTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
  }
  
  mockUsers.push(newUser)
  
  return {
    code: 200,
    data: newUser,
    message: '创建成功'
  }
}

// 更新用户
export async function updateMockUser(id, data) {
  await delay()
  
  const index = mockUsers.findIndex(user => user.id === id)
  if (index === -1) {
    throw new Error('用户不存在')
  }
  
  mockUsers[index] = {
    ...mockUsers[index],
    ...data
  }
  
  return {
    code: 200,
    data: mockUsers[index],
    message: '更新成功'
  }
}

// 删除用户
export async function deleteMockUser(id) {
  await delay()
  
  const index = mockUsers.findIndex(user => user.id === id)
  if (index === -1) {
    throw new Error('用户不存在')
  }
  
  mockUsers.splice(index, 1)
  
  return {
    code: 200,
    message: '删除成功'
  }
}

// 获取用户详情
export async function getMockUserDetail(id) {
  await delay()
  
  const user = mockUsers.find(u => u.id === id)
  if (!user) {
    throw new Error('用户不存在')
  }
  
  return {
    code: 200,
    data: user
  }
}


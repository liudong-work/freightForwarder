import request from '@/utils/request'

// 获取营销号客户列表
export function getMarketingAccountCustomerList(params) {
  return request({
    url: '/api/marketing-account-customers',
    method: 'get',
    params
  })
}

// 获取营销号客户详情
export function getMarketingAccountCustomerDetail(id) {
  return request({
    url: `/api/marketing-account-customers/${id}`,
    method: 'get'
  })
}

// 创建营销号客户
export function createMarketingAccountCustomer(data) {
  return request({
    url: '/api/marketing-account-customers',
    method: 'post',
    data
  })
}

// 更新营销号客户
export function updateMarketingAccountCustomer(id, data) {
  return request({
    url: `/api/marketing-account-customers/${id}`,
    method: 'put',
    data
  })
}

// 删除营销号客户
export function deleteMarketingAccountCustomer(id) {
  return request({
    url: `/api/marketing-account-customers/${id}`,
    method: 'delete'
  })
}

// 批量删除营销号客户
export function deleteMarketingAccountCustomers(ids) {
  return request({
    url: '/api/marketing-account-customers',
    method: 'delete',
    data: { ids }
  })
}

// 导入Excel营销号客户
export function importMarketingAccountCustomers(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/api/marketing-account-customers/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


import request from '@/utils/request'

// 获取亚马逊客户列表
export function getAmazonCustomerList(params) {
  return request({
    url: '/api/amazon-customers',
    method: 'get',
    params
  })
}

// 获取亚马逊客户详情
export function getAmazonCustomerDetail(id) {
  return request({
    url: `/api/amazon-customers/${id}`,
    method: 'get'
  })
}

// 创建亚马逊客户
export function createAmazonCustomer(data) {
  return request({
    url: '/api/amazon-customers',
    method: 'post',
    data
  })
}

// 更新亚马逊客户
export function updateAmazonCustomer(id, data) {
  return request({
    url: `/api/amazon-customers/${id}`,
    method: 'put',
    data
  })
}

// 删除亚马逊客户
export function deleteAmazonCustomer(id) {
  return request({
    url: `/api/amazon-customers/${id}`,
    method: 'delete'
  })
}

// 批量删除亚马逊客户
export function deleteAmazonCustomers(ids) {
  return request({
    url: '/api/amazon-customers',
    method: 'delete',
    data: { ids }
  })
}

// 删除所有亚马逊客户（测试用）
export function deleteAllAmazonCustomers() {
  return request({
    url: '/api/amazon-customers',
    method: 'delete',
    data: { ids: 'all' }
  })
}

// 导入Excel亚马逊客户
export function importAmazonCustomers(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/api/amazon-customers/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


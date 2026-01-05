import request from '@/utils/request'

// 获取阿里巴巴客户列表
export function getAlibabaCustomerList(params) {
  return request({
    url: '/api/alibaba-customers',
    method: 'get',
    params
  })
}

// 获取阿里巴巴客户详情
export function getAlibabaCustomerDetail(id) {
  return request({
    url: `/api/alibaba-customers/${id}`,
    method: 'get'
  })
}

// 创建阿里巴巴客户
export function createAlibabaCustomer(data) {
  return request({
    url: '/api/alibaba-customers',
    method: 'post',
    data
  })
}

// 更新阿里巴巴客户
export function updateAlibabaCustomer(id, data) {
  return request({
    url: `/api/alibaba-customers/${id}`,
    method: 'put',
    data
  })
}

// 删除阿里巴巴客户
export function deleteAlibabaCustomer(id) {
  return request({
    url: `/api/alibaba-customers/${id}`,
    method: 'delete'
  })
}

// 批量删除阿里巴巴客户
export function deleteAlibabaCustomers(ids) {
  return request({
    url: '/api/alibaba-customers',
    method: 'delete',
    data: { ids }
  })
}

// 删除所有阿里巴巴客户（测试用）
export function deleteAllAlibabaCustomers() {
  return request({
    url: '/api/alibaba-customers',
    method: 'delete',
    data: { ids: 'all' }
  })
}

// 导入Excel阿里巴巴客户
export function importAlibabaCustomers(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/api/alibaba-customers/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


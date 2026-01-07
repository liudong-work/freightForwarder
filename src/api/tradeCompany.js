import request from '@/utils/request'
import * as XLSX from 'xlsx'

// 获取map数据列表
export function getTradeCompanyList(params) {
  return request({
    url: '/api/trade-companies',
    method: 'get',
    params
  })
}

// 导入Excel
export function importTradeCompanies(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/api/trade-companies/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  })
}

// 获取单条数据
export function getTradeCompanyById(id) {
  return request({
    url: `/api/trade-companies/${id}`,
    method: 'get'
  })
}

// 更新单条数据
export function updateTradeCompany(id, data) {
  return request({
    url: `/api/trade-companies/${id}`,
    method: 'put',
    data
  })
}

// 删除单条数据
export function deleteTradeCompany(id) {
  return request({
    url: `/api/trade-companies/${id}`,
    method: 'delete'
  })
}

// 批量删除
export function deleteTradeCompanies(ids) {
  return request({
    url: '/api/trade-companies',
    method: 'delete',
    data: { ids }
  })
}

// 清空所有数据
export function clearAllTradeCompanies() {
  return request({
    url: '/api/trade-companies/clear/all',
    method: 'delete'
  })
}

// 获取Excel固定表头
export function getExcelFixedHeaders() {
  return request({
    url: '/api/trade-companies/excel-headers',
    method: 'get'
  })
}

// 下载Excel模板
export function downloadTemplate() {
  const headers = ['公司名称', '联系人电话', '地址', '城市', '公司类型']
  const ws = XLSX.utils.aoa_to_sheet([headers])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, 'map数据导入模板.xlsx')
}


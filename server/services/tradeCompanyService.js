import TradeCompany from '../models/TradeCompany.js'
import mongoose from 'mongoose'

// Excel固定表头（模板中不包含爬取时间，由系统自动生成）
const excelFixedHeaders = [
  '公司名称',
  '联系人电话',
  '地址',
  '城市',
  '公司类型'
]

// 获取map数据列表（带分页和筛选）
export async function getTradeCompanyList(params) {
  const { page = 1, pageSize = 10, name, phone, city, category } = params
  
  // 构建查询条件
  const query = {}
  
  if (name) {
    query.name = { $regex: name, $options: 'i' }
  }
  
  if (phone) {
    query.phone = { $regex: phone, $options: 'i' }
  }
  
  if (city) {
    query.city = { $regex: city, $options: 'i' }
  }
  
  if (category) {
    query.category = category
  }
  
  try {
    // 检查MongoDB连接状态
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB未连接，返回空数据')
      return {
        list: [],
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
    
    // 获取总数
    const total = await TradeCompany.countDocuments(query)
    
    // 分页查询
    const skip = (page - 1) * pageSize
    const list = await TradeCompany.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean()
    
    return {
      list,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  } catch (error) {
    console.error('获取map数据列表失败:', error)
    throw error
  }
}

// 导入map数据
export async function importTradeCompanies(dataArray) {
  const successList = []
  const failedList = []
  
  for (let i = 0; i < dataArray.length; i++) {
    const rowData = dataArray[i]
    const rowNumber = i + 2 // Excel行号（第1行是表头，所以从2开始）
    
    try {
      // 映射Excel数据到数据库字段
      const mappedData = {
        name: (rowData['公司名称'] || '').toString().trim(),
        phone: (rowData['联系人电话'] || '').toString().trim(),
        address: (rowData['地址'] || '').toString().trim(),
        city: (rowData['城市'] || '').toString().trim(),
        category: (rowData['公司类型'] || '贸易公司').toString().trim(),
        crawledAt: rowData['爬取时间'] ? (new Date(rowData['爬取时间']) || new Date()) : new Date()
      }
      
      // 清理字符串字段
      Object.keys(mappedData).forEach(key => {
        if (typeof mappedData[key] === 'string') {
          mappedData[key] = mappedData[key].trim()
        }
      })
      
      // 验证必填字段
      if (!mappedData.name) {
        failedList.push({
          row: rowNumber,
          error: '公司名称不能为空'
        })
        continue
      }
      
      // 检查是否已存在（基于公司名称和电话）
      const existing = await TradeCompany.findOne({
        name: mappedData.name,
        phone: mappedData.phone
      })
      
      if (existing) {
        // 更新现有记录
        await TradeCompany.updateOne(
          { _id: existing._id },
          { $set: mappedData }
        )
        successList.push({
          row: rowNumber,
          action: 'updated',
          data: mappedData
        })
      } else {
        // 创建新记录
        const newCompany = new TradeCompany(mappedData)
        await newCompany.save()
        successList.push({
          row: rowNumber,
          action: 'created',
          data: mappedData
        })
      }
    } catch (error) {
      failedList.push({
        row: rowNumber,
        error: error.message || '导入失败'
      })
    }
  }
  
  return {
    success: successList.length,
    failed: failedList.length,
    total: dataArray.length,
    successList,
    failedList
  }
}

// 获取单条map数据
export async function getTradeCompanyById(id) {
  const result = await TradeCompany.findById(id)
  return result
}

// 更新map数据
export async function updateTradeCompany(id, data) {
  const result = await TradeCompany.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  )
  return result
}

// 删除map数据
export async function deleteTradeCompany(id) {
  const result = await TradeCompany.findByIdAndDelete(id)
  return result
}

// 批量删除map数据
export async function deleteTradeCompanies(ids) {
  const result = await TradeCompany.deleteMany({ _id: { $in: ids } })
  return result
}

// 清空所有map数据
export async function deleteAllTradeCompanies() {
  const result = await TradeCompany.deleteMany({})
  return result
}

// 获取Excel固定表头
export function getExcelFixedHeaders() {
  return excelFixedHeaders
}


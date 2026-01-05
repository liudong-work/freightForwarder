import AmazonCustomer from '../models/AmazonCustomer.js'
import mongoose from 'mongoose'

// Excel固定表头（与前端保持一致）
const excelFixedHeaders = [
  'ID',
  '来源',
  '关键词',
  '公司名称',
  '商店名称',
  '店铺链接',
  '联系人',
  '联系方式',
  '地址'
]

// 获取亚马逊客户列表（带分页和筛选）
export async function getAmazonCustomerList(params, currentUser) {
  const { page = 1, pageSize = 10, companyName, phone, status } = params
  
  // 构建查询条件
  const query = {}
  
  // 根据当前用户角色过滤数据
  if (currentUser) {
    const userRole = currentUser.role || 'admin'
    const userId = currentUser.id || currentUser.userId || currentUser._id
    
    if (userRole === 'sub' && userId) {
      // 子账号只能看到自己创建的或主账号创建的数据
      const parentId = currentUser.parentId || userId
      query.$or = [
        { createdBy: userId },
        { createdBy: parentId }
      ]
    }
  }
  
  if (companyName) {
    query.companyName = { $regex: companyName, $options: 'i' }
  }
  
  if (phone) {
    // 如果已经有$or条件（子账号查询），需要合并
    if (query.$or) {
      query.$and = [
        { $or: query.$or },
        {
          contactMethod: { $regex: phone, $options: 'i' }
        }
      ]
      delete query.$or
    } else {
      query.contactMethod = { $regex: phone, $options: 'i' }
    }
  }
  
  if (status) {
    query.status = status
  }
  
  try {
    // 检查MongoDB连接状态
    const mongoose = await import('mongoose')
    if (mongoose.default.connection.readyState !== 1) {
      // 数据库未连接，返回空数据而不是抛出错误
      console.warn('MongoDB未连接，返回空数据')
      return {
        list: [],
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
    
    // 获取总数
    const total = await AmazonCustomer.countDocuments(query)
    
    // 分页查询
    const skip = (page - 1) * pageSize
    const list = await AmazonCustomer.find(query)
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
    console.error('获取亚马逊客户列表失败:', error)
    // 如果是连接错误，返回空数据
    if (error.message && (error.message.includes('connect') || error.message.includes('timeout'))) {
      return {
        list: [],
        total: 0,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
    throw error
  }
}

// 获取亚马逊客户详情
export async function getAmazonCustomerById(id) {
  try {
    const customer = await AmazonCustomer.findById(id).lean()
    return customer
  } catch (error) {
    console.error('获取亚马逊客户详情失败:', error)
    throw error
  }
}

// 创建亚马逊客户
export async function createAmazonCustomer(customerData, createdById) {
  try {
    const customerObj = {
      excelId: customerData.excelId || '',
      source: customerData.source || '',
      keyword: customerData.keyword || '',
      companyName: customerData.companyName || '',
      storeName: customerData.storeName || '',
      storeLink: customerData.storeLink || '',
      contactPerson: customerData.contactPerson || '',
      contactMethod: customerData.contactMethod || '',
      address: customerData.address || '',
      status: customerData.status || 'pending',
      remark: customerData.remark || '',
      createdBy: createdById || null,
      excelRowIndex: customerData.excelRowIndex || null
    }
    
    const newCustomer = new AmazonCustomer(customerObj)
    const savedCustomer = await newCustomer.save()
    
    return savedCustomer.toObject()
  } catch (error) {
    console.error('创建亚马逊客户失败:', error)
    throw error
  }
}

// 更新亚马逊客户
export async function updateAmazonCustomer(id, customerData) {
  try {
    const updateObj = {}
    
    if (customerData.excelId !== undefined) updateObj.excelId = customerData.excelId
    if (customerData.source !== undefined) updateObj.source = customerData.source
    if (customerData.keyword !== undefined) updateObj.keyword = customerData.keyword
    if (customerData.companyName !== undefined) updateObj.companyName = customerData.companyName
    if (customerData.storeName !== undefined) updateObj.storeName = customerData.storeName
    if (customerData.storeLink !== undefined) updateObj.storeLink = customerData.storeLink
    if (customerData.contactPerson !== undefined) updateObj.contactPerson = customerData.contactPerson
    if (customerData.contactMethod !== undefined) updateObj.contactMethod = customerData.contactMethod
    if (customerData.address !== undefined) updateObj.address = customerData.address
    if (customerData.status !== undefined) updateObj.status = customerData.status
    if (customerData.remark !== undefined) updateObj.remark = customerData.remark
    
    const updatedCustomer = await AmazonCustomer.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true, runValidators: true }
    ).lean()
    
    if (!updatedCustomer) {
      throw new Error('客户不存在')
    }
    
    return updatedCustomer
  } catch (error) {
    console.error('更新亚马逊客户失败:', error)
    throw error
  }
}

// 删除亚马逊客户
export async function deleteAmazonCustomer(id) {
  try {
    // 验证ID格式
    if (!id) {
      throw new Error('客户ID不能为空')
    }
    
    // 验证是否为有效的MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('无效的客户ID格式')
    }
    
    // 转换为ObjectId
    const objectId = new mongoose.Types.ObjectId(id)
    
    const deletedCustomer = await AmazonCustomer.findByIdAndDelete(objectId)
    if (!deletedCustomer) {
      throw new Error('客户不存在')
    }
    return true
  } catch (error) {
    console.error('删除亚马逊客户失败:', error)
    // 如果是我们抛出的错误，直接抛出
    if (error.message && (error.message.includes('不能为空') || error.message.includes('无效') || error.message.includes('不存在'))) {
      throw error
    }
    // 其他错误包装后抛出
    throw new Error(error.message || '删除客户失败')
  }
}

// 批量删除亚马逊客户
export async function deleteAmazonCustomers(ids) {
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error('请提供要删除的客户ID列表')
    }
    
    // 验证并转换所有ID为ObjectId
    const objectIds = ids
      .filter(id => id) // 过滤空值
      .map(id => {
        // 验证ID格式
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`无效的客户ID格式: ${id}`)
        }
        return new mongoose.Types.ObjectId(id)
      })
    
    if (objectIds.length === 0) {
      throw new Error('没有有效的客户ID')
    }
    
    const result = await AmazonCustomer.deleteMany({ _id: { $in: objectIds } })
    return result.deletedCount
  } catch (error) {
    console.error('批量删除亚马逊客户失败:', error)
    // 如果是我们抛出的错误，直接抛出
    if (error.message && (error.message.includes('请提供') || error.message.includes('无效') || error.message.includes('没有有效'))) {
      throw error
    }
    // 其他错误包装后抛出
    throw new Error(error.message || '批量删除失败')
  }
}

// 删除所有亚马逊客户（测试用）
export async function deleteAllAmazonCustomers() {
  try {
    const result = await AmazonCustomer.deleteMany({})
    return result.deletedCount
  } catch (error) {
    console.error('删除所有亚马逊客户失败:', error)
    throw new Error(error.message || '删除所有客户失败')
  }
}

// 批量导入亚马逊客户
export async function importAmazonCustomers(customersData, createdById) {
  // 检查MongoDB连接状态
  if (mongoose.connection.readyState !== 1) {
    throw new Error('数据库未连接，请先启动MongoDB服务')
  }
  
  const results = {
    success: [],
    failed: [],
    total: customersData.length
  }
  
  for (let i = 0; i < customersData.length; i++) {
    const customerData = customersData[i]
    const rowNumber = i + 3 // Excel行号（第1行跳过，第2行是表头，第3行开始是数据）
    
    try {
      // 表头名称到数据库字段的映射关系
      const headerToFieldMap = {
        'ID': 'excelId',
        '来源': 'source',
        '关键词': 'keyword',
        '公司名称': 'companyName',
        '商店名称': 'storeName',
        '店铺链接': 'storeLink',
        '联系人': 'contactPerson',
        '联系方式': 'contactMethod',
        '地址': 'address'
      }
      
      const mappedData = {}
      
      // 只根据我们定义的字段名称去匹配Excel表头
      excelFixedHeaders.forEach((header, index) => {
        const fieldName = headerToFieldMap[header]
        if (fieldName) {
          // 优先使用表头名称匹配的值，其次使用col_X格式（向后兼容），最后使用字段名
          mappedData[fieldName] = customerData[header] || 
                                  customerData[`col_${index}`] || 
                                  customerData[fieldName] || 
                                  ''
        }
      })
      
      // 添加其他字段
      mappedData.status = customerData.status || 'pending'
      mappedData.remark = customerData.remark || ''
      mappedData.createdBy = createdById || null
      mappedData.excelRowIndex = rowNumber
      
      // 清理字符串字段
      Object.keys(mappedData).forEach(key => {
        if (typeof mappedData[key] === 'string') {
          mappedData[key] = mappedData[key].trim()
        }
      })
      
      const newCustomer = new AmazonCustomer(mappedData)
      const savedCustomer = await newCustomer.save()
      
      results.success.push({
        row: rowNumber,
        id: savedCustomer._id.toString(),
        companyName: savedCustomer.companyName
      })
    } catch (error) {
      console.error(`导入第${rowNumber}行失败:`, error)
      results.failed.push({
        row: rowNumber,
        data: customerData,
        error: error.message || '导入失败'
      })
    }
  }
  
  return results
}


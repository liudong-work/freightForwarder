import express from 'express'
import multer from 'multer'
import xlsx from 'xlsx'
import {
  getAmazonCustomerList,
  getAmazonCustomerById,
  createAmazonCustomer,
  updateAmazonCustomer,
  deleteAmazonCustomer,
  deleteAmazonCustomers,
  deleteAllAmazonCustomers,
  importAmazonCustomers
} from '../services/amazonCustomerService.js'
import { authenticateToken } from '../utils/auth.js'

// 配置multer用于文件上传（内存存储）
const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

// 所有接口都需要认证
router.use(authenticateToken)

// 获取亚马逊客户列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, companyName, phone, status } = req.query
    
    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      companyName,
      phone,
      status
    }
    
    const result = await getAmazonCustomerList(params, req.user)
    res.json({
      code: 200,
      data: result,
      message: '获取成功'
    })
  } catch (error) {
    console.error('获取亚马逊客户列表错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取客户列表失败',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// 获取亚马逊客户详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const customer = await getAmazonCustomerById(id)
    
    if (!customer) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在'
      })
    }
    
    res.json({
      code: 200,
      data: customer,
      message: '获取成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '获取客户详情失败'
    })
  }
})

// 创建亚马逊客户
router.post('/', async (req, res) => {
  try {
    const customerData = req.body
    const customer = await createAmazonCustomer(customerData, req.user.id)
    
    res.status(201).json({
      code: 200,
      data: customer,
      message: '创建成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '创建客户失败'
    })
  }
})

// 更新亚马逊客户
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const customerData = req.body
    const customer = await updateAmazonCustomer(id, customerData)
    
    res.json({
      code: 200,
      data: customer,
      message: '更新成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '更新客户失败'
    })
  }
})

// 删除亚马逊客户
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await deleteAmazonCustomer(id)
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '删除客户失败'
    })
  }
})

// 批量删除亚马逊客户
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body
    
    // 如果ids是'all'，表示删除所有数据（测试用）
    if (ids === 'all') {
      const deletedCount = await deleteAllAmazonCustomers()
      return res.json({
        code: 200,
        data: { deletedCount },
        message: `成功删除所有客户，共 ${deletedCount} 条`
      })
    }
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的客户ID列表'
      })
    }
    
    const deletedCount = await deleteAmazonCustomers(ids)
    
    res.json({
      code: 200,
      data: { deletedCount },
      message: `成功删除 ${deletedCount} 个客户`
    })
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '批量删除失败'
    })
  }
})

// Excel导入亚马逊客户
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传Excel文件'
      })
    }
    
    // 检查文件类型
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls', 'xltx'].includes(fileExtension)) {
      return res.status(400).json({
        code: 400,
        message: '只支持Excel文件格式（.xlsx, .xls, .xltx）'
      })
    }
    
    // 解析Excel文件
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 转换为JSON格式（第一行作为表头）
    const data = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false
    })
    
    if (data.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Excel文件中没有数据'
      })
    }
    
    // Excel固定表头（期望的表头名称）
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
    
    // 清理文本的函数（与前端保持一致）
    const cleanText = (text) => {
      if (!text) return ''
      let cleaned = String(text)
      
      // 第一步：移除所有HTML标签（包括不完整的标签如 /td>）
      cleaned = cleaned.replace(/<[^>]*>/g, '') // 完整的HTML标签 <td>, </td>, <tr> 等
      cleaned = cleaned.replace(/\/td>/g, '') // 不完整的 /td> 标签
      cleaned = cleaned.replace(/\/tr>/g, '') // 不完整的 /tr> 标签
      cleaned = cleaned.replace(/td>/g, '') // td> 标签
      cleaned = cleaned.replace(/tr>/g, '') // tr> 标签
      cleaned = cleaned.replace(/<td/g, '') // <td 开始标签
      cleaned = cleaned.replace(/<tr/g, '') // <tr 开始标签
      
      // 第二步：移除HTML实体（如 &nbsp;, &lt; 等）
      cleaned = cleaned.replace(/&[a-zA-Z]+;/g, '') // 命名实体如 &nbsp;
      cleaned = cleaned.replace(/&#\d+;/g, '') // 数字实体如 &#160;
      cleaned = cleaned.replace(/&#x[0-9a-fA-F]+;/g, '') // 十六进制实体如 &#xA0;
      
      // 第三步：移除控制字符和乱码
      cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // 控制字符
      cleaned = cleaned.replace(/[\uFFFD\u0000-\u001F\u007F-\u009F]/g, '') // Unicode替换字符和乱码
      
      // 第四步：移除常见的乱码模式（但保留中文、英文、数字、常见标点）
      cleaned = cleaned.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-_.,:;()（）【】、。，；：！？""''（）]/g, '')
      
      // 第五步：清理多余空格
      cleaned = cleaned.replace(/\s+/g, ' ') // 多个空格合并为一个
      cleaned = cleaned.trim() // 去除前后空格
      
      return cleaned
    }
    
    // 获取Excel表头（第一行）
    const excelHeadersRow = data[0] || []
    console.log('📋 [后端] Excel原始表头（第一行）:', excelHeadersRow)
    
    // 创建表头映射：Excel表头名称 -> 列索引
    const excelHeadersMap = {}
    excelHeadersRow.forEach((header, index) => {
      if (header) {
        const cleanedHeader = cleanText(String(header))
        if (cleanedHeader) {
          excelHeadersMap[cleanedHeader] = index
        }
      }
    })
    console.log('📋 [后端] Excel表头映射（清理后）:', excelHeadersMap)
    console.log('📋 [后端] 期望的字段列表:', excelFixedHeaders)
    
    // 创建映射表：前端字段 -> Excel列索引
    // 简单逻辑：能匹配就匹配，匹配不上就空着
    const finalHeadersMap = {}
    const matchResults = []
    
    excelFixedHeaders.forEach(header => {
      // 先精确匹配
      if (excelHeadersMap[header] !== undefined) {
        finalHeadersMap[header] = excelHeadersMap[header]
        matchResults.push({ field: header, status: '✅ 精确匹配', excelCol: excelHeadersMap[header], excelHeader: header })
      } else {
        // 模糊匹配：去除空格并转小写
        const headerNormalized = header.replace(/\s+/g, '').toLowerCase()
        let matched = false
        for (const [excelHeader, colIndex] of Object.entries(excelHeadersMap)) {
          const excelHeaderNormalized = excelHeader.replace(/\s+/g, '').toLowerCase()
          if (headerNormalized === excelHeaderNormalized) {
            finalHeadersMap[header] = colIndex
            matchResults.push({ field: header, status: '🔄 模糊匹配', excelCol: colIndex, excelHeader: excelHeader })
            matched = true
            break
          }
        }
        if (!matched) {
          matchResults.push({ field: header, status: '❌ 未匹配', excelCol: null, excelHeader: null })
        }
      }
    })
    
    console.log('📋 [后端] 字段匹配结果:')
    matchResults.forEach(result => {
      console.log(`  ${result.status} | 字段: "${result.field}" | Excel列: ${result.excelCol} | Excel表头: "${result.excelHeader || '无'}"`)
    })
    console.log('📋 [后端] 最终映射表:', finalHeadersMap)
    
    // 转换数据格式：从第二行开始读取数据（第一行是表头）
    const customersData = data.slice(1) // 跳过第一行表头
      .filter(row => row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')) // 过滤空行
      .map((row, rowIndex) => {
        const customerData = {}
        
        // 简单逻辑：根据前端字段去读取，能匹配就读取，匹配不上就空着
        excelFixedHeaders.forEach((header, index) => {
          let cellValue = ''
          
          // 查找Excel中对应的列索引
          const excelColIndex = finalHeadersMap[header]
          
          // 如果能匹配上，就读取值
          if (excelColIndex !== undefined && row[excelColIndex] !== undefined && row[excelColIndex] !== null) {
            const val = row[excelColIndex]
            if (val instanceof Date) {
              cellValue = val.toLocaleString('zh-CN')
            } else {
              cellValue = String(val)
            }
          }
          // 如果匹配不上或值为空，cellValue 就是空字符串，留空即可
          
          // 调试：输出第一行前3个字段的读取情况
          if (rowIndex === 0 && index < 3) {
            console.log(`  📊 [后端] 读取字段 "${header}": Excel列${excelColIndex} -> 值: "${cellValue}"`)
          }
          
          // 保存表头名称和值（用于数据库导入）
          customerData[header] = cleanText(cellValue)
          customerData[`col_${index}`] = cleanText(cellValue)
        })
        
        return customerData
      })
    
    console.log(`📊 [后端] 共解析 ${customersData.length} 行数据`)
    if (customersData.length > 0) {
      console.log('📊 [后端] 第一行数据示例:', customersData[0])
    }
    
    if (customersData.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Excel文件中没有有效数据'
      })
    }
    
    // 批量导入客户
    try {
      const results = await importAmazonCustomers(customersData, req.user.id)
      
      res.json({
        code: 200,
        data: {
          total: results.total,
          success: results.success.length,
          failed: results.failed.length,
          successList: results.success,
          failedList: results.failed
        },
        message: `导入完成：成功 ${results.success.length} 条，失败 ${results.failed.length} 条`
      })
    } catch (importError) {
      // 如果是数据库连接错误，返回更友好的提示
      if (importError.message && importError.message.includes('数据库未连接')) {
        return res.status(500).json({
          code: 500,
          message: '数据库未连接，请先启动MongoDB服务后再导入'
        })
      }
      throw importError // 重新抛出其他错误
    }
  } catch (error) {
    console.error('导入Excel失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '导入Excel失败'
    })
  }
})

export default router


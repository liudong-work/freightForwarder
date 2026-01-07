import express from 'express'
import multer from 'multer'
import xlsx from 'xlsx'
import {
  getTradeCompanyList,
  getTradeCompanyById,
  updateTradeCompany,
  deleteTradeCompany,
  deleteTradeCompanies,
  deleteAllTradeCompanies,
  importTradeCompanies,
  getExcelFixedHeaders
} from '../services/tradeCompanyService.js'
import { authenticateToken } from '../utils/auth.js'

// 配置multer用于文件上传（内存存储）
const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

// 所有接口都需要认证
router.use(authenticateToken)

// 获取map数据列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, phone, city, category } = req.query
    
    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      name,
      phone,
      city,
      category
    }
    
    const result = await getTradeCompanyList(params)
    res.json({
      code: 200,
      data: result,
      message: '获取成功'
    })
  } catch (error) {
    console.error('获取map数据列表错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取数据列表失败'
    })
  }
})

// 导入Excel
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传Excel文件'
      })
    }
    
    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'xltx'].includes(fileExtension)) {
      return res.status(400).json({
        code: 400,
        message: '只支持Excel文件格式（.xlsx、.xls、.xltx）'
      })
    }
    
    // 读取Excel文件
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 转换为JSON（第一行作为表头）
    const data = xlsx.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false
    })
    
    if (data.length === 0) {
      return res.status(400).json({
        code: 400,
        message: 'Excel文件中没有数据'
      })
    }
    
    // 导入数据
    const result = await importTradeCompanies(data)
    
    res.json({
      code: 200,
      data: result,
      message: `导入完成:成功${result.success}条,失败${result.failed}条`
    })
  } catch (error) {
    console.error('导入Excel错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '导入失败'
    })
  }
})

// 获取单条数据
router.get('/:id', async (req, res) => {
  try {
    const result = await getTradeCompanyById(req.params.id)
    if (!result) {
      return res.status(404).json({
        code: 404,
        message: '数据不存在'
      })
    }
    res.json({
      code: 200,
      data: result,
      message: '获取成功'
    })
  } catch (error) {
    console.error('获取map数据错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取失败'
    })
  }
})

// 更新单条数据
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address, city, category, remark } = req.body
    
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (category !== undefined) updateData.category = category
    if (remark !== undefined) updateData.remark = remark
    
    const result = await updateTradeCompany(req.params.id, updateData)
    if (!result) {
      return res.status(404).json({
        code: 404,
        message: '数据不存在'
      })
    }
    res.json({
      code: 200,
      data: result,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新map数据错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '更新失败'
    })
  }
})

// 删除单条数据
router.delete('/:id', async (req, res) => {
  try {
    await deleteTradeCompany(req.params.id)
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除map数据错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除失败'
    })
  }
})

// 批量删除
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要删除的数据'
      })
    }
    
    await deleteTradeCompanies(ids)
    res.json({
      code: 200,
      message: '批量删除成功'
    })
  } catch (error) {
    console.error('批量删除map数据错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '批量删除失败'
    })
  }
})

// 清空所有数据
router.delete('/clear/all', async (req, res) => {
  try {
    const result = await deleteAllTradeCompanies()
    res.json({
      code: 200,
      data: {
        deletedCount: result.deletedCount
      },
      message: '清空成功'
    })
  } catch (error) {
    console.error('清空map数据错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '清空失败'
    })
  }
})

// 获取Excel固定表头
router.get('/excel-headers', async (req, res) => {
  try {
    const headers = getExcelFixedHeaders()
    res.json({
      code: 200,
      data: headers,
      message: '获取成功'
    })
  } catch (error) {
    console.error('获取Excel表头错误:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取失败'
    })
  }
})

export default router


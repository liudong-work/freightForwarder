<template>
  <div class="customer-management">
    <div class="page-header">
      <h2>阿里巴巴客户管理</h2>
      <a-space>
        <a-upload
          :before-upload="handleImport"
          :show-upload-list="false"
          accept=".xlsx,.xls,.xltx"
        >
          <template #icon>
            <UploadOutlined />
          </template>
          <a-button type="default">
            <template #icon>
              <UploadOutlined />
            </template>
            导入Excel
          </a-button>
        </a-upload>
        <a-button 
          v-if="selectedRowKeys.length > 0"
          type="primary" 
          danger
          @click="handleBatchDelete"
        >
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除 ({{ selectedRowKeys.length }})
        </a-button>
        <a-button 
          v-if="isExcelMode"
          type="default"
          @click="handleResetToNormalMode"
        >
          返回数据库模式
        </a-button>
        <a-button v-if="!isExcelMode" type="primary" @click="handleAdd">
          <template #icon>
            <PlusOutlined />
          </template>
          新增客户
        </a-button>
      </a-space>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="客户名称">
          <a-input
            v-model:value="searchForm.username"
            placeholder="请输入客户名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input
            v-model:value="searchForm.phone"
            placeholder="请输入手机号"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="合作状态">
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择合作状态"
            allow-clear
            style="width: 150px"
          >
            <a-select-option value="active">合作中</a-select-option>
            <a-select-option value="inactive">暂停合作</a-select-option>
            <a-select-option value="pending">未合作</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            搜索
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 提示信息 -->
    <a-alert
      v-if="isExcelMode"
      message="当前展示的是Excel文件中的数据"
      description="表格列根据Excel表头动态生成，展示所有上传的字段"
      type="info"
      show-icon
      closable
      style="margin-bottom: 16px"
      @close="handleResetToNormalMode"
    />

    <!-- 客户表格 -->
    <a-table
      :columns="columns"
      :data-source="customerList"
      :loading="loading"
      :pagination="isExcelMode ? { ...pagination, showSizeChanger: true } : pagination"
      :row-selection="isExcelMode ? { selectedRowKeys: selectedRowKeys, onChange: onSelectChange, getCheckboxProps: (record) => ({ key: record._rowIndex }) } : { selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :row-key="isExcelMode ? '_rowIndex' : 'id'"
      :scroll="{ x: 'max-content' }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'createTime'">
          {{ formatDate(record.createTime) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button v-if="!isExcelMode" type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button type="link" size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-popconfirm
              :title="isExcelMode ? '确定要删除这条数据吗？' : '确定要删除这个客户吗？'"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
        <template v-else>
          {{ record[column.key] || '-' }}
        </template>
      </template>
    </a-table>

    <!-- 添加/编辑客户模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="600"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="客户名称" name="username">
          <a-input
            v-model:value="formData.username"
            placeholder="请输入客户名称（与公司名称至少填一个）"
          />
        </a-form-item>
        <a-form-item label="电话" name="phone">
          <a-input
            v-model:value="formData.phone"
            placeholder="请输入电话"
          />
        </a-form-item>
        <a-form-item label="公司名称" name="company">
          <a-input
            v-model:value="formData.company"
            placeholder="请输入公司名称（与客户名称至少填一个）"
          />
        </a-form-item>
        <a-form-item label="阿里巴巴店铺名称" name="alibabaStore">
          <a-input
            v-model:value="formData.alibabaStore"
            placeholder="请输入阿里巴巴店铺名称"
          />
        </a-form-item>
        <a-form-item label="合作状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio value="active">合作中</a-radio>
            <a-radio value="inactive">暂停合作</a-radio>
            <a-radio value="pending">未合作</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            placeholder="请输入备注"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看客户详情模态框 -->
    <a-modal
      v-model:open="viewModalVisible"
      title="客户详情"
      :width="600"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <template v-if="isExcelMode">
          <!-- Excel模式：展示所有字段 -->
          <a-descriptions-item
            v-for="(header, index) in excelHeaders"
            :key="index"
            :label="header || `列${index + 1}`"
          >
            {{ currentUser[`col_${index}`] || '-' }}
          </a-descriptions-item>
        </template>
        <template v-else>
          <!-- 数据库模式：展示标准字段 -->
          <a-descriptions-item label="客户名称">
            {{ currentUser.username }}
          </a-descriptions-item>
          <a-descriptions-item label="电话">
            {{ currentUser.phone }}
          </a-descriptions-item>
          <a-descriptions-item label="公司名称">
            {{ currentUser.company }}
          </a-descriptions-item>
          <a-descriptions-item label="阿里巴巴店铺名称">
            {{ currentUser.alibabaStore || '无' }}
          </a-descriptions-item>
          <a-descriptions-item label="合作状态">
            <a-tag :color="getStatusColor(currentUser.status)">
              {{ getStatusText(currentUser.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">
            {{ formatDate(currentUser.createTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="备注" :span="2">
            {{ currentUser.remark || '无' }}
          </a-descriptions-item>
        </template>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { 
  getAlibabaCustomerList, 
  createAlibabaCustomer, 
  updateAlibabaCustomer, 
  deleteAlibabaCustomer, 
  deleteAlibabaCustomers,
  importAlibabaCustomers 
} from '@/api/alibabaCustomer'
import { formatDate } from '@/utils/format'
import * as XLSX from 'xlsx'

// 固定的中文表头
const excelFixedHeaders = [
  '来源',
  '关键词',
  '公司名',
  '店铺链接',
  '入驻年数',
  '主营产品',
  '销量',
  '销售额',
  '热销市场',
  '国家',
  '省份',
  '城市',
  '联系人',
  '电话',
  '手机',
  '传真',
  '公司地址'
]

// 根据固定表头生成表格列
const generateColumnsFromHeaders = (headers) => {
  // 先添加ID列
  const cols = [{
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    fixed: 'left'
  }]
  
  // 添加Excel固定表头列
  headers.forEach((header, index) => {
    cols.push({
      title: header,
      dataIndex: `col_${index}`,
      key: `col_${index}`,
      width: 150,
      ellipsis: true
    })
  })
  
  // 添加操作列
  cols.push({
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  })
  
  return cols
}

// 表格列定义（直接使用固定表头）
const columns = ref(generateColumnsFromHeaders(excelFixedHeaders))

// 响应式数据
const loading = ref(false)
const customerList = ref([])
const modalVisible = ref(false)
const viewModalVisible = ref(false)
const modalTitle = ref('新增客户')
const formRef = ref(null)
const currentUser = ref({})
const selectedRowKeys = ref([])
const isExcelMode = ref(false) // 是否处于Excel展示模式
const excelHeaders = ref([]) // Excel表头

// 搜索表单
const searchForm = reactive({
  username: '',
  phone: '',
  status: undefined
})

// 表单数据
const formData = reactive({
  id: null,
  username: '',
  phone: '',
  company: '',
  alibabaStore: '',
  status: 'active',
  remark: ''
})

// 表单验证规则
const rules = {
  username: [
    { 
      validator: (rule, value, callback) => {
        if (!value && !formData.company) {
          callback(new Error('至少需要填写客户名称或公司名称之一'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  company: [
    { 
      validator: (rule, value, callback) => {
        if (!value && !formData.username) {
          callback(new Error('至少需要填写客户名称或公司名称之一'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`
})

// 加载客户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      companyName: searchForm.username, // 使用companyName搜索
      phone: searchForm.phone,
      status: searchForm.status
    }
    const res = await getAlibabaCustomerList(params)
    if (res && res.data) {
      // 将数据库数据转换为表格显示格式
      customerList.value = (res.data.list || []).map(customer => {
        const rowData = {
          id: customer._id || customer.id, // 必须使用MongoDB的_id用于删除操作
          _id: customer._id || customer.id, // 保存_id字段，确保删除时能正确获取
          excelId: customer.excelId || '', // Excel ID作为单独字段保存
          _rowIndex: customer.excelRowIndex || null
        }
        // 映射15个固定字段
        excelFixedHeaders.forEach((header, index) => {
          const fieldMap = {
            '来源': 'source',
            '关键词': 'keyword',
            '公司名': 'companyName',
            '店铺链接': 'storeLink',
            '入驻年数': 'yearsInBusiness',
            '主营产品': 'mainProducts',
            '销量': 'sales',
            '销售额': 'salesVolume',
            '热销市场': 'hotMarket',
            '国家': 'country',
            '省份': 'province',
            '城市': 'city',
            '联系人': 'contactPerson',
            '电话': 'phone',
            '手机': 'mobile',
            '传真': 'fax',
            '公司地址': 'companyAddress'
          }
          const fieldName = fieldMap[header]
          rowData[`col_${index}`] = customer[fieldName] || ''
        })
        // 映射表单需要的字段（用于编辑功能）
        rowData.username = customer.companyName || '' // 客户名称使用公司名
        rowData.company = customer.companyName || '' // 公司名称
        rowData.alibabaStore = customer.storeLink || '' // 阿里巴巴店铺链接
        rowData.phone = customer.phone || '' // 电话
        rowData.status = customer.status || 'pending' // 状态
        rowData.remark = customer.remark || '' // 备注
        return rowData
      })
      pagination.total = res.data.total || 0
    } else {
      customerList.value = []
      pagination.total = 0
    }
    selectedRowKeys.value = []
  } catch (error) {
    loading.value = false
    customerList.value = []
    pagination.total = 0
    selectedRowKeys.value = []
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadUserList()
}

// 重置搜索
const handleReset = () => {
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.status = undefined
  pagination.current = 1
  if (isExcelMode.value) {
    handleResetToNormalMode()
  } else {
    loadUserList()
  }
}

// 重置到正常模式（从Excel模式切换回数据库模式）
const handleResetToNormalMode = () => {
  isExcelMode.value = false
  excelHeaders.value = []
  columns.value = generateColumnsFromHeaders(excelFixedHeaders)
  loadUserList()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  if (!isExcelMode.value) {
    loadUserList()
  }
  // Excel模式下不需要重新加载，因为数据已经在内存中
}

// 新增客户
const handleAdd = () => {
  modalTitle.value = '新增客户'
  resetForm()
  modalVisible.value = true
}

// 编辑客户
const handleEdit = (record) => {
  modalTitle.value = '编辑客户'
  Object.assign(formData, {
    id: record.id,
    username: record.username,
    phone: record.phone,
    company: record.company,
    alibabaStore: record.alibabaStore || '',
    status: record.status,
    remark: record.remark || ''
  })
  modalVisible.value = true
}

// 查看客户详情
const handleView = (record) => {
  currentUser.value = { ...record }
  viewModalVisible.value = true
}

// 删除客户
const handleDelete = async (record) => {
  try {
    if (isExcelMode.value) {
      // Excel模式：从内存中删除数据
      const index = customerList.value.findIndex(item => item._rowIndex === record._rowIndex)
      if (index > -1) {
        customerList.value.splice(index, 1)
        // 更新总数
        pagination.total = customerList.value.length
        // 从选中列表中移除
        const selectedIndex = selectedRowKeys.value.indexOf(record._rowIndex)
        if (selectedIndex > -1) {
          selectedRowKeys.value.splice(selectedIndex, 1)
        }
        message.success('删除成功')
      } else {
        message.error('未找到要删除的数据')
      }
    } else {
      // 数据库模式：调用API删除
      // 确保使用正确的ID（优先使用_id，如果没有则使用id）
      let deleteId = record._id || record.id
      if (!deleteId) {
        message.error('无法获取客户ID，删除失败')
        return
      }
      // 确保ID是字符串格式（如果是ObjectId对象，转换为字符串）
      if (typeof deleteId !== 'string') {
        deleteId = String(deleteId)
      }
      // 去除可能的空格
      deleteId = deleteId.trim()
      
      await deleteAlibabaCustomer(deleteId)
      message.success('删除成功')
      const index = selectedRowKeys.value.indexOf(deleteId)
      if (index > -1) {
        selectedRowKeys.value.splice(index, 1)
      }
      loadUserList()
    }
  } catch (error) {
    console.error('删除失败:', error)
    const errorMessage = error.response?.data?.message || error.message || '未知错误'
    message.error('删除失败：' + errorMessage)
  }
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据')
    return
  }
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} ${isExcelMode.value ? '条数据' : '个客户'}吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        loading.value = true
        
        if (isExcelMode.value) {
          // Excel模式：从内存中批量删除数据
          const keysToDelete = new Set(selectedRowKeys.value)
          customerList.value = customerList.value.filter(item => {
            const key = isExcelMode.value ? item._rowIndex : item.id
            return !keysToDelete.has(key)
          })
          
          // 更新总数
          pagination.total = customerList.value.length
          
          // 清空选中列表
          selectedRowKeys.value = []
          
          message.success(`成功删除 ${keysToDelete.size} 条数据`)
        } else {
          // 数据库模式：调用API批量删除
          // 确保所有ID都是字符串格式
          const idsToDelete = selectedRowKeys.value.map(id => {
            if (typeof id !== 'string') {
              return String(id).trim()
            }
            return id.trim()
          }).filter(id => id) // 过滤空值
          
          if (idsToDelete.length === 0) {
            message.error('没有有效的客户ID')
            return
          }
          
          const res = await deleteAlibabaCustomers(idsToDelete)
          message.success(res.message || `成功删除 ${idsToDelete.length} 个客户`)
          selectedRowKeys.value = []
          loadUserList()
        }
      } catch (error) {
        message.error(error.message || '批量删除失败')
      } finally {
        loading.value = false
      }
    }
  })
}


// 提交表单
const handleSubmit = async () => {
  try {
    if (!formData.username && !formData.company) {
      message.error('至少需要填写客户名称或公司名称之一')
      return
    }
    
    await formRef.value.validate()
    // 将表单数据映射到数据库字段
    const submitData = {
      companyName: formData.company || formData.username || '',
      phone: formData.phone || '',
      status: formData.status || 'pending',
      remark: formData.remark || '',
      storeLink: formData.alibabaStore || '' // 表单字段alibabaStore映射到数据库字段storeLink
    }
    if (formData.id) {
      await updateAlibabaCustomer(formData.id, submitData)
      message.success('更新成功')
    } else {
      await createAlibabaCustomer(submitData)
      message.success('创建成功')
    }
    modalVisible.value = false
    loadUserList()
  } catch (error) {
    if (error.errorFields) {
      return
    }
    message.error(error.message || (formData.id ? '更新失败' : '创建失败'))
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    username: '',
    phone: '',
    company: '',
    alibabaStore: '',
    status: 'active',
    remark: ''
  })
  formRef.value?.resetFields()
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'active': '合作中',
    'inactive': '暂停合作',
    'pending': '未合作'
  }
  return statusMap[status] || '未知'
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'active': 'green',
    'inactive': 'red',
    'pending': 'orange'
  }
  return colorMap[status] || 'default'
}

// Excel导入 - 解析Excel并动态展示
const handleImport = async (file) => {
  try {
    // 重置Excel模式状态，确保每次导入都是全新开始
    isExcelMode.value = false
    excelHeaders.value = []
    selectedRowKeys.value = []
    
    // 验证文件格式
    const fileName = file.name || ''
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !['xlsx', 'xls', 'xltx'].includes(fileExtension)) {
      message.error('只支持Excel文件格式（.xlsx、.xls 或 .xltx）')
      return false
    }
    
    // 验证文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      message.error('文件大小不能超过10MB')
      return false
    }
    
    loading.value = true
    
    // 使用兼容型导入方式：智能识别 + 解析
    try {
      // 读取文件为 ArrayBuffer
      const data = await file.arrayBuffer()
      
      // 解码为 UTF-8 文本，用于检测文件格式
      const text = new TextDecoder('utf-8').decode(data)
      
      // 检查文件签名，确认文件格式
      const dataArray = new Uint8Array(data)
      const fileSignature = Array.from(dataArray.slice(0, 4))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      const fileSignatureHex = Array.from(dataArray.slice(0, 8))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ')
      console.log('📁 文件信息:')
      console.log('  - 文件名:', fileName)
      console.log('  - 文件扩展名:', fileExtension)
      console.log('  - 文件大小:', (file.size / 1024).toFixed(2), 'KB')
      console.log('  - 文件签名 (前4字节):', fileSignature)
      console.log('  - 文件签名 (前8字节):', fileSignatureHex)
      
      // 检测文件格式
      let fileType = 'unknown'
      if (fileSignature === '504b0304') {
        fileType = 'xlsx (标准ZIP格式)'
      } else if (fileSignature.startsWith('d0cf')) {
        fileType = 'xls (OLE格式)'
      } else if (fileSignature.startsWith('3c68746d') || fileSignature.startsWith('3c21444f')) {
        fileType = 'HTML格式 (可能是HTML转Excel)'
      } else {
        fileType = '未知格式'
        console.warn('⚠️ 文件签名不匹配，可能不是标准的Excel文件')
        console.warn('   标准xlsx签名: 504b0304 (ZIP格式)')
        console.warn('   标准xls签名: d0cf11e0 (OLE格式)')
      }
      console.log('  - 检测到的文件类型:', fileType)
      
      let workbook
      
      // 智能识别 + 解析
      // 情况 1: HTML 表格(阿里国际站最常见)
      if (text.includes('<table') || text.includes('<html') || fileType.includes('HTML格式')) {
        console.log('✅ 检测到HTML格式文件，使用字符串方式解析')
        workbook = XLSX.read(text, { type: 'string' })
      }
      // 情况 2: CSV
      else if (file.name.endsWith('.csv')) {
        console.log('✅ 检测到CSV文件，使用CSV方式解析')
        workbook = XLSX.read(text, { type: 'string' })
      }
      // 情况 3: 标准 Excel 文件 (xlsx, xls)
      else {
        console.log('✅ 检测到标准Excel文件，使用二进制方式解析')
        const readOptions = {
          type: 'array',
          cellDates: true,
          cellNF: false,
          cellText: true, // 使用文本值，而不是格式化值
          raw: false, // 使用格式化的文本值
          dense: false
        }
        workbook = XLSX.read(dataArray, readOptions)
      }
      
      console.log('📊 工作簿信息:')
      console.log('  - 工作表数量:', workbook.SheetNames.length)
      console.log('  - 工作表名称:', workbook.SheetNames)
      console.log('  - 工作簿属性:', workbook.Workbook?.WBProps || '无')
      
      // 获取第一个工作表
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
        
      // 检查第一个工作表的单元格格式（用于分析文件差异）
      const firstRowCells = []
      const sheetRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
      for (let C = sheetRange.s.c; C <= Math.min(sheetRange.s.c + 5, sheetRange.e.c); C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
        const cell = worksheet[cellAddress]
        if (cell) {
          firstRowCells.push({
            address: cellAddress,
            w: cell.w, // 文本值
            v: cell.v, // 原始值
            t: cell.t, // 类型
            f: cell.f, // 公式
            z: cell.z  // 格式
          })
        }
      }
      console.log('📊 第一行前6个单元格的详细信息:', firstRowCells)
      
      // 检查工作表是否有HTML格式的单元格
      const hasHtmlCells = Object.keys(worksheet).some(key => {
        if (key.startsWith('!')) return false
        const cell = worksheet[key]
        return cell && cell.w && (cell.w.includes('<') || cell.w.includes('/td>'))
      })
      if (hasHtmlCells) {
        console.warn('⚠️ 检测到工作表中可能包含HTML格式的单元格')
        console.warn('   这可能是因为文件是从网页复制粘贴或HTML格式保存的')
      }
      
      // 清理HTML标签和特殊字符的函数（必须在所有读取操作之前定义）
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
        // 这个正则表达式会保留：中文、英文、数字、空格、常见标点符号
        cleaned = cleaned.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-_.,:;()（）【】、。，；：！？""''（）]/g, '')
        
        // 第五步：清理多余空格
        cleaned = cleaned.replace(/\s+/g, ' ') // 多个空格合并为一个
        cleaned = cleaned.trim() // 去除前后空格
        
        return cleaned
      }
      
      // 使用 sheet_to_json 读取数据（与后端保持一致，能更好地处理编码）
      // 这个方法会自动处理编码问题，比逐个单元格读取更可靠
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // 返回数组格式，第一行是表头
        defval: '', // 默认值
        raw: false, // 使用格式化的文本值，而不是原始值
        dateNF: 'yyyy-mm-dd' // 日期格式
      })
      
      console.log('📋 直接从单元格读取的数据（前3行）:', jsonData.slice(0, 3))
      
      if (jsonData.length === 0) {
        message.error('Excel文件中没有数据')
        loading.value = false
        return
      }
      
      // 获取Excel表头（第一行）
      const excelHeadersRow = jsonData[0] || []
      console.log('📋 Excel原始表头（第一行）:', excelHeadersRow)
      
      // 清理表头，去除空格和特殊字符
      const excelHeadersMap = {}
      excelHeadersRow.forEach((header, index) => {
        if (header !== null && header !== undefined && header !== '') {
          const originalHeader = String(header)
          let cleanedHeader = cleanText(originalHeader)
          
          // 如果清理后还有HTML标签或乱码，尝试更彻底的清理
          if (cleanedHeader.includes('/td>') || cleanedHeader.includes('<') || /[\uFFFD]/.test(cleanedHeader)) {
            // 更彻底的清理：移除所有非中文字符、数字、字母、常见标点
            cleanedHeader = cleanedHeader
              .replace(/<[^>]*>/g, '') // 移除HTML标签
              .replace(/\/td>/g, '') // 移除 /td> 标签
              .replace(/[\uFFFD\u0000-\u001F\u007F-\u009F]/g, '') // 移除乱码字符
              .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-_]/g, '') // 只保留中文、英文、数字、空格、横线、下划线
              .trim()
          }
          
          if (cleanedHeader) {
            excelHeadersMap[cleanedHeader] = index
            // 如果清理前后不一致，输出调试信息
            if (cleanedHeader !== originalHeader.trim()) {
              console.log(`表头清理: "${originalHeader}" -> "${cleanedHeader}" (列${index})`)
            }
          }
        }
      })
      console.log('📋 Excel表头映射（清理后）:', excelHeadersMap)
      console.log('📋 期望的字段列表:', excelFixedHeaders)
      
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
      
      console.log('📋 字段匹配结果:')
      matchResults.forEach(result => {
        console.log(`  ${result.status} | 字段: "${result.field}" | Excel列: ${result.excelCol} | Excel表头: "${result.excelHeader || '无'}"`)
      })
      console.log('📋 最终映射表:', finalHeadersMap)
      
      // 使用固定的中文表头生成表格列
      excelHeaders.value = excelFixedHeaders
      columns.value = generateColumnsFromHeaders(excelFixedHeaders)
      
      // 字段映射关系（Excel表头 -> 数据库字段）
      const fieldMap = {
        '来源': 'source',
        '关键词': 'keyword',
        '公司名': 'companyName',
        '店铺链接': 'storeLink',
        '入驻年数': 'yearsInBusiness',
        '主营产品': 'mainProducts',
        '销量': 'sales',
        '销售额': 'salesVolume',
        '热销市场': 'hotMarket',
        '国家': 'country',
        '省份': 'province',
        '城市': 'city',
        '联系人': 'contactPerson',
        '电话': 'phone',
        '手机': 'mobile',
        '传真': 'fax',
        '公司地址': 'companyAddress'
      }
      
      // 转换数据格式：从第二行开始读取数据（第一行是表头）
      const formattedData = jsonData.slice(1) // 跳过第一行表头
        .filter(row => row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')) // 过滤完全空行
        .map((row, rowIndex) => {
          const rowData = {
            id: (rowIndex + 1).toString(), // 使用行号作为ID（仅用于前端显示）
            _rowIndex: rowIndex + 2 // Excel行号（从2开始，因为跳过了第一行表头）
          }
          
          // 简单逻辑：根据前端字段去读取，能匹配就读取，匹配不上就空着
          excelFixedHeaders.forEach((header, colIndex) => {
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
            if (rowIndex === 0 && colIndex < 3) {
              console.log(`  📊 读取字段 "${header}": Excel列${excelColIndex} -> 值: "${cellValue}"`)
            }
            
            // 存储到col_X格式（用于表格显示）
            rowData[`col_${colIndex}`] = cleanText(cellValue)
            // 同时存储字段名（用于数据库导入）
            const fieldName = fieldMap[header]
            if (fieldName) {
              rowData[fieldName] = cleanText(cellValue)
            }
          })
          
          return rowData
        })
      
      console.log(`📊 共解析 ${formattedData.length} 行数据`)
      console.log('📊 第一行数据示例:', formattedData[0])
      console.log('📊 前3行数据:', formattedData.slice(0, 3))
      
      // 更新数据列表
      customerList.value = formattedData
      pagination.total = formattedData.length
      pagination.current = 1
      
      // 设置为Excel展示模式
      isExcelMode.value = true
      
      // 显示成功消息
      const headerInfo = `表头：${excelFixedHeaders.slice(0, 5).join('、')}${excelFixedHeaders.length > 5 ? '...' : ''}`
      message.success(`成功解析Excel文件，共 ${formattedData.length} 条数据，${headerInfo}`)
      
      // 导入到数据库
      try {
        loading.value = true
        const res = await importAlibabaCustomers(file)
        if (res && res.data) {
          const { success, failed, total } = res.data
          if (success > 0) {
            message.success(`数据已成功导入数据库 ${success} 条${failed > 0 ? `，${failed} 条失败` : ''}`)
            // 导入成功后，切换到数据库模式并重新加载数据
            isExcelMode.value = false
            excelHeaders.value = []
            columns.value = generateColumnsFromHeaders(excelFixedHeaders)
            await loadUserList()
          } else if (failed > 0) {
            message.error(`导入失败：所有 ${total} 条数据都未能导入数据库`)
          } else {
            message.warning('导入完成，但没有数据被保存')
          }
        } else {
          message.warning('导入响应格式异常，数据可能未保存')
        }
      } catch (importError) {
        console.error('导入数据库失败:', importError)
        message.error('导入数据库失败：' + (importError.message || '未知错误'))
        // 数据仍在内存中展示，提示用户数据未保存
        message.warning('当前数据仅在前端内存中，刷新页面会丢失，请检查数据库连接后重新导入')
      } finally {
        loading.value = false
      }
    } catch (error) {
      console.error('解析Excel失败:', error)
      message.error('解析Excel失败：' + (error.message || '未知错误'))
      loading.value = false
    }
  } catch (error) {
    console.error('导入失败:', error)
    message.error('导入失败：' + (error.message || '未知错误'))
    loading.value = false
  }
  
  return false // 阻止默认上传行为
}

// 初始化
onMounted(() => {
  loading.value = false
  nextTick(() => {
    setTimeout(() => {
      loadUserList()
    }, 300)
  })
})
</script>

<style scoped>
.customer-management {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.search-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}
</style>


<template>
  <div class="map-data-management">
    <div class="page-header">
      <h2>map数据</h2>
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
        <a-popconfirm
          title="确定要清空所有map数据吗？此操作不可恢复！"
          ok-text="确定"
          cancel-text="取消"
          @confirm="handleClearAll"
        >
          <a-button type="primary" danger>
            <template #icon>
              <DeleteOutlined />
            </template>
            清空数据
          </a-button>
        </a-popconfirm>
      </a-space>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="公司名称">
          <a-input
            v-model:value="searchForm.name"
            placeholder="请输入公司名称"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="联系人电话">
          <a-input
            v-model:value="searchForm.phone"
            placeholder="请输入联系人电话"
            allow-clear
            style="width: 200px"
          />
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

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      row-key="_id"
      @change="handleTableChange"
      :scroll="{ x: 1300 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === '_id'">
          {{ record._id ? String(record._id).slice(-8) : '-' }}
        </template>
        <template v-if="column.key === 'crawledAt'">
          {{ formatDate(record.crawledAt) }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-button type="link" size="small" @click="handleEdit(record)">
              <template #icon>
                <EditOutlined />
              </template>
              编辑
            </a-button>
            <a-popconfirm
              title="确定要删除这条数据吗？"
              @confirm="handleDelete(record._id)"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 查看详情模态框 -->
    <a-modal
      v-model:open="viewModalVisible"
      title="数据详情"
      :width="600"
      :footer="null"
    >
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="公司名称">
          {{ currentRecord.name }}
        </a-descriptions-item>
        <a-descriptions-item label="联系人电话">
          {{ currentRecord.phone }}
        </a-descriptions-item>
        <a-descriptions-item label="地址" :span="2">
          {{ currentRecord.address }}
        </a-descriptions-item>
        <a-descriptions-item label="城市">
          {{ currentRecord.city }}
        </a-descriptions-item>
        <a-descriptions-item label="公司类型">
          {{ currentRecord.category }}
        </a-descriptions-item>
        <a-descriptions-item label="爬取时间" :span="2">
          {{ formatDate(currentRecord.crawledAt) }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">
          {{ currentRecord.remark || '无' }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 编辑数据模态框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑数据"
      :width="600"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
    >
      <a-form
        ref="editFormRef"
        :model="editFormData"
        :rules="editRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="公司名称" name="name">
          <a-input
            v-model:value="editFormData.name"
            placeholder="请输入公司名称"
          />
        </a-form-item>
        <a-form-item label="联系人电话" name="phone">
          <a-input
            v-model:value="editFormData.phone"
            placeholder="请输入联系人电话"
          />
        </a-form-item>
        <a-form-item label="地址" name="address">
          <a-input
            v-model:value="editFormData.address"
            placeholder="请输入地址"
          />
        </a-form-item>
        <a-form-item label="城市" name="city">
          <a-input
            v-model:value="editFormData.city"
            placeholder="请输入城市"
          />
        </a-form-item>
        <a-form-item label="公司类型" name="category">
          <a-input
            v-model:value="editFormData.category"
            placeholder="请输入公司类型"
          />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="editFormData.remark"
            placeholder="请输入备注"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import {
  getTradeCompanyList,
  getTradeCompanyById,
  updateTradeCompany,
  importTradeCompanies,
  deleteTradeCompany,
  deleteTradeCompanies,
  clearAllTradeCompanies
} from '@/api/tradeCompany'
import { formatDate } from '@/utils/format'

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: '_id',
    key: '_id',
    width: 120,
    fixed: 'left'
  },
  {
    title: '公司名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '联系人电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 150
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    width: 200,
    ellipsis: true
  },
  {
    title: '城市',
    dataIndex: 'city',
    key: 'city',
    width: 120
  },
  {
    title: '公司类型',
    dataIndex: 'category',
    key: 'category',
    width: 120
  },
  {
    title: '爬取时间',
    dataIndex: 'crawledAt',
    key: 'crawledAt',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right'
  }
]

// 响应式数据
const loading = ref(false)
const dataList = ref([])
const viewModalVisible = ref(false)
const editModalVisible = ref(false)
const currentRecord = ref({})
const selectedRowKeys = ref([])
const editFormRef = ref(null)

// 编辑表单数据
const editFormData = reactive({
  _id: null,
  name: '',
  phone: '',
  address: '',
  city: '',
  category: '',
  remark: ''
})

// 编辑表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ]
}

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条`,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// 加载数据列表
const loadDataList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const res = await getTradeCompanyList(params)
    if (res && res.data) {
      dataList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    message.error('加载数据失败：' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadDataList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.phone = ''
  pagination.current = 1
  loadDataList()
}

// 表格变化处理
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadDataList()
}

// 选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 导入Excel
const handleImport = async (file) => {
  try {
    // 验证文件格式
    const fileName = file.name || ''
    const fileExtension = fileName.split('.').pop()?.toLowerCase()

    if (!fileExtension || !['xlsx', 'xls', 'xltx'].includes(fileExtension)) {
      message.error('只支持Excel文件格式（.xlsx、.xls、.xltx）')
      return false
    }

    // 验证文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      message.error('文件大小不能超过10MB')
      return false
    }

    loading.value = true
    console.log('开始导入Excel文件:', fileName)

    const res = await importTradeCompanies(file)
    console.log('导入响应:', res)

    if (res && res.data) {
      const { success, failed, total, successList, failedList } = res.data

      if (failed > 0) {
        // 如果有失败的记录，显示详细信息
        let errorMsg = `导入完成：成功 ${success} 条，失败 ${failed} 条\n\n失败详情：\n`
        failedList.forEach(item => {
          errorMsg += `第${item.row}行：${item.error}\n`
        })
        message.warning(errorMsg, 10)
      } else if (success > 0) {
        message.success(`成功导入 ${success} 条数据`)
      } else {
        message.warning('导入完成，但没有数据被保存')
      }

      // 重置搜索条件和分页
      searchForm.name = ''
      searchForm.phone = ''
      pagination.current = 1

      // 刷新列表
      await loadDataList()
    } else {
      message.error('导入响应格式异常，请检查服务器日志')
      console.error('导入响应异常:', res)
    }
  } catch (error) {
    console.error('导入失败:', error)
    let errorMessage = '未知错误'
    if (error.response) {
      errorMessage = error.response.data?.message || error.response.statusText || `服务器错误 (${error.response.status})`
    } else if (error.request) {
      errorMessage = '无法连接到服务器，请检查后端服务是否运行'
    } else {
      errorMessage = error.message || '请求配置错误'
    }
    message.error('导入失败：' + errorMessage)
  } finally {
    loading.value = false
  }

  return false // 阻止默认上传行为
}

// 查看详情
const handleView = (record) => {
  currentRecord.value = record
  viewModalVisible.value = true
}

// 编辑数据
const handleEdit = (record) => {
  editFormData._id = record._id
  editFormData.name = record.name || ''
  editFormData.phone = record.phone || ''
  editFormData.address = record.address || ''
  editFormData.city = record.city || ''
  editFormData.category = record.category || ''
  editFormData.remark = record.remark || ''
  editModalVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  try {
    await editFormRef.value.validate()
    
    const updateData = {
      name: editFormData.name,
      phone: editFormData.phone,
      address: editFormData.address,
      city: editFormData.city,
      category: editFormData.category,
      remark: editFormData.remark
    }
    
    await updateTradeCompany(editFormData._id, updateData)
    message.success('更新成功')
    editModalVisible.value = false
    resetEditForm()
    loadDataList()
  } catch (error) {
    if (error.errorFields) {
      return // 表单验证失败
    }
    console.error('更新失败:', error)
    message.error('更新失败：' + (error.response?.data?.message || error.message))
  }
}

// 取消编辑
const handleEditCancel = () => {
  editModalVisible.value = false
  resetEditForm()
}

// 重置编辑表单
const resetEditForm = () => {
  editFormData._id = null
  editFormData.name = ''
  editFormData.phone = ''
  editFormData.address = ''
  editFormData.city = ''
  editFormData.category = ''
  editFormData.remark = ''
  editFormRef.value?.resetFields()
}

// 删除单条数据
const handleDelete = async (id) => {
  try {
    await deleteTradeCompany(id)
    message.success('删除成功')
    loadDataList()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败：' + (error.response?.data?.message || error.message))
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据')
    return
  }

  try {
    await deleteTradeCompanies(selectedRowKeys.value)
    message.success('批量删除成功')
    selectedRowKeys.value = []
    loadDataList()
  } catch (error) {
    console.error('批量删除失败:', error)
    message.error('批量删除失败：' + (error.response?.data?.message || error.message))
  }
}

// 清空所有数据
const handleClearAll = async () => {
  try {
    const res = await clearAllTradeCompanies()
    if (res && res.code === 200) {
      message.success(`成功清空 ${res.data.deletedCount} 条数据`)
      selectedRowKeys.value = []
      loadDataList()
    } else {
      message.error(res?.message || '清空失败')
    }
  } catch (error) {
    console.error('清空数据失败:', error)
    message.error('清空失败：' + (error.response?.data?.message || error.message))
  }
}

// 初始化
onMounted(() => {
  loadDataList()
})
</script>

<style scoped>
.map-data-management {
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

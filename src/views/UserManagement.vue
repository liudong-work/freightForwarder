<template>
  <div class="customer-management">
    <div class="page-header">
      <h2>客户管理</h2>
      <a-space>
        <a-upload
          :before-upload="handleImport"
          :show-upload-list="false"
          accept=".xlsx,.xls"
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
        <a-button type="primary" @click="handleAdd">
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

    <!-- 客户表格 -->
    <a-table
      :columns="columns"
      :data-source="customerList"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      row-key="id"
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
            <a-button type="link" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button type="link" size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-popconfirm
              title="确定要删除这个客户吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.id)"
            >
              <a-button type="link" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
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
        <a-descriptions-item label="客户名称">
          {{ currentUser.username }}
        </a-descriptions-item>
        <a-descriptions-item label="电话">
          {{ currentUser.phone }}
        </a-descriptions-item>
        <a-descriptions-item label="公司名称">
          {{ currentUser.company }}
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
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { getUserList, createUser, updateUser, deleteUser, deleteUsers, importUsers } from '@/api/user'
import { formatDate } from '@/utils/format'

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '客户名称',
    dataIndex: 'username',
    key: 'username',
    width: 150
  },
  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 150
  },
  {
    title: '公司名称',
    dataIndex: 'company',
    key: 'company',
    width: 200
  },
  {
    title: '合作状态',
    key: 'status',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

// 响应式数据
const loading = ref(false)
const customerList = ref([])
const modalVisible = ref(false)
const viewModalVisible = ref(false)
const modalTitle = ref('新增客户')
const formRef = ref(null)
const currentUser = ref({})
const selectedRowKeys = ref([]) // 选中的行keys

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
  console.log('开始加载数据，设置 loading = true')
  loading.value = true
  
  // 设置超时保护，确保 loading 不会一直显示
  let timeoutId = setTimeout(() => {
    console.warn('数据加载超时，强制关闭 loading')
    loading.value = false
  }, 5000) // 5秒超时
  
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    console.log('发送请求:', params)
    const res = await getUserList(params)
    console.log('收到响应:', res)
    
    // 清除超时定时器
    clearTimeout(timeoutId)
    
    // 立即关闭 loading
    console.log('关闭 loading')
    loading.value = false
    
    if (res && res.data) {
      customerList.value = res.data.list || []
      pagination.total = res.data.total || 0
    } else {
      customerList.value = []
      pagination.total = 0
    }
    
    // 清空选中项（因为数据已更新）
    selectedRowKeys.value = []
  } catch (error) {
    // 清除超时定时器
    clearTimeout(timeoutId)
    
    // 确保 loading 状态被关闭
    console.error('加载失败，关闭 loading:', error)
    loading.value = false
    customerList.value = []
    pagination.total = 0
    selectedRowKeys.value = []
  }
}

// 监听 loading 状态变化，用于调试
watch(loading, (newVal) => {
  console.log('loading 状态变化:', newVal)
})

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
  loadUserList()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadUserList()
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
const handleDelete = async (id) => {
  try {
    await deleteUser(id)
    message.success('删除成功')
    // 如果删除的是选中的项，从选中列表中移除
    const index = selectedRowKeys.value.indexOf(id)
    if (index > -1) {
      selectedRowKeys.value.splice(index, 1)
    }
    loadUserList()
  } catch (error) {
    message.error('删除失败')
  }
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的用户')
    return
  }
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个客户吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        loading.value = true
        const res = await deleteUsers(selectedRowKeys.value)
        message.success(res.message || `成功删除 ${selectedRowKeys.value.length} 个客户`)
        selectedRowKeys.value = []
        loadUserList()
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
    // 验证至少需要客户名称或公司名称之一
    if (!formData.username && !formData.company) {
      message.error('至少需要填写客户名称或公司名称之一')
      return
    }
    
    await formRef.value.validate()
    if (formData.id) {
      await updateUser(formData.id, formData)
      message.success('更新成功')
    } else {
      await createUser(formData)
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

// Excel导入
const handleImport = async (file) => {
  try {
    loading.value = true
    const res = await importUsers(file)
    
    if (res && res.data) {
      const { success, failed, total, successList, failedList } = res.data
      
      if (failed > 0) {
        // 如果有失败的记录，显示详细信息
        let errorMsg = `导入完成：成功 ${success} 条，失败 ${failed} 条\n\n失败详情：\n`
        failedList.forEach(item => {
          errorMsg += `第${item.row}行：${item.error}\n`
        })
        message.warning(errorMsg, 10)
      } else {
        message.success(`成功导入 ${success} 条用户数据`)
      }
      
      // 刷新列表
      loadUserList()
    }
  } catch (error) {
    message.error('导入失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
  
  // 阻止默认上传行为
  return false
}

// 初始化
onMounted(() => {
  console.log('组件挂载，设置 loading = false')
  // 确保初始 loading 状态为 false
  loading.value = false
  // 使用 nextTick 确保 DOM 渲染完成后再加载数据
  nextTick(() => {
    // 延迟加载，避免页面闪烁
    setTimeout(() => {
      console.log('开始初始加载')
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


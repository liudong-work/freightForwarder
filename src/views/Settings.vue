<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="sub-accounts" tab="子账号管理">
        <div class="sub-accounts-section">
          <div class="section-header">
            <h3>子账号列表</h3>
            <a-button type="primary" @click="handleAddSubAccount">
              <template #icon>
                <PlusOutlined />
              </template>
              创建子账号
            </a-button>
          </div>

          <a-table
            :columns="columns"
            :data-source="subAccountList"
            :loading="loading"
            :pagination="pagination"
            @change="handleTableChange"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-popconfirm
                    title="确定要删除这个子账号吗？"
                    @confirm="handleDelete(record.id)"
                  >
                    <a-button type="link" danger size="small">删除</a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 创建子账号弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitting"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="formData.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="密码" name="password">
          <a-input-password v-model:value="formData.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="电话" name="phone">
          <a-input v-model:value="formData.phone" placeholder="请输入电话" />
        </a-form-item>
        <a-form-item label="公司" name="company">
          <a-input v-model:value="formData.company" placeholder="请输入公司名称" />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="请输入备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { getSubAccounts, createSubAccount, deleteSubAccount } from '@/api/user'

const activeTab = ref('sub-accounts')
const loading = ref(false)
const submitting = ref(false)
const modalVisible = ref(false)
const modalTitle = ref('创建子账号')
const subAccountList = ref([])
const formRef = ref()

const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone'
  },
  {
    title: '公司',
    dataIndex: 'company',
    key: 'company'
  },
  {
    title: '状态',
    key: 'status',
    width: 100
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
    width: 100
  }
]

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
})

const formData = reactive({
  username: '',
  password: '',
  phone: '',
  company: '',
  remark: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 加载子账号列表
const loadSubAccounts = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }
    const res = await getSubAccounts(params)
    if (res && res.data) {
      subAccountList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    message.error('加载子账号列表失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadSubAccounts()
}

// 新增子账号
const handleAddSubAccount = () => {
  modalTitle.value = '创建子账号'
  resetForm()
  modalVisible.value = true
}

// 重置表单
const resetForm = () => {
  formData.username = ''
  formData.password = ''
  formData.phone = ''
  formData.company = ''
  formData.remark = ''
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const res = await createSubAccount(formData)
    if (res && res.code === 200) {
      message.success('创建子账号成功')
      modalVisible.value = false
      resetForm()
      loadSubAccounts()
    }
  } catch (error) {
    if (error.errorFields) {
      return // 表单验证失败
    }
    message.error('创建子账号失败：' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 删除子账号
const handleDelete = async (id) => {
  try {
    const res = await deleteSubAccount(id)
    if (res && res.code === 200) {
      message.success('删除子账号成功')
      loadSubAccounts()
    }
  } catch (error) {
    message.error('删除子账号失败：' + (error.message || '未知错误'))
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '启用',
    inactive: '禁用',
    pending: '未合作'
  }
  return statusMap[status] || status
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    active: 'green',
    inactive: 'red',
    pending: 'orange'
  }
  return colorMap[status] || 'default'
}

// 初始化
onMounted(() => {
  loadSubAccounts()
})
</script>

<style scoped>
.settings-page {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.sub-accounts-section {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
</style>

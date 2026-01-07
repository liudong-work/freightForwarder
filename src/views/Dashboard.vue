<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>仪表板</h2>
    </div>
    
    <div class="dashboard-content">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="总客户数"
              :value="stats.totalCustomers || 0"
              :value-style="{ color: '#3f8600' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="亚马逊客户"
              :value="stats.amazonCustomers || 0"
              :value-style="{ color: '#1890ff' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="阿里巴巴客户"
              :value="stats.alibabaCustomers || 0"
              :value-style="{ color: '#722ed1' }"
            />
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card>
            <a-statistic
              title="营销号客户"
              :value="stats.marketingAccountCustomers || 0"
              :value-style="{ color: '#eb2f96' }"
            />
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  totalCustomers: 0,
  amazonCustomers: 0,
  alibabaCustomers: 0,
  marketingAccountCustomers: 0
})

// 加载统计数据
const loadStats = async () => {
  // TODO: 从API加载统计数据
  // 暂时使用占位数据
  stats.value = {
    totalCustomers: 0,
    amazonCustomers: 0,
    alibabaCustomers: 0,
    marketingAccountCustomers: 0
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
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

.dashboard-content {
  margin-top: 24px;
}
</style>


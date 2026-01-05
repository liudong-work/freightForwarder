<template>
  <a-layout class="layout">
    <a-layout-sider v-model:collapsed="collapsed" :width="200" class="sider">
      <div class="logo">
        <GlobalOutlined />
        <span v-if="!collapsed" class="logo-text">管理系统</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        @click="handleMenuClick"
      >
        <a-menu-item key="/dashboard">
          <template #icon>
            <DashboardOutlined />
          </template>
          <span>仪表板</span>
        </a-menu-item>
        <a-menu-item key="/customers">
          <template #icon>
            <TeamOutlined />
          </template>
          <span>客户管理</span>
        </a-menu-item>
        <a-sub-menu key="/platform-customers">
          <template #icon>
            <ShopOutlined />
          </template>
          <template #title>第三方平台客户管理</template>
          <a-menu-item key="/amazon-customers">
            <span>亚马逊客户管理</span>
          </a-menu-item>
          <a-menu-item key="/alibaba-customers">
            <span>阿里巴巴客户管理</span>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="/orders">
          <template #icon>
            <FileTextOutlined />
          </template>
          <span>订单管理</span>
        </a-menu-item>
        <a-menu-item key="/logistics">
          <template #icon>
            <CarOutlined />
          </template>
          <span>物流管理</span>
        </a-menu-item>
        <a-menu-item v-if="authStore.user?.role === 'admin' || !authStore.user?.role" key="/settings">
          <template #icon>
            <SettingOutlined />
          </template>
          <span>系统设置</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-content">
          <a-button
            type="text"
            class="trigger"
            @click="collapsed = !collapsed"
          >
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
          <div class="user-info">
            <a-dropdown>
              <a class="user-dropdown" @click.prevent>
                <UserOutlined />
                <span class="username">{{ authStore.user?.username || '用户' }}</span>
                <DownOutlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <UserOutlined />
                    <span>{{ authStore.user?.email }}</span>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="handleLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
      <a-layout-footer class="footer">
        国际物流客户管理系统 ©2024
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  GlobalOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  FileTextOutlined,
  CarOutlined,
  SettingOutlined,
  DashboardOutlined,
  ShopOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)
const selectedKeys = ref([])
const openKeys = ref([])

// 监听路由变化，更新选中菜单
watch(
  () => route.path,
  (path) => {
    // 将 /users 映射到 /customers
    if (path === '/users') {
      selectedKeys.value = ['/customers']
    } else if (path === '/amazon-customers' || path === '/alibaba-customers') {
      selectedKeys.value = [path]
      openKeys.value = ['/platform-customers']
    } else {
      selectedKeys.value = [path]
    }
  },
  { immediate: true }
)

// 菜单点击处理
const handleMenuClick = ({ key }) => {
  const menuMap = {
    '/dashboard': '仪表板',
    '/customers': '客户管理',
    '/amazon-customers': '亚马逊客户管理',
    '/alibaba-customers': '阿里巴巴客户管理',
    '/orders': '订单管理',
    '/logistics': '物流管理',
    '/settings': '系统设置'
  }
  
  if (key === '/customers') {
    router.push('/users')
  } else if (key === '/amazon-customers') {
    router.push('/amazon-customers')
  } else if (key === '/alibaba-customers') {
    router.push('/alibaba-customers')
  } else if (key === '/settings') {
    router.push('/settings')
  } else {
    // 其他菜单项暂时跳转到客户管理页面
    router.push('/users')
    message.info(`${menuMap[key] || '功能'}开发中...`)
  }
}

const handleLogout = () => {
  authStore.clearAuth()
  message.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.sider {
  overflow: auto;
  height: 100vh;
  position: fixed !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  z-index: 100;
  background: #001529 !important;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo :deep(.anticon) {
  font-size: 24px;
}

.logo-text {
  color: #fff;
  white-space: nowrap;
}

.header {
  background: #fff;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: 200px;
  transition: margin-left 0.2s;
}

.layout :deep(.ant-layout-sider-collapsed) ~ .ant-layout .header {
  margin-left: 80px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}

.trigger {
  font-size: 18px;
  padding: 0 12px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.user-info {
  color: #262626;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #262626;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f5f5;
}

.username {
  color: #262626;
}

.content {
  margin-left: 200px;
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px - 70px);
  transition: margin-left 0.2s;
}

.layout :deep(.ant-layout-sider-collapsed) ~ .ant-layout .content {
  margin-left: 80px;
}

.content-wrapper {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  min-height: 100%;
}

.footer {
  margin-left: 200px;
  text-align: center;
  background: #fff;
  padding: 16px 0;
  transition: margin-left 0.2s;
}

.layout :deep(.ant-layout-sider-collapsed) ~ .ant-layout .footer {
  margin-left: 80px;
}
</style>


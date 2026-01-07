import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/BasicLayout.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import AmazonCustomerManagement from '@/views/AmazonCustomerManagement.vue'
import AlibabaCustomerManagement from '@/views/AlibabaCustomerManagement.vue'
import MarketingAccountCustomerManagement from '@/views/MarketingAccountCustomerManagement.vue'
import MapData from '@/views/MapData.vue'
import Settings from '@/views/Settings.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '仪表板',
          requiresAuth: true
        }
      },
      {
        path: '/amazon-customers',
        name: 'AmazonCustomerManagement',
        component: AmazonCustomerManagement,
        meta: {
          title: '亚马逊客户管理',
          requiresAuth: true
        }
      },
      {
        path: '/alibaba-customers',
        name: 'AlibabaCustomerManagement',
        component: AlibabaCustomerManagement,
        meta: {
          title: '阿里巴巴客户管理',
          requiresAuth: true
        }
      },
      {
        path: '/marketing-account-customers',
        name: 'MarketingAccountCustomerManagement',
        component: MarketingAccountCustomerManagement,
        meta: {
          title: '营销号客户',
          requiresAuth: true
        }
      },
      {
        path: '/map-data',
        name: 'MapData',
        component: MapData,
        meta: {
          title: 'map数据',
          requiresAuth: true
        }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: Settings,
        meta: {
          title: '系统设置',
          requiresAuth: true
        }
      },
      {
        path: '/users',
        redirect: '/dashboard'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated()) {
      next()
    } else {
      next('/login')
    }
  } else {
    if (to.path === '/login' && authStore.isAuthenticated()) {
      next('/dashboard') // 跳转到仪表板页面
    } else {
      next()
    }
  }
})

export default router


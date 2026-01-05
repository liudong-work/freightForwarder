import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/BasicLayout.vue'
import Login from '@/views/Login.vue'
import UserManagement from '@/views/UserManagement.vue'
import AmazonCustomerManagement from '@/views/AmazonCustomerManagement.vue'
import AlibabaCustomerManagement from '@/views/AlibabaCustomerManagement.vue'
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
    redirect: '/users',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/users',
        name: 'UserManagement',
        component: UserManagement,
        meta: {
          title: '客户管理',
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
        path: '/settings',
        name: 'Settings',
        component: Settings,
        meta: {
          title: '系统设置',
          requiresAuth: true
        }
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
      next('/users') // 跳转到客户管理页面
    } else {
      next()
    }
  }
})

export default router


import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: () => import('@/views/Login/LoginPage.vue') },
    {
      path: '/',
      component: () => import('@/views/Layout/LayoutPage.vue'),
      redirect: '/word/wordlist',
      children: [
        {
          path: '/word/wordlist',
          component: () => import('@/views/Word/WordList.vue')
        },
        {
          path: '/word/wordtest',
          component: () => import('@/views/Word/WordTest.vue')
        },
        {
          path: '/empty',
          component: () => import('@/views/Layout/EmptyPage.vue')
        },
        {
          path: '/word/testresult',
          component: () => import('@/views/Word/TestResult.vue')
        }
      ]
    }
  ]
})

// Access interception
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!userStore.token && to.path !== '/login') {
    // ElMessage.error('Invalid indentity. Please log in again')
    return '/login'
  }
})

export default router

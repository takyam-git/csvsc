import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../views/RootView.vue')
    },
    {
      path: '/concat',
      component: () => import('../views/ConcatView.vue')
    },
    {
      path: '/edit',
      component: () => import('../views/EditView.vue')
    }
  ]
})

export default router

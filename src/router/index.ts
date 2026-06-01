import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/lock'
  },
  {
    path: '/lock',
    name: 'Lock',
    component: () => import('@/views/LockScreen.vue')
  },
  {
    path: '/setup',
    name: 'Setup',
    component: () => import('@/views/SetupScreen.vue')
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('@/views/MainScreen.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'domains',
        name: 'Domains',
        component: () => import('@/views/DomainList.vue')
      },
      {
        path: 'domain/:id',
        name: 'DomainDetail',
        component: () => import('@/views/DomainDetail.vue')
      },
      {
        path: 'services',
        name: 'Services',
        component: () => import('@/views/Services.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

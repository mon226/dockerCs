import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/shape',
      name: 'shape',
      component: () => import('../views/Shape.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/Test.vue')
    },
    {
      path: '/network',
      name: 'network',
      component: () => import('../views/Network.vue')
    },
    {
      path: '/opm',
      name: 'opm',
      component: () => import('../views/OPM.vue')
    },
  ]
})

export default router;

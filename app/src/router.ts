import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/BuilderView.vue'),
    },
    {
      path: '/manage/brands',
      component: () => import('./views/BrandManagerView.vue'),
    },
    {
      path: '/manage/brands/:id',
      component: () => import('./views/BrandManagerView.vue'),
    },
    {
      path: '/manage/templates',
      component: () => import('./views/TemplateManagerView.vue'),
    },
    {
      path: '/manage/layouts',
      component: () => import('./views/LayoutManagerView.vue'),
    },
    {
      path: '/bulk',
      component: () => import('./views/BulkCreateView.vue'),
    },
    {
      path: '/d/:id',
      component: () => import('./views/DesignView.vue'),
    },
  ],
})

export default router

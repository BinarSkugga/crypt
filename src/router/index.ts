import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import app from "@/app.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'App',
    component: app
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

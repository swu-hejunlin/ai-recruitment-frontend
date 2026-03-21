/**
 * 路由配置文件
 * 定义应用的所有路由及导航守卫
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import type { RouteMeta as RouteMetaType } from '@/types';

// ==================== 路由定义 ====================
/**
 * 首页组件（占位，后续会替换）
 */
const Home = () => import('@/views/Home.vue');

/**
 * 登录页面组件
 */
const Login = () => import('@/views/Login.vue');

/**
 * 公共路由（无需登录即可访问）
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false
    } as RouteMetaType
  }
];

/**
 * 异步路由（需要登录才能访问）
 * 根据用户角色动态加载
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: true,
      roles: [1, 2] // 求职者和企业HR都可访问
    } as RouteMetaType
  },
  // 后续会添加更多路由，如：
  // - 求职者专属路由（简历管理、职位投递等）
  // - 企业HR专属路由（岗位管理、简历筛选等）
  // - AI功能路由（简历解析、智能匹配等）
];

// ==================== 创建路由实例 ====================
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...asyncRoutes]
});

// ==================== 路由守卫 ====================
/**
 * 全局前置守卫
 * 用于权限控制和路由拦截
 */
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 智能招聘平台`;
  }

  const userStore = useUserStore();
  const isLogin = userStore.isLogin;

  // 判断路由是否需要登录
  const requiresAuth = (to.meta as RouteMetaType)?.requiresAuth !== false;

  // 如果路由需要登录但用户未登录，跳转到登录页
  if (requiresAuth && !isLogin) {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 记录目标路由，登录后跳转
    });
    return;
  }

  // 如果用户已登录且访问登录页，跳转到首页
  if (isLogin && to.path === '/login') {
    next('/');
    return;
  }

  // TODO: 后续可添加角色权限校验
  // 例如：企业HR不能访问求职者专属路由等

  next();
});

/**
 * 全局后置钩子
 * 用于处理路由跳转后的逻辑
 */
router.afterEach((to) => {
  console.log(`[路由跳转] ${to.path}`);
});

// ==================== 导出路由 ====================
export default router;

/**
 * 路由配置文件
 * 定义应用的所有路由及导航守卫
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

// ==================== 路由定义 ====================
/**
 * 首页组件（占位，后续会替换）
 */
import Home from '@/views/Home.vue';

/**
 * 登录页面组件
 */
import Login from '@/views/Login.vue';

/**
 * 求职者信息管理页面
 */
import JobSeekerProfile from '@/views/JobSeekerProfile.vue';

/**
 * 企业信息管理页面
 */
import CompanyProfile from '@/views/CompanyProfile.vue';

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
    }
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
    }
  },
  {
    path: '/profile',
    name: 'JobSeekerProfile',
    component: JobSeekerProfile,
    meta: {
      title: '我的简历',
      requiresAuth: true,
      roles: [1] // 仅求职者
    }
  },
  {
    path: '/company',
    name: 'CompanyProfile',
    component: CompanyProfile,
    meta: {
      title: '企业管理',
      requiresAuth: true,
      roles: [2] // 仅企业HR
    }
  }
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
router.beforeEach((to, _from) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 智能招聘平台`;
  }

  const userStore = useUserStore();
  const isLogin = userStore.isLogin;

  // 判断路由是否需要登录
  const requiresAuth = (to.meta as any)?.requiresAuth !== false;

  // 如果路由需要登录但用户未登录，跳转到登录页
  if (requiresAuth && !isLogin) {
    return {
      path: '/login',
      query: { redirect: to.fullPath } // 记录目标路由，登录后跳转
    };
  }

  // 如果用户已登录且访问登录页，跳转到首页
  if (isLogin && to.path === '/login') {
    return '/';
  }

  // 角色权限校验
  if (requiresAuth && isLogin) {
    const userRole = userStore.userInfo?.role;
    const routeRoles = (to.meta as any)?.roles as number[] | undefined;
    
    // 如果路由有角色限制，检查用户角色
    if (routeRoles && routeRoles.length > 0) {
      if (!userRole || !routeRoles.includes(userRole)) {
        console.warn(`路由权限不足: 用户角色 ${userRole} 无法访问 ${to.path}`);
        
        // 根据用户角色跳转到相应首页
        if (userRole === 1) {
          return '/';
        } else if (userRole === 2) {
          return '/';
        } else {
          // 角色未识别，跳转到登录页
          return {
            path: '/login',
            query: { redirect: to.fullPath }
          };
        }
      }
    }
  }

  // 正常通过
  return true;
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

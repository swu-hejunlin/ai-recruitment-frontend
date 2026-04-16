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
 * 求职者职位发现页面
 */
import JobDiscovery from '@/views/JobDiscovery.vue';

/**
 * BOSS职位管理页面
 */
import BossPositionManager from '@/views/BossPositionManager.vue';

/**
 * BOSS查看投递记录页面
 */
import BossApplications from '@/views/BossApplications.vue';

/**
 * 求职者查看投递记录页面
 */
import SeekerApplications from '@/views/SeekerApplications.vue';

/**
 * 公司详情页面
 */
import CompanyDetail from '@/views/CompanyDetail.vue';

/**
 * BOSS面试管理页面
 */
import BossInterviewManager from '@/views/BossInterviewManager.vue';

/**
 * 求职者面试列表页面
 */
import SeekerInterviewList from '@/views/SeekerInterviewList.vue';

/**
 * 收藏管理页面
 */
import FavoriteManager from '@/views/FavoriteManager.vue';

/**
 * BOSS职位管理页面（暂用替代方案，实际可以创建单独页面）
 * 我们直接在CompanyProfile中包含职位管理功能
 */

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
  },
  {
    path: '/company/:id(\\d+)',
    name: 'CompanyDetail',
    component: CompanyDetail,
    meta: {
      title: '公司详情',
      requiresAuth: false // 无需登录即可查看
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
  },
  {
    path: '/discover',
    name: 'JobDiscovery',
    component: JobDiscovery,
    meta: {
      title: '发现职位',
      requiresAuth: true,
      roles: [1] // 仅求职者
    }
  },
  {
    path: '/boss/positions',
    name: 'BossPositionManager',
    component: BossPositionManager,
    meta: {
      title: '职位管理',
      requiresAuth: true,
      roles: [2] // 仅企业HR
    }
  },
  {
    path: '/boss/applications',
    name: 'BossApplications',
    component: BossApplications,
    meta: {
      title: '投递管理',
      requiresAuth: true,
      roles: [2] // 仅企业HR
    }
  },
  {
    path: '/applications',
    name: 'SeekerApplications',
    component: SeekerApplications,
    meta: {
      title: '我的投递',
      requiresAuth: true,
      roles: [1] // 仅求职者
    }
  },
  {
    path: '/boss/interviews',
    name: 'BossInterviewManager',
    component: BossInterviewManager,
    meta: {
      title: '面试管理',
      requiresAuth: true,
      roles: [2] // 仅企业HR
    }
  },
  {
    path: '/interviews',
    name: 'SeekerInterviewList',
    component: SeekerInterviewList,
    meta: {
      title: '我的面试',
      requiresAuth: true,
      roles: [1] // 仅求职者
    }
  },
  {
    path: '/favorites',
    name: 'FavoriteManager',
    component: FavoriteManager,
    meta: {
      title: '我的收藏',
      requiresAuth: true,
      roles: [1, 2] // 求职者和企业HR都可访问
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
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} - 智能招聘平台`;
  }

  const userStore = useUserStore();
  const isLogin = userStore.isLogin;

  // 记录关键调试信息但不频繁打印
  if (to.path !== '/' && to.path !== '/login') {
    console.log(`[路由] 访问 ${to.path}, isLogin: ${isLogin}`);
  }
  
  // 特别关注/profile路由的访问
  if (to.path === '/profile') {
    console.log(`[路由/profile] 访问我的简历页面`);
    console.log(`[路由/profile] store状态:`, {
      isLogin,
      token: userStore.token ? userStore.token.substring(0, 30) + '...' : null,
      userInfo: userStore.userInfo,
      userRole: userStore.userInfo?.role
    });
  }

  // 判断路由是否需要登录
  const requiresAuth = (to.meta as any)?.requiresAuth !== false;

  // 如果路由需要登录但用户未登录，强制跳转到登录页
  if (requiresAuth && !isLogin) {
    console.log(`[路由] 用户未登录，强制跳转到登录页`);
    return {
      path: '/login',
      query: { redirect: to.fullPath }
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

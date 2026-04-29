import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const Login = () => import('@/views/Login.vue');
const Home = () => import('@/views/Home.vue');
const JobSeekerProfile = () => import('@/views/JobSeekerProfile.vue');
const CompanyProfile = () => import('@/views/CompanyProfile.vue');
const JobFinder = () => import('@/views/JobFinder.vue');
const BossPositionManager = () => import('@/views/BossPositionManager.vue');
const BossApplications = () => import('@/views/BossApplications.vue');
const SeekerApplications = () => import('@/views/SeekerApplications.vue');
const CompanyDetail = () => import('@/views/CompanyDetail.vue');
const BossInterviewManager = () => import('@/views/BossInterviewManager.vue');
const TalentDiscovery = () => import('@/views/TalentDiscovery.vue');
const SeekerInterviewList = () => import('@/views/SeekerInterviewList.vue');
const FavoriteManager = () => import('@/views/FavoriteManager.vue');
const ResumeAnalyzer = () => import('@/views/ResumeAnalyzer.vue');
const Statistics = () => import('@/views/Statistics.vue');
const MockInterview = () => import('@/views/mock-interview/MockInterview.vue');
const RealInterview = () => import('@/views/mock-interview/RealInterview.vue');

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/company/:id(\\d+)',
    name: 'CompanyDetail',
    component: CompanyDetail,
    meta: { title: '公司详情', requiresAuth: false }
  }
];

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页', requiresAuth: true, roles: [1, 2] }
  },
  {
    path: '/profile',
    name: 'JobSeekerProfile',
    component: JobSeekerProfile,
    meta: { title: '我的简历', requiresAuth: true, roles: [1] }
  },
  {
    path: '/company',
    name: 'CompanyProfile',
    component: CompanyProfile,
    meta: { title: '企业管理', requiresAuth: true, roles: [2] }
  },
  {
    path: '/discover',
    name: 'JobFinder',
    component: JobFinder,
    meta: { title: '岗位发现', requiresAuth: true, roles: [1] }
  },
  {
    path: '/boss/positions',
    name: 'BossPositionManager',
    component: BossPositionManager,
    meta: { title: '职位管理', requiresAuth: true, roles: [2] }
  },
  {
    path: '/boss/applications',
    name: 'BossApplications',
    component: BossApplications,
    meta: { title: '投递管理', requiresAuth: true, roles: [2] }
  },
  {
    path: '/applications',
    name: 'SeekerApplications',
    component: SeekerApplications,
    meta: { title: '我的投递', requiresAuth: true, roles: [1] }
  },
  {
    path: '/boss/interviews',
    name: 'BossInterviewManager',
    component: BossInterviewManager,
    meta: { title: '面试管理', requiresAuth: true, roles: [2] }
  },
  {
    path: '/boss/talent-discovery',
    name: 'TalentDiscovery',
    component: TalentDiscovery,
    meta: { title: '牛人发现', requiresAuth: true, roles: [2] }
  },
  {
    path: '/interviews',
    name: 'SeekerInterviewList',
    component: SeekerInterviewList,
    meta: { title: '我的面试', requiresAuth: true, roles: [1] }
  },
  {
    path: '/favorites',
    name: 'FavoriteManager',
    component: FavoriteManager,
    meta: { title: '我的收藏', requiresAuth: true, roles: [1, 2] }
  },
  {
    path: '/resume-analyzer',
    name: 'ResumeAnalyzer',
    component: ResumeAnalyzer,
    meta: { title: '简历智能分析', requiresAuth: true, roles: [1] }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { title: '数据统计', requiresAuth: true, roles: [1, 2] }
  },
  {
    path: '/mock-interview',
    name: 'MockInterview',
    component: MockInterview,
    meta: { title: '模拟面试', requiresAuth: true, roles: [1] }
  },
  {
    path: '/real-interview',
    name: 'RealInterview',
    component: RealInterview,
    meta: { title: 'AI面试', requiresAuth: true, roles: [1] }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...asyncRoutes]
});

router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 智能招聘平台`;
  }

  const userStore = useUserStore();
  const isLogin = userStore.isLogin;
  const requiresAuth = (to.meta as Record<string, unknown>)?.requiresAuth !== false;

  if (requiresAuth && !isLogin) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (isLogin && to.path === '/login') {
    return '/';
  }

  if (requiresAuth && isLogin) {
    const userRole = userStore.userInfo?.role;
    const routeRoles = (to.meta as Record<string, unknown>)?.roles as number[] | undefined;

    if (routeRoles && routeRoles.length > 0) {
      if (!userRole || !routeRoles.includes(userRole)) {
        return userRole === 1 || userRole === 2 ? '/' : { path: '/login', query: { redirect: to.fullPath } };
      }
    }
  }

  return true;
});

export default router;

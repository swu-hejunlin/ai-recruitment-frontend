/**
 * 应用布局组件
 * 提供顶部导航栏 + 侧边栏的通用布局
 */

<template>
  <div class="app-layout">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo" @click="goHome">
          <el-icon :size="28"><DataBoard /></el-icon>
          <span class="logo-text">智能招聘平台</span>
        </div>
      </div>

      <div class="header-right">
        <!-- 通知中心 -->
        <el-dropdown trigger="click" class="notification-dropdown">
          <div class="notification-icon-wrapper">
            <el-icon :size="20" class="notification-icon">
              <BellFilled />
            </el-icon>
            <el-badge
              v-if="userStore.unreadNotificationCount > 0"
              :value="userStore.unreadNotificationCount"
              :max="99"
              class="notification-badge"
              type="danger"
            />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="notification-dropdown-content">
                <NotificationCenter />
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 用户信息下拉菜单 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar
              v-if="userStore.userInfo?.role === 1"
              :src="jobSeekerInfo?.avatar"
              :size="32"
              class="user-avatar"
            >
              {{ userName.charAt(0) }}
            </el-avatar>
            <el-avatar
              v-else-if="userStore.userInfo?.role === 2"
              :src="companyInfo?.logo"
              :size="32"
              class="user-avatar boss-avatar"
            >
              {{ userName.charAt(0) }}
            </el-avatar>
            <el-avatar v-else :size="32" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="user-name">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><UserFilled /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="app-body">
      <!-- 侧边栏 -->
      <aside class="app-sidebar">
        <el-menu
          :default-active="activeMenu"
          :router="true"
          :collapse="isSidebarCollapse"
          class="sidebar-menu"
        >
          <!-- 加载状态 -->
          <div v-if="!userRole" class="loading-menu">
            <el-skeleton :rows="2" animated />
          </div>
          
          <!-- 求职者菜单 -->
          <template v-else-if="userRole === 1">
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <template #title>首页</template>
            </el-menu-item>
            <el-menu-item index="/discover">
              <el-icon><MagicStick /></el-icon>
              <template #title>岗位发现</template>
            </el-menu-item>
            <el-menu-item index="/applications">
              <el-icon><Document /></el-icon>
              <template #title>
                <span class="menu-item-with-badge">
                  我的投递
                  <!-- 求职者：显示投递总数 -->
                  <el-badge
                    v-if="userStore.applicationCount > 0"
                    :value="userStore.applicationCount"
                    :max="99"
                    class="notification-badge"
                    type="primary"
                  />
                  <!-- 如果有未读通知（如面试通知），也可以在这里显示 -->
                  <el-badge
                    v-if="userStore.unreadNotificationCount > 0"
                    is-dot
                    class="notification-dot"
                    type="danger"
                  />
                </span>
              </template>
            </el-menu-item>
            <el-menu-item index="/interviews">
              <el-icon><Message /></el-icon>
              <template #title>我的面试</template>
            </el-menu-item>
            <el-menu-item index="/favorites">
              <el-icon><Star /></el-icon>
              <template #title>我的收藏</template>
            </el-menu-item>
            <el-menu-item index="/profile">
              <el-icon><User /></el-icon>
              <template #title>我的简历</template>
            </el-menu-item>
            <el-menu-item index="/resume-analyzer">
              <el-icon><DataAnalysis /></el-icon>
              <template #title>简历分析</template>
            </el-menu-item>
            <el-menu-item index="/statistics">
              <el-icon><PieChart /></el-icon>
              <template #title>数据统计</template>
            </el-menu-item>
          </template>

          <!-- 企业HR菜单 -->
          <template v-else-if="userRole === 2">
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <template #title>首页</template>
            </el-menu-item>
            <el-menu-item index="/company">
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>企业信息</template>
            </el-menu-item>
            <el-menu-item index="/boss/positions">
              <el-icon><Position /></el-icon>
              <template #title>职位管理</template>
            </el-menu-item>
            <el-menu-item index="/boss/applications">
              <el-icon><Document /></el-icon>
              <template #title>
                <span class="menu-item-with-badge">
                  投递管理
                  <el-badge
                    v-if="userStore.unreadNotificationCount > 0"
                    :value="userStore.unreadNotificationCount"
                    :max="99"
                    class="notification-badge"
                    type="danger"
                  />
                </span>
              </template>
            </el-menu-item>
            <el-menu-item index="/boss/interviews">
              <el-icon><Message /></el-icon>
              <template #title>面试管理</template>
            </el-menu-item>
            <el-menu-item index="/favorites">
              <el-icon><Star /></el-icon>
              <template #title>我的收藏</template>
            </el-menu-item>
            <el-menu-item index="/statistics">
              <el-icon><PieChart /></el-icon>
              <template #title>数据统计</template>
            </el-menu-item>
          </template>
          
          <!-- 角色未识别或无权限 -->
          <template v-else>
            <div class="no-permission-menu">
              <el-empty description="暂无权限或角色信息错误" />
            </div>
          </template>
        </el-menu>

        <!-- 侧边栏折叠按钮 -->
        <div class="sidebar-collapse" @click="toggleSidebar">
          <el-icon>
            <DArrowLeft v-if="!isSidebarCollapse" />
            <DArrowRight v-else />
          </el-icon>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="app-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, defineAsyncComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import {
  DataBoard,
  User,
  ArrowDown,
  UserFilled,
  SwitchButton,
  House,
  OfficeBuilding,
  DArrowLeft,
  DArrowRight,
  Position,
  Document,
  BellFilled,
  Message,
  Star,
  DataAnalysis,
  MagicStick,
  PieChart
} from '@element-plus/icons-vue';
// 动态导入NotificationCenter组件
const NotificationCenter = defineAsyncComponent(() => import('./NotificationCenter.vue'));
import { useUserStore } from '../stores/userStore';
import { getJobSeekerInfo, getCompanyInfo, getUnreadNotificationCount } from '../utils/api';
import type { JobSeekerInfo, CompanyInfo } from '../types';
import { ROLE_MAP } from '../types';
// cSpell:ignore pinia
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { isLogin } = storeToRefs(userStore);

// ==================== 状态 ====================
const isSidebarCollapse = ref(false);
const jobSeekerInfo = ref<JobSeekerInfo | null>(null);
const companyInfo = ref<CompanyInfo | null>(null);
let notificationTimer: number | null = null;

// ==================== 计算属性 ====================
/**
 * 当前激活的菜单
 */
const activeMenu = computed(() => route.path);

/**
 * 用户角色
 */
const userRole = computed(() => userStore.userInfo?.role);

/**
 * 用户名称
 */
const userName = computed(() => {
  if (userRole.value === 1 && jobSeekerInfo.value?.name) {
    return jobSeekerInfo.value.name;
  }
  if (userRole.value === 2 && companyInfo.value?.companyName) {
    return companyInfo.value.companyName;
  }
  return ROLE_MAP[userRole.value as 1 | 2] || '用户';
});

// ==================== 方法 ====================
/**
 * 切换侧边栏折叠状态
 */
const toggleSidebar = () => {
  isSidebarCollapse.value = !isSidebarCollapse.value;
};

/**
 * 跳转到首页
 */
const goHome = () => {
  router.push('/');
};

/**
 * 处理下拉菜单命令
 */
const handleCommand = async (command: string) => {
  if (command === 'profile') {
    // 跳转到个人中心
    if (userRole.value === 1) {
      router.push('/profile');
    } else {
      router.push('/company');
    }
  } else if (command === 'logout') {
    // 退出登录
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });

      userStore.logout();
      ElMessage.success('已退出登录');
      router.push('/login');
    } catch {
      // 用户取消
    }
  }
};

/**
 * 刷新计数
 */
const refreshCounts = async () => {
  if (!userStore.isLogin) return;
  await userStore.refreshCounts();
};

/**
 * 开始轮询角标计数
 */
const startCountPolling = () => {
  if (notificationTimer) clearInterval(notificationTimer);
  
  // 首次立即刷新
  refreshCounts();
  
  // 每30秒轮询一次
  notificationTimer = setInterval(() => {
    if (userStore.isLogin) {
      refreshCounts();
    }
  }, 30000);
};

/**
 * 停止轮询角标计数
 */
const stopCountPolling = () => {
  if (notificationTimer) {
    clearInterval(notificationTimer);
    notificationTimer = null;
  }
};

/**
 * 获取用户信息
 */
const fetchUserInfo = async () => {
  try {
    console.log('[AppLayout调试] 尝试获取用户信息，用户角色:', userRole.value);
    console.log('[AppLayout调试] 当前store状态:', {
      isLogin: userStore.isLogin,
      token: userStore.token ? `${userStore.token.substring(0, 20)}...` : null,
      userInfo: userStore.userInfo
    });
    
    if (userRole.value === 1) {
      console.log('[AppLayout调试] 开始获取求职者信息...');
      const res = await getJobSeekerInfo();
      jobSeekerInfo.value = res;
      console.log('[AppLayout调试] 求职者信息获取成功:', res);
    } else if (userRole.value === 2) {
      console.log('[AppLayout调试] 开始获取企业信息...');
      const res = await getCompanyInfo();
      companyInfo.value = res;
      console.log('[AppLayout调试] 企业信息获取成功:', res);
    }
  } catch (error) {
    console.error('[AppLayout调试] 获取用户信息失败:', error);
  }
};

// ==================== 生命周期 ====================
onMounted(() => {
  console.log('[AppLayout调试] 组件挂载，开始初始化');
  
  fetchUserInfo();
  startCountPolling();
});

// 监听登录状态变化
watch(
  () => userStore.isLogin,
  (isLoggedIn) => {
    if (isLoggedIn) {
      startCountPolling();
    } else {
      stopCountPolling();
    }
  }
);

// 监听路由变化，重新获取用户信息
watch(
  () => route.path,
  () => {
    if (isLogin.value) {
      fetchUserInfo();
    }
  }
);

// 组件卸载时清理定时器
onUnmounted(() => {
  stopCountPolling();
});
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex; 
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

/* ==================== 顶部导航栏 ==================== */
.app-header {
  height: 60px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  margin-left: 10px;
  background: linear-gradient(135deg, #00beaa 0%, #00a896 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-dropdown {
  position: relative;
}

.notification-icon-wrapper {
  position: relative;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.notification-icon-wrapper:hover {
  background-color: #f0f2f5;
}

.notification-icon {
  color: #606266;
  transition: color 0.3s;
}

.notification-icon-wrapper:hover .notification-icon {
  color: #409eff;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}

.notification-dropdown-content {
  width: 400px;
  max-height: 500px;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: #f0f2f5;
}

.user-avatar {
  background: linear-gradient(135deg, #00beaa 0%, #00a896 100%);
  color: #ffffff;
  font-weight: 700;
}

.boss-avatar {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* ==================== 应用主体 ==================== */
.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ==================== 侧边栏 ==================== */
.app-sidebar {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e6e6e6;
  transition: width 0.3s;
  width: 220px;
  position: relative;
}

.app-sidebar:not(.is-collapse) {
  width: 220px;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
}

/* 菜单项样式优化 */
.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 8px;
  border-radius: 8px;
  color: #606266;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #ecf5ff !important;
  color: #409eff;
  font-weight: 600;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
}

/* 侧边栏折叠按钮 */
.sidebar-collapse {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-top: 1px solid #f0f2f5;
  color: #909399;
  transition: all 0.3s;
}

.sidebar-collapse:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

/* ==================== 主内容区 ==================== */
.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  position: relative;
}

/* ==================== 徽标相关 ==================== */
.menu-item-with-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.notification-badge {
  margin-left: 8px;
}

.loading-menu, .no-permission-menu {
  padding: 20px;
}
</style>

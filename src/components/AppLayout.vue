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
        <!-- 用户信息下拉菜单 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar
              v-if="userStore.userInfo?.role === 1 && jobSeekerInfo?.avatar"
              :src="jobSeekerInfo.avatar"
              :size="32"
            />
            <el-avatar v-else-if="userStore.userInfo?.role === 2 && companyInfo?.logo" :src="companyInfo.logo" :size="32" />
            <el-avatar v-else :size="32">
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
              <el-icon><Position /></el-icon>
              <template #title>职位</template>
            </el-menu-item>
            <el-menu-item index="/applications">
              <el-icon><Document /></el-icon>
              <template #title>
                <span class="menu-item-with-badge">
                  我的投递
                  <el-badge
                    v-if="unreadNotificationCount > 0"
                    :value="unreadNotificationCount"
                    :max="99"
                    class="notification-badge"
                    type="primary"
                  />
                </span>
              </template>
            </el-menu-item>
            <el-menu-item index="/profile">
              <el-icon><User /></el-icon>
              <template #title>我的简历</template>
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
                    v-if="unreadNotificationCount > 0"
                    :value="unreadNotificationCount"
                    :max="99"
                    class="notification-badge"
                    type="danger"
                  />
                </span>
              </template>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
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
  Document
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import { getJobSeekerInfo, getCompanyInfo, getUnreadNotificationCount } from '@/utils/api';
import type { JobSeekerInfo, CompanyInfo } from '@/types';
import { ROLE_MAP } from '@/types';
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { isLogin } = storeToRefs(userStore);

// ==================== 状态 ====================
const isSidebarCollapse = ref(false);
const jobSeekerInfo = ref<JobSeekerInfo | null>(null);
const companyInfo = ref<CompanyInfo | null>(null);
const unreadNotificationCount = ref(0);
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
 * 获取未读通知数量
 */
const fetchUnreadNotificationCount = async () => {
  if (!userStore.isLogin) return;
  
  try {
    const response = await getUnreadNotificationCount();
    unreadNotificationCount.value = response.count;
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
  }
};

/**
 * 开始轮询未读通知数量
 */
const startNotificationPolling = () => {
  if (notificationTimer) clearInterval(notificationTimer);
  
  // 首次立即获取
  fetchUnreadNotificationCount();
  
  // 每30秒轮询一次
  notificationTimer = setInterval(() => {
    if (userStore.isLogin) {
      fetchUnreadNotificationCount();
    }
  }, 30000);
};

/**
 * 停止轮询未读通知数量
 */
const stopNotificationPolling = () => {
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
    if (userRole.value === 1) {
      // 获取求职者信息
      const res = await getJobSeekerInfo();
      jobSeekerInfo.value = res;
    } else if (userRole.value === 2) {
      // 获取企业信息
      const res = await getCompanyInfo();
      companyInfo.value = res;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// ==================== 生命周期 ====================
onMounted(() => {
  fetchUserInfo();
  startNotificationPolling();
});

// 监听登录状态变化
watch(
  () => userStore.isLogin,
  (isLoggedIn) => {
    if (isLoggedIn) {
      startNotificationPolling();
    } else {
      stopNotificationPolling();
      unreadNotificationCount.value = 0;
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
import { onUnmounted } from 'vue';
onUnmounted(() => {
  stopNotificationPolling();
});
</script>

<style scoped>
/* ==================== BOSS直聘风格布局 ==================== */
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--boss-bg-secondary);
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

/* ==================== 顶部导航栏 ==================== */
.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.logo:hover {
  background-color: rgba(0, 190, 170, 0.08);
}

.logo .el-icon {
  font-size: 26px;
  color: #00beaa;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: var(--boss-radius-sm);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.user-info:hover {
  background-color: var(--boss-bg-tertiary);
  border-color: var(--boss-border);
}

.user-name {
  font-size: var(--boss-font-md);
  font-weight: 500;
  color: var(--boss-text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 主体区域 ==================== */
.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  background-color: var(--boss-bg-secondary);
}

/* ==================== 侧边栏 ==================== */
.app-sidebar {
  width: 220px;
  background-color: var(--boss-bg-primary);
  border-right: 1px solid var(--boss-border-light);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-sidebar:has(.el-menu--collapse) {
  width: 64px;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  padding: 16px 0;
  background-color: transparent;
}

/* Element-Plus菜单自定义样式 */
:deep(.el-menu) {
  border-right: none !important;
  background-color: transparent !important;
}

:deep(.el-menu-item) {
  height: 48px !important;
  line-height: 48px !important;
  margin: 4px 12px !important;
  border-radius: var(--boss-radius-md) !important;
  color: var(--boss-text-secondary) !important;
  font-size: var(--boss-font-md) !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

:deep(.el-menu-item.is-active) {
  color: var(--boss-primary) !important;
  background-color: rgba(0, 190, 170, 0.08) !important;
  font-weight: 600 !important;
}

:deep(.el-menu-item:hover) {
  color: var(--boss-text-primary) !important;
  background-color: var(--boss-bg-tertiary) !important;
}

:deep(.el-menu-item .el-icon) {
  font-size: 20px !important;
  margin-right: 12px !important;
  color: inherit !important;
}

:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin-right: 0 !important;
}

/* 侧边栏折叠按钮 */
.sidebar-collapse {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--boss-border-light);
  cursor: pointer;
  color: var(--boss-icon-secondary);
  background-color: var(--boss-bg-primary);
  transition: all 0.3s ease;
}

.sidebar-collapse:hover {
  background-color: var(--boss-bg-tertiary);
  color: var(--boss-primary);
}

.sidebar-collapse .el-icon {
  font-size: 18px;
}

/* ==================== 菜单加载状态 ==================== */
.loading-menu {
  padding: 24px 16px;
}

.no-permission-menu {
  padding: 48px 24px;
  text-align: center;
}

:deep(.no-permission-menu .el-empty__description) {
  font-size: var(--boss-font-sm);
  color: var(--boss-text-tertiary) !important;
}

/* ==================== 主内容区 ==================== */
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  background-color: var(--boss-bg-secondary);
}

/* ==================== 菜单项带徽章样式 ==================== */
.menu-item-with-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.notification-badge {
  :deep(.el-badge__content) {
    height: 18px;
    line-height: 18px;
    min-width: 18px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 600;
    border: 2px solid white;
    box-shadow: 0 0 0 1px var(--el-color-danger);
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}

/* 侧边栏折叠时的徽章样式 */
:deep(.el-menu--collapse) .notification-badge {
  :deep(.el-badge__content) {
    position: absolute;
    top: 10px;
    right: 10px;
    transform: scale(0.8);
  }
}
</style>

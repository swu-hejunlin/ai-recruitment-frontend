<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-left">
        <div class="logo" @click="goHome">
          <img src="/images/logo.png" alt="智能招聘平台" class="logo-image" />
          <span class="logo-text">智能招聘平台</span>
        </div>
      </div>

      <div class="header-right">
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

        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar
              v-if="userStore.userInfo?.role === 1"
              :src="jobSeekerInfo?.jobSeeker?.avatar"
              :size="32"
              class="user-avatar"
            >
              {{ userName.charAt(0) }}
            </el-avatar>
            <el-avatar
              v-else-if="userStore.userInfo?.role === 2"
              :src="companyInfo?.logo"
              :size="32"
              class="user-avatar"
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
      <aside class="app-sidebar" :class="{ 'is-collapse': isSidebarCollapse }">
        <el-menu
          :default-active="activeMenu"
          :router="true"
          :collapse="isSidebarCollapse"
          class="sidebar-menu"
        >
          <div v-if="!userRole" class="loading-menu">
            <el-skeleton :rows="2" animated />
          </div>

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
                  <el-badge
                    v-if="userStore.applicationCount > 0"
                    :value="userStore.applicationCount"
                    :max="99"
                    class="menu-badge"
                    type="primary"
                  />
                  <el-badge
                    v-if="userStore.unreadNotificationCount > 0"
                    is-dot
                    class="menu-dot"
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
              <template #title>趋势洞悉</template>
            </el-menu-item>
            <el-menu-item index="/mock-interview">
              <el-icon><VideoCamera /></el-icon>
              <template #title>AI面试</template>
            </el-menu-item>
          </template>

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
                    class="menu-badge"
                    type="danger"
                  />
                </span>
              </template>
            </el-menu-item>
            <el-menu-item index="/boss/interviews">
              <el-icon><Message /></el-icon>
              <template #title>面试管理</template>
            </el-menu-item>
            <el-menu-item index="/boss/talent-discovery">
              <el-icon><UserFilled /></el-icon>
              <template #title>牛人发现</template>
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

          <template v-else>
            <div class="no-permission-menu">
              <el-empty description="暂无权限或角色信息错误" />
            </div>
          </template>
        </el-menu>

        <div class="sidebar-collapse" @click="toggleSidebar">
          <el-icon>
            <DArrowLeft v-if="!isSidebarCollapse" />
            <DArrowRight v-else />
          </el-icon>
        </div>
      </aside>

      <main class="app-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, defineAsyncComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  User, ArrowDown, UserFilled, SwitchButton,
  House, OfficeBuilding, DArrowLeft, DArrowRight,
  Position, Document, BellFilled, Message,
  Star, DataAnalysis, MagicStick, PieChart, VideoCamera
} from '@element-plus/icons-vue';

const NotificationCenter = defineAsyncComponent(() => import('./NotificationCenter.vue'));
import { useUserStore } from '../stores/userStore';
import { getJobSeekerInfo, getCompanyInfo } from '../utils/api';
import type { JobSeekerFullInfo, CompanyInfo } from '../types';
import { ROLE_MAP } from '../types';
import { storeToRefs } from 'pinia';
import { useWebSocket } from '../utils/useWebSocket';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { isLogin } = storeToRefs(userStore);
const ws = useWebSocket();

const isSidebarCollapse = ref(false);
const jobSeekerInfo = ref<JobSeekerFullInfo | null>(null);
const companyInfo = ref<CompanyInfo | null>(null);

const activeMenu = computed(() => route.path);
const userRole = computed(() => userStore.userInfo?.role);

const userName = computed(() => {
  if (userRole.value === 1 && jobSeekerInfo.value?.jobSeeker?.name) {
    return jobSeekerInfo.value.jobSeeker.name;
  }
  if (userRole.value === 2 && companyInfo.value?.companyName) {
    return companyInfo.value.companyName;
  }
  return ROLE_MAP[userRole.value as 1 | 2] || '用户';
});

const toggleSidebar = () => {
  isSidebarCollapse.value = !isSidebarCollapse.value;
};

const goHome = () => {
  router.push('/');
};

const handleCommand = async (command: string) => {
  if (command === 'profile') {
    if (userRole.value === 1) {
      router.push('/profile');
    } else {
      router.push('/company');
    }
  } else if (command === 'logout') {
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
      // 用户取消操作
    }
  }
};

const refreshCounts = async () => {
  if (!userStore.isLogin) return;
  await userStore.refreshCounts();
};

const fetchUserInfo = async () => {
  try {
    if (userRole.value === 1) {
      const res = await getJobSeekerInfo();
      jobSeekerInfo.value = res;
    } else if (userRole.value === 2) {
      const res = await getCompanyInfo();
      companyInfo.value = res;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

onMounted(() => {
  fetchUserInfo();
  refreshCounts();
  ws.connect();
});

watch(
  () => userStore.isLogin,
  (isLoggedIn) => {
    if (isLoggedIn) {
      ws.connect();
    } else {
      ws.disconnect();
    }
  }
);

watch(
  () => route.path,
  () => {
    if (isLogin.value) {
      fetchUserInfo();
    }
  }
);

onUnmounted(() => {
  ws.disconnect();
});
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--ai-bg-page);
  overflow: hidden;
}

.app-header {
  height: 60px;
  background-color: var(--ai-bg-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--ai-spacing-lg);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1000;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: opacity var(--ai-animation-fast);
}

.logo:hover {
  opacity: 0.8;
}

.logo-image {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.logo-text {
  font-size: var(--ai-font-xl);
  font-weight: 700;
  margin-left: 10px;
  background: var(--ai-gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--ai-spacing-md);
}

.notification-icon-wrapper {
  position: relative;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--ai-radius-sm);
  transition: all var(--ai-animation-fast);
  display: flex;
  align-items: center;
}

.notification-icon-wrapper:hover {
  background-color: var(--ai-bg-secondary);
}

.notification-icon {
  color: var(--ai-text-secondary);
  transition: color var(--ai-animation-fast);
}

.notification-icon-wrapper:hover .notification-icon {
  color: var(--ai-primary);
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
  border-radius: var(--ai-radius-sm);
  transition: all var(--ai-animation-fast);
}

.user-info:hover {
  background-color: var(--ai-bg-secondary);
}

.user-avatar {
  background: var(--ai-gradient-primary);
  color: var(--ai-text-white);
  font-weight: 700;
  transition: all var(--ai-animation-fast);
}

.user-avatar:hover {
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.3);
  transform: scale(1.05);
}

.user-name {
  margin: 0 var(--ai-spacing-sm);
  font-size: var(--ai-font-sm);
  color: var(--ai-text-primary);
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-sidebar {
  background-color: var(--ai-bg-primary);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--ai-border);
  transition: width var(--ai-animation-normal);
  width: 220px;
  position: relative;
  flex-shrink: 0;
}

.app-sidebar.is-collapse {
  width: 64px;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 46px;
  line-height: 46px;
  margin: 2px 8px;
  border-radius: var(--ai-radius-md);
  color: var(--ai-text-secondary);
  transition: all var(--ai-animation-fast);
  position: relative;
  overflow: hidden;
}

.sidebar-menu :deep(.el-menu-item::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 3px;
  background: var(--ai-gradient-primary);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity var(--ai-animation-fast);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--ai-primary-light);
  color: var(--ai-primary);
  font-weight: 600;
}

.sidebar-menu :deep(.el-menu-item.is-active::before) {
  opacity: 1;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: var(--ai-bg-secondary);
  color: var(--ai-primary);
}

.sidebar-collapse {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-top: 1px solid var(--ai-border-lighter);
  color: var(--ai-text-tertiary);
  transition: all var(--ai-animation-fast);
}

.sidebar-collapse:hover {
  background-color: var(--ai-bg-secondary);
  color: var(--ai-primary);
}

.app-main {
  flex: 1;
  padding: var(--ai-spacing-lg);
  overflow-y: auto;
}

.menu-item-with-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.menu-badge {
  margin-left: var(--ai-spacing-sm);
}

.menu-dot {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.loading-menu,
.no-permission-menu {
  padding: var(--ai-spacing-lg);
}
</style>

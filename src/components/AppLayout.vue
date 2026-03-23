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
  DArrowRight
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import { getJobSeekerInfo, getCompanyInfo } from '@/utils/api';
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
});

// 监听路由变化，重新获取用户信息
watch(
  () => route.path,
  () => {
    if (isLogin.value) {
      fetchUserInfo();
    }
  }
);
</script>

<style scoped>
/* ==================== 布局容器 ==================== */
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

/* ==================== 顶部导航栏 ==================== */
.app-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
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
  color: #409eff;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-name {
  font-size: 14px;
  color: #606266;
}

/* ==================== 主体区域 ==================== */
.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ==================== 侧边栏 ==================== */
.app-sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.app-sidebar:has(.el-menu--collapse) {
  width: 64px;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
}

.sidebar-collapse {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #e4e7ed;
  cursor: pointer;
  color: #909399;
  transition: background-color 0.3s;
}

.sidebar-collapse:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

/* ==================== 菜单加载状态 ==================== */
.loading-menu {
  padding: 20px;
}

.no-permission-menu {
  padding: 40px 20px;
  text-align: center;
}

/* ==================== 主内容区 ==================== */
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>

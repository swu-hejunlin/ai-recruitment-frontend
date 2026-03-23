/**
 * 首页组件
 * 根据角色显示不同的内容
 */

<template>
  <AppLayout>
    <div class="home-container">
      <!-- 页面标题和状态 -->
      <div class="page-header">
        <h2>智能招聘平台</h2>
        <div class="user-status">
          <span class="status-label">当前用户:</span>
          <span class="status-value">{{ userStore.userInfo?.phone || '未登录' }}</span>
          <span class="status-separator">|</span>
          <span class="status-label">角色:</span>
          <span class="status-value">{{ userStore.userInfo?.role === 1 ? '牛人' : userStore.userInfo?.role === 2 ? 'boss' : '未设置' }}</span>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="5" animated />
        <div style="text-align: center; margin-top: 20px; color: #909399;">
          正在加载用户信息...
        </div>
      </div>

      <div v-else>
        <!-- 欢迎信息 -->
        <el-card class="welcome-card" shadow="hover">
          <div class="welcome-content">
            <div class="welcome-left">
              <h2>欢迎使用智能招聘平台</h2>
              <p>请完善您的个人信息以开始使用AI智能匹配功能</p>
            </div>
            <div class="welcome-right">
              <el-button type="primary" size="large" @click="goToProfile">
                <el-icon><Edit /></el-icon>
                完善信息
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 功能卡片 -->
        <div class="feature-grid">
          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon :size="40" color="#409eff"><Document /></el-icon>
            </div>
            <h3>智能简历解析</h3>
            <p>AI自动解析简历，提取关键信息</p>
          </el-card>

          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon :size="40" color="#67c23a"><TrendCharts /></el-icon>
            </div>
            <h3>智能匹配推荐</h3>
            <p>基于AI算法，精准匹配岗位和人才</p>
          </el-card>

          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon :size="40" color="#e6a23c"><ChatLineRound /></el-icon>
            </div>
            <h3>AI面试助手</h3>
            <p>智能文字面试，高效筛选候选人</p>
          </el-card>

          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon :size="40" color="#f56c6c"><DataAnalysis /></el-icon>
            </div>
            <h3>数据分析</h3>
            <p>可视化数据展示，洞察招聘趋势</p>
          </el-card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter, useRoute } from 'vue-router';
import { Document, TrendCharts, ChatLineRound, DataAnalysis, Edit, WarningFilled, CircleCheckFilled } from '@element-plus/icons-vue';
import AppLayout from '@/components/AppLayout.vue';
import { getJobSeekerInfo, getCompanyInfo } from '@/utils/api';
import type { JobSeekerInfo, CompanyInfo } from '@/types';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// 加载状态
const loading = ref(true);
// 求职者信息
const jobSeekerInfo = ref<JobSeekerInfo | null>(null);
// 企业信息
const companyInfo = ref<CompanyInfo | null>(null);

/**
 * 判断个人信息是否已填写（通过检查关键字段）
 */
const isProfileCompleted = computed(() => {
  // 如果用户未登录，返回 false
  if (!userStore.userInfo?.role) {
    return false;
  }

  if (userStore.userInfo.role === 1) {
    // 求职者：检查姓名是否填写
    return !!(jobSeekerInfo.value && jobSeekerInfo.value.name);
  } else if (userStore.userInfo.role === 2) {
    // 企业：检查企业名称是否填写
    return !!(companyInfo.value && companyInfo.value.companyName);
  }

  return false;
});

/**
 * 获取用户名称（用于显示）
 */
const jobSeekerName = computed(() => jobSeekerInfo.value?.name || '求职者');
const companyName = computed(() => companyInfo.value?.companyName || '企业');

/**
 * 加载用户信息
 */
const loadUserInfo = async () => {
  loading.value = true;
  try {
    // 检查用户是否已登录
    if (!userStore.isLogin || !userStore.userInfo?.role) {
      loading.value = false;
      return;
    }
    
    if (userStore.userInfo.role === 1) {
      // 求职者
      jobSeekerInfo.value = await getJobSeekerInfo();
    } else if (userStore.userInfo.role === 2) {
      // 企业
      companyInfo.value = await getCompanyInfo();
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 如果获取失败，保持 null，表示信息未完善
  } finally {
    loading.value = false;
  }
};

/**
 * 跳转到信息管理页面
 */
const goToProfile = () => {
  if (userStore.userInfo?.role === 1) {
    router.push('/profile');
  } else {
    router.push('/company');
  }
};

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
/* ==================== 首页容器 ==================== */
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 20px;
}

/* ==================== 页面头部 ==================== */
.page-header {
  margin-bottom: 32px;
}

.page-header h2 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #606266;
  background: #f5f7fa;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.user-status .status-label {
  color: #909399;
  font-weight: 500;
}

.user-status .status-value {
  color: #303133;
  font-weight: 500;
}

.user-status .status-separator {
  color: #dcdfe6;
  margin: 0 4px;
}

/* ==================== 欢迎卡片 ==================== */
.welcome-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
}

/* ==================== 状态标签 ==================== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  background: #fdf6ec;
  color: #e6a23c;
}

.status-badge .el-icon {
  font-size: 16px;
}

.status-badge.success {
  background: #f0f9eb;
  color: #67c23a;
}

.status-badge.success .el-icon {
  font-size: 16px;
}

/* ==================== 卡片内容 ==================== */
.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
}

.welcome-left h2 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 12px 0;
}

.welcome-left p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

/* ==================== 功能卡片网格 ==================== */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-icon {
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 8px 0;
}

.feature-card p {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>

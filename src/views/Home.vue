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
              <h2>{{ getWelcomeTitle() }}</h2>
              <p>{{ getWelcomeSubtitle() }}</p>
            </div>
            <div class="welcome-right">
              <el-button type="primary" size="large" @click="goToProfile">
                <el-icon><Edit /></el-icon>
                {{ getProfileButtonText() }}
              </el-button>
              <!-- 根据角色显示快捷入口 -->
              <template v-if="userStore.userInfo?.role === 2">
                <el-button type="success" size="large" @click="goToBossPosition" style="margin-left: 12px">
                  <el-icon><Position /></el-icon>
                  职位管理
                </el-button>
              </template>
              <template v-if="userStore.userInfo?.role === 1">
                <el-button type="success" size="large" @click="goToJobDiscovery" style="margin-left: 12px">
                  <el-icon><Search /></el-icon>
                  发现职位
                </el-button>
              </template>
            </div>
          </div>
        </el-card>

        <!-- 功能卡片 -->
        <div class="feature-grid">
          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon :size="40" color="#00beaa"><Document /></el-icon>
            </div>
            <h3>智能简历解析</h3>
            <p>AI自动解析简历，提取关键信息</p>
          </el-card>

          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon :size="40" color="#00c9b7"><TrendCharts /></el-icon>
            </div>
            <h3>智能匹配推荐</h3>
            <p>基于AI算法，精准匹配岗位和人才</p>
          </el-card>

          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon :size="40" color="#00a896"><ChatLineRound /></el-icon>
            </div>
            <h3>AI面试助手</h3>
            <p>智能文字面试，高效筛选候选人</p>
          </el-card>

          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon">
              <el-icon :size="40" color="#009688"><DataAnalysis /></el-icon>
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
import { ElMessage } from 'element-plus';
import { Document, TrendCharts, ChatLineRound, DataAnalysis, Edit, WarningFilled, CircleCheckFilled, Position, Search } from '@element-plus/icons-vue';
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

/**
 * 跳转到BOSS职位管理
 */
const goToBossPosition = () => {
  // 跳转到企业页面，其中包含职位管理功能
  router.push('/company');
};

/**
 * 跳转到求职者职位发现页面
 */
const goToJobDiscovery = () => {
  // 跳转到职位发现页面
  router.push('/discover');
};

/**
 * 获取欢迎标题
 */
const getWelcomeTitle = () => {
  if (!userStore.userInfo?.role) {
    return '欢迎使用智能招聘平台';
  }
  
  if (userStore.userInfo.role === 1) {
    if (jobSeekerInfo.value?.name) {
      return `欢迎回来，${jobSeekerInfo.value.name}！`;
    }
    return '您好，求职者！';
  } else {
    if (companyInfo.value?.companyName) {
      return `欢迎回来，${companyInfo.value.companyName}！`;
    }
    return '您好，Boss！';
  }
};

/**
 * 获取欢迎副标题
 */
const getWelcomeSubtitle = () => {
  if (!userStore.userInfo?.role) {
    return '请完善您的个人信息以开始使用AI智能匹配功能';
  }
  
  if (userStore.userInfo.role === 1) {
    if (!jobSeekerInfo.value?.name) {
      return '请完善您的简历信息，开始寻找心仪的工作';
    }
    return '开始寻找心仪的工作，AI帮您精准匹配';
  } else {
    if (!companyInfo.value?.companyName) {
      return '请完善您的企业信息，开始发布职位招聘人才';
    }
    return '发布职位招聘人才，AI帮您精准匹配';
  }
};

/**
 * 获取个人信息按钮文本
 */
const getProfileButtonText = () => {
  if (!userStore.userInfo?.role) {
    return '完善信息';
  }
  
  if (userStore.userInfo.role === 1) {
    return jobSeekerInfo.value?.name ? '更新简历' : '完善简历';
  } else {
    return companyInfo.value?.companyName ? '更新企业信息' : '完善企业信息';
  }
};

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
/* ==================== BOSS直聘风格首页样式 ==================== */
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* ==================== 页面头部 ==================== */
.page-header {
  margin-bottom: 24px;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-header h2 {
  font-size: 24px;
  color: #222;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #666;
  background: #f5f7fa;
  padding: 10px 16px;
  border-radius: 8px;
  width: fit-content;
}

.user-status .status-label {
  color: #999;
  font-weight: 500;
}

.user-status .status-value {
  color: #222;
  font-weight: 600;
}

.user-status .status-separator {
  color: #e0e0e0;
  margin: 0 4px;
}

/* ==================== 欢迎卡片 ==================== */
.welcome-card {
  background: linear-gradient(135deg, #00beaa 0%, #00c9b7 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  border: none !important;
  box-shadow: 0 4px 16px rgba(0, 190, 170, 0.25) !important;
}

.welcome-card :deep(.el-card__body) {
  padding: 0;
}

/* ==================== 卡片内容 ==================== */
.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  border-radius: 12px;
}

.welcome-left h2 {
  font-size: 24px;
  color: #222;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.welcome-left p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.welcome-right .el-button {
  background: linear-gradient(135deg, #00beaa, #00c9b7);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 190, 170, 0.3);
  font-weight: 500;
}

.welcome-right .el-button:hover {
  background: linear-gradient(135deg, #00a896, #00beaa);
  box-shadow: 0 6px 16px rgba(0, 190, 170, 0.4);
}

/* ==================== 功能卡片网格 ==================== */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00beaa, #00c9b7);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 190, 170, 0.15);
  border-color: #e6f9f6;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(0, 190, 170, 0.08), rgba(0, 201, 183, 0.04));
  border-radius: 50%;
  z-index: 0;
}

.feature-icon .el-icon {
  position: relative;
  z-index: 1;
}

.feature-card h3 {
  font-size: 18px;
  color: #222;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>

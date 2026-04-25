/**
 * 首页组件
 * 根据角色显示不同的内容
 */

<template>
  <AppLayout>
    <div class="home-container">
      <!-- 页面标题和状态 -->
      <div class="page-header">
        <h2 class="page-title">
          <span class="title-text">AI智能招聘系统</span>
          <span class="title-subtext">Intelligent Recruitment Platform</span>
        </h2>
        <div class="user-status">
          <span class="status-label">当前用户:</span>
          <span class="status-value">{{ userStore.userInfo?.phone || '未登录' }}</span>
          <span class="status-separator">|</span>
          <span class="status-label">角色:</span>
          <span class="status-value">{{ userStore.userInfo?.role === 1 ? '求职者' : userStore.userInfo?.role === 2 ? '招聘方' : '未设置' }}</span>
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
              <h2 class="welcome-title">{{ getWelcomeTitle() }}</h2>
              <p class="welcome-subtitle">{{ getWelcomeSubtitle() }}</p>
              <div class="welcome-features">
                <div class="feature-item">
                  <el-icon color="#409eff"><MagicStick /></el-icon>
                  <span>AI智能匹配</span>
                </div>
                <div class="feature-item">
                  <el-icon color="#00beaa"><DataAnalysis /></el-icon>
                  <span>智能数据分析</span>
                </div>
                <div class="feature-item">
                  <el-icon color="#722ed1"><VideoCamera /></el-icon>
                  <span>AI视频面试</span>
                </div>
              </div>
            </div>
            <div class="welcome-right">
              <el-button type="primary" size="large" @click="goToProfile" class="welcome-button">
                <el-icon><Edit /></el-icon>
                {{ getProfileButtonText() }}
              </el-button>
              <!-- 根据角色显示快捷入口 -->
              <template v-if="userStore.userInfo?.role === 2">
                <el-button type="success" size="large" @click="goToBossPosition" style="margin-left: 12px" class="welcome-button">
                  <el-icon><Position /></el-icon>
                  职位管理
                </el-button>
              </template>
              <template v-if="userStore.userInfo?.role === 1">
                <el-button type="success" size="large" @click="goToJobDiscovery" style="margin-left: 12px" class="welcome-button">
                  <el-icon><Search /></el-icon>
                  发现职位
                </el-button>
              </template>
            </div>
          </div>
        </el-card>

        <!-- 功能卡片 -->
        <div class="feature-grid">
          <el-card class="feature-card clickable" shadow="hover" @click="goToResumeAnalyzer">
            <div class="feature-icon ai-icon-resume">
              <el-icon :size="40" color="#409eff"><Document /></el-icon>
            </div>
            <h3 class="feature-title">AI简历智能解析</h3>
            <p class="feature-description">AI自动识别简历关键信息，智能提取技能和经验</p>
          </el-card>

          <el-card class="feature-card clickable" shadow="hover" @click="goToJobDiscovery">
            <div class="feature-icon ai-icon-match">
              <el-icon :size="40" color="#00beaa"><TrendCharts /></el-icon>
            </div>
            <h3 class="feature-title">AI智能匹配推荐</h3>
            <p class="feature-description">基于深度学习算法，精准匹配岗位与人才</p>
          </el-card>

          <el-card class="feature-card clickable" shadow="hover" @click="goToMockInterview">
            <div class="feature-icon ai-icon-interview">
              <el-icon :size="40" color="#722ed1"><VideoCamera /></el-icon>
            </div>
            <h3 class="feature-title">AI视频面试</h3>
            <p class="feature-description">智能视频面试评估，提升招聘效率</p>
          </el-card>

          <el-card class="feature-card clickable" shadow="hover" @click="goToStatistics">
            <div class="feature-icon ai-icon-analysis">
              <el-icon :size="40" color="#fa8c16"><DataAnalysis /></el-icon>
            </div>
            <h3 class="feature-title">AI数据分析</h3>
            <p class="feature-description">智能数据洞察，预测招聘趋势</p>
          </el-card>
        </div>

        <!-- 推荐职位（只对求职者显示） -->
        <div v-if="userStore.userInfo?.role === 1 && (latestPositions.length > 0 || hotPositions.length > 0)" class="recommendation-section">
          <!-- 热门职位 -->
          <div v-if="hotPositions.length > 0" class="hot-positions-section">
            <div class="section-header">
              <h3 class="section-title">
                <el-icon><TrendCharts /></el-icon>
                热门职位
              </h3>
              <span class="section-subtitle">高薪资、高匹配度的优质职位</span>
            </div>
            <div class="hot-positions-grid">
              <JobCard 
                v-for="position in hotPositions.slice(0, 4)" 
                :key="position.id" 
                :position="position"
                @click="viewHotPosition(position)"
              />
            </div>
          </div>

          <!-- 最新职位 -->
          <div v-if="latestPositions.length > 0" class="latest-positions-section">
            <div class="section-header">
              <h3 class="section-title">
                <el-icon><Clock /></el-icon>
                最新职位
              </h3>
              <span class="section-subtitle">刚刚发布的优质机会</span>
            </div>
            <div class="latest-positions-grid">
              <JobCard 
                v-for="position in latestPositions.slice(0, 6)" 
                :key="position.id" 
                :position="position"
                @click="viewLatestPosition(position)"
              />
            </div>
            
            <div class="more-positions-link">
              <el-button type="primary" link @click="goToJobDiscovery">
                <span>查看更多职位</span>
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, TrendCharts, ChatLineRound, DataAnalysis, Edit, Position, Search, Clock, ArrowRight, Location, VideoCamera, MagicStick } from '@element-plus/icons-vue';
// 动态导入组件
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'));
const JobCard = defineAsyncComponent(() => import('../components/position/JobCard.vue'));
import { getJobSeekerInfo, getCompanyInfo, getLatestPositions, getHotPositions } from '../utils/api';
import type { JobSeekerInfo, CompanyInfo, PositionInfo } from '../types';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// 加载状态
const loading = ref(true);
// 求职者信息
const jobSeekerInfo = ref<JobSeekerInfo | null>(null);
// 企业信息
const companyInfo = ref<CompanyInfo | null>(null);
// 推荐职位信息
const latestPositions = ref<PositionInfo[]>([]);
const hotPositions = ref<PositionInfo[]>([]);

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
      
      // 同时加载推荐职位
      await Promise.all([
        loadLatestPositions(),
        loadHotPositions()
      ]);
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
 * 加载最新职位
 */
const loadLatestPositions = async () => {
  try {
    const positions = await getLatestPositions(10);
    latestPositions.value = positions || [];
  } catch (error) {
    console.error('加载最新职位失败:', error);
    latestPositions.value = [];
  }
};

/**
 * 加载热门职位
 */
const loadHotPositions = async () => {
  try {
    const positions = await getHotPositions(10);
    hotPositions.value = positions || [];
  } catch (error) {
    console.error('加载热门职位失败:', error);
    hotPositions.value = [];
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
  router.push('/discover');
};

/**
 * 跳转到简历智能分析页面
 */
const goToResumeAnalyzer = () => {
  router.push('/resume-analyzer');
};

/**
 * 跳转到数据统计页面
 */
const goToStatistics = () => {
  router.push('/statistics');
};

/**
 * 跳转到AI面试页面
 */
const goToMockInterview = () => {
  router.push('/mock-interview');
};

/**
 * 查看热门职位详情
 */
const viewHotPosition = (position: PositionInfo) => {
  // 跳转到职位发现页面并传入职位ID
  router.push({ path: '/discover', query: { positionId: position.id } });
};

/**
 * 查看最新职位详情
 */
const viewLatestPosition = (position: PositionInfo) => {
  // 跳转到职位发现页面并传入职位ID
  router.push({ path: '/discover', query: { positionId: position.id } });
};

/**
 * 格式化薪资
 */
const formatSalary = (min: number, max: number): string => {
  return `${min}K - ${max}K/月`;
};

/**
 * 格式化学历
 */
const formatEducation = (level: number): string => {
  const educationMap: Record<number, string> = {
    1: '高中及以下',
    2: '大专',
    3: '本科',
    4: '硕士',
    5: '博士'
  };
  return educationMap[level] || '不限';
};

/**
 * 格式化发布时间
 */
const formatPublishTime = (dateString: string): string => {
  if (!dateString) return '未知时间';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return '刚刚';
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.getMonth() + 1 + '月' + date.getDate() + '日';
      }
    }
  } catch (error) {
    return dateString;
  }
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
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ==================== 页面头部 ==================== */
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  background: linear-gradient(135deg, #409eff 0%, #00beaa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.title-subtext {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
  letter-spacing: 2px;
}

.user-status {
  font-size: 14px;
  color: #909399;
  display: flex;
  align-items: center;
  background: rgba(64, 158, 255, 0.05);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.status-value {
  color: #409eff;
  font-weight: 600;
  margin-left: 4px;
}

.status-separator {
  margin: 0 12px;
  color: #dcdfe6;
}

/* ==================== 欢迎卡片 ==================== */
.welcome-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.1);
  overflow: hidden;
  position: relative;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #409eff 0%, #00beaa 100%);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px;
  gap: 40px;
}

.welcome-left {
  flex: 1;
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #303133;
  background: linear-gradient(135deg, #409eff 0%, #00beaa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-subtitle {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
  line-height: 1.5;
}

.welcome-features {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(64, 158, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(64, 158, 255, 0.1);
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.welcome-right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.welcome-button {
  min-width: 160px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 24px;
  transition: all 0.3s ease;
}

.welcome-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* ==================== 功能网格 ==================== */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.feature-card {
  text-align: center;
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(64, 158, 255, 0.1);
  background: var(--ai-bg-primary);
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
  background: linear-gradient(90deg, var(--ai-primary) 0%, var(--ai-secondary) 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card.clickable {
  cursor: pointer;
}

.feature-card.clickable:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: #409eff;
  box-shadow: 0 12px 32px rgba(64, 158, 255, 0.2);
}

.feature-card.clickable:hover::before {
  transform: scaleX(1);
}

.feature-card.clickable:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.2);
}

.feature-icon {
  margin-bottom: 20px;
  display: inline-flex;
  padding: 20px;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.05);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.ai-icon-resume {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
}

.ai-icon-match {
  background: linear-gradient(135deg, rgba(0, 190, 170, 0.1) 0%, rgba(0, 190, 170, 0.05) 100%);
}

.ai-icon-interview {
  background: linear-gradient(135deg, rgba(114, 46, 209, 0.1) 0%, rgba(114, 46, 209, 0.05) 100%);
}

.ai-icon-analysis {
  background: linear-gradient(135deg, rgba(250, 140, 22, 0.1) 0%, rgba(250, 140, 22, 0.05) 100%);
}

.feature-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #303133;
  position: relative;
  z-index: 1;
}

.feature-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  padding: 0 16px;
  position: relative;
  z-index: 1;
}

/* ==================== 推荐职位板块 ==================== */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(64, 158, 255, 0.1);
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #409eff 0%, #00beaa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 职位网格布局 */
.hot-positions-grid, .latest-positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.position-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.position-card:hover {
  border-color: #409eff;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
  transform: translateY(-4px);
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.position-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  transition: color 0.3s ease;
}

.position-card:hover .position-title {
  color: #409eff;
}

.position-salary {
  font-size: 16px;
  font-weight: 700;
  color: #f56c6c;
  background: linear-gradient(135deg, #f56c6c 0%, #fa8c16 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.company-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.position-location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
}

.position-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.position-tags .el-tag {
  border-radius: 12px !important;
  font-size: 12px !important;
  padding: 2px 8px !important;
  transition: all 0.3s ease;
}

.position-card:hover .position-tags .el-tag {
  background: rgba(64, 158, 255, 0.1) !important;
  color: #409eff !important;
  border-color: rgba(64, 158, 255, 0.3) !important;
}

.position-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 12px;
  border-top: 1px solid rgba(64, 158, 255, 0.1);
  padding-top: 12px;
}

.more-positions-link {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 40px;
}

.more-positions-link .el-button {
  border-radius: 20px;
  padding: 8px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.more-positions-link .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.loading-wrapper {
  padding: 40px 0;
}
</style>

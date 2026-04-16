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
                :job="position"
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
                :job="position"
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
import { Document, TrendCharts, ChatLineRound, DataAnalysis, Edit, Position, Search, Clock, ArrowRight, Location } from '@element-plus/icons-vue';
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

.page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.user-status {
  font-size: 14px;
  color: #909399;
  display: flex;
  align-items: center;
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
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.welcome-left h2 {
  font-size: 22px;
  margin-bottom: 8px;
  color: #303133;
}

.welcome-left p {
  font-size: 15px;
  color: #606266;
  margin: 0;
}

/* ==================== 功能网格 ==================== */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.feature-card {
  text-align: center;
  border-radius: 12px;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  margin-bottom: 16px;
  display: inline-flex;
  padding: 12px;
  border-radius: 12px;
  background-color: #f0f9f8;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #303133;
}

.feature-card p {
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
}

/* ==================== 推荐职位板块 ==================== */
.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-subtitle {
  font-size: 14px;
  color: #909399;
}

/* 职位网格布局 */
.hot-positions-grid, .latest-positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.position-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.position-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
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
}

.position-salary {
  font-size: 16px;
  font-weight: 700;
  color: #f56c6c;
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

.position-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 12px;
  border-top: 1px solid #f2f6fc;
  padding-top: 12px;
}

.more-positions-link {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 40px;
}

.loading-wrapper {
  padding: 40px 0;
}
</style>

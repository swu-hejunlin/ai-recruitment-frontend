<template>
  <AppLayout>
    <div class="home-container">
      <div class="page-header">
        <div class="page-title">
          <h2 class="title-text">AI智能招聘系统</h2>
          <span class="title-subtext">Intelligent Recruitment Platform</span>
        </div>
        <div class="user-status">
          <span class="status-label">当前用户:</span>
          <span class="status-value">{{ userStore.userInfo?.phone || '未登录' }}</span>
          <span class="status-separator">|</span>
          <span class="status-label">角色:</span>
          <span class="status-value">{{ userStore.userInfo?.role === 1 ? '求职者' : userStore.userInfo?.role === 2 ? '招聘方' : '未设置' }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="5" animated />
        <div class="loading-text">正在加载用户信息...</div>
      </div>

      <div v-else class="home-content">
        <el-card class="welcome-card" shadow="never">
          <div class="welcome-content">
            <div class="welcome-left">
              <h2 class="welcome-title">{{ welcomeTitle }}</h2>
              <p class="welcome-subtitle">{{ welcomeSubtitle }}</p>
              <div class="welcome-features">
                <div class="feature-item">
                  <el-icon color="var(--ai-primary)"><MagicStick /></el-icon>
                  <span>AI智能匹配</span>
                </div>
                <div class="feature-item">
                  <el-icon color="var(--ai-secondary)"><DataAnalysis /></el-icon>
                  <span>智能数据分析</span>
                </div>
                <div class="feature-item">
                  <el-icon color="var(--ai-accent-purple)"><VideoCamera /></el-icon>
                  <span>AI视频面试</span>
                </div>
              </div>
            </div>
            <div class="welcome-right">
              <el-button type="primary" size="large" @click="goToProfile" class="welcome-button">
                <el-icon><Edit /></el-icon>
                {{ profileButtonText }}
              </el-button>
              <el-button v-if="isBoss" type="success" size="large" @click="goToBossPosition" class="welcome-button">
                <el-icon><Position /></el-icon>
                职位管理
              </el-button>
              <el-button v-if="isSeeker" type="success" size="large" @click="goToJobDiscovery" class="welcome-button">
                <el-icon><Search /></el-icon>
                发现职位
              </el-button>
            </div>
          </div>
        </el-card>

        <div class="feature-grid">
          <el-card
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
            shadow="never"
            @click="feature.action"
          >
            <div class="feature-icon" :style="{ background: feature.iconBg }">
              <el-icon :size="36" :color="feature.iconColor">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <div class="feature-icon-glow" :style="{ background: feature.glowBg }" />
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </el-card>
        </div>

        <div v-if="showRecommendations" class="recommendation-section">
          <div v-if="hotPositions.length > 0" class="positions-section">
            <div class="section-header">
              <h3 class="section-title">
                <el-icon><TrendCharts /></el-icon>
                热门职位
              </h3>
              <span class="section-subtitle">高薪资、优质的职位推荐</span>
            </div>
            <div class="positions-grid">
              <JobCard
                v-for="position in hotPositions.slice(0, 4)"
                :key="position.id"
                :position="position"
                @click="viewPosition(position)"
              />
            </div>
          </div>

          <div v-if="latestPositions.length > 0" class="positions-section">
            <div class="section-header">
              <h3 class="section-title">
                <el-icon><Clock /></el-icon>
                最新职位
              </h3>
              <span class="section-subtitle">刚刚发布的优质机会</span>
            </div>
            <div class="positions-grid">
              <JobCard
                v-for="position in latestPositions.slice(0, 6)"
                :key="position.id"
                :position="position"
                @click="viewPosition(position)"
              />
            </div>
            <div class="more-positions-link">
              <el-button type="primary" link @click="goToJobDiscovery">
                查看全部职位
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
import { useRouter } from 'vue-router';
import {
  Document, TrendCharts, DataAnalysis, Edit,
  Position, Search, Clock, ArrowRight,
  VideoCamera, MagicStick
} from '@element-plus/icons-vue';
import { getJobSeekerInfo, getCompanyInfo, getLatestPositions, getHotPositions } from '../utils/api';
import type { PositionInfo } from '../types';

const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'));
const JobCard = defineAsyncComponent(() => import('../components/position/JobCard.vue'));

const userStore = useUserStore();
const router = useRouter();

const loading = ref(true);
const jobSeekerName = ref('');
const companyName = ref('');
const latestPositions = ref<PositionInfo[]>([]);
const hotPositions = ref<PositionInfo[]>([]);

const isSeeker = computed(() => userStore.userInfo?.role === 1);
const isBoss = computed(() => userStore.userInfo?.role === 2);
const showRecommendations = computed(() => isSeeker.value && (latestPositions.value.length > 0 || hotPositions.value.length > 0));
const isProfileCompleted = computed(() => {
  if (isSeeker.value) return !!jobSeekerName.value;
  if (isBoss.value) return !!companyName.value;
  return false;
});

const welcomeTitle = computed(() => {
  if (isSeeker.value && jobSeekerName.value) return `欢迎回来，${jobSeekerName.value}！`;
  if (isBoss.value && companyName.value) return `欢迎回来，${companyName.value}！`;
  if (isSeeker.value) return '您好，求职者！';
  if (isBoss.value) return '您好，Boss！';
  return '欢迎使用智能招聘平台';
});

const welcomeSubtitle = computed(() => {
  if (isSeeker.value && !jobSeekerName.value) return '请完善您的简历信息，开始寻找心仪的工作';
  if (isSeeker.value) return '开始寻找心仪的工作，AI帮您精准匹配';
  if (isBoss.value && !companyName.value) return '请完善您的企业信息，开始发布职位招聘人才';
  if (isBoss.value) return '发布职位招聘人才，AI帮您精准匹配';
  return '请完善您的个人信息以开始使用AI智能匹配功能';
});

const profileButtonText = computed(() => {
  if (!userStore.userInfo?.role) return '完善信息';
  if (isSeeker.value) return isProfileCompleted.value ? '更新简历' : '完善简历';
  return isProfileCompleted.value ? '更新企业信息' : '完善企业信息';
});

interface FeatureItem {
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  glowBg: string;
  action: () => void;
}

const features = computed<FeatureItem[]>(() => [
  {
    title: 'AI简历智能解析',
    description: 'AI自动识别简历关键信息，智能提取技能和经验',
    icon: Document,
    iconColor: 'var(--ai-primary)',
    iconBg: 'linear-gradient(135deg, rgba(64,158,255,0.12) 0%, rgba(64,158,255,0.04) 100%)',
    glowBg: 'radial-gradient(circle at 50% 50%, rgba(64,158,255,0.15) 0%, transparent 70%)',
    action: () => router.push('/resume-analyzer')
  },
  {
    title: 'AI智能匹配推荐',
    description: '基于深度学习算法，精准匹配岗位与人才',
    icon: TrendCharts,
    iconColor: 'var(--ai-secondary)',
    iconBg: 'linear-gradient(135deg, rgba(0,190,170,0.12) 0%, rgba(0,190,170,0.04) 100%)',
    glowBg: 'radial-gradient(circle at 50% 50%, rgba(0,190,170,0.15) 0%, transparent 70%)',
    action: () => router.push('/discover')
  },
  {
    title: 'AI视频面试',
    description: '智能视频面试评估，提升招聘效率',
    icon: VideoCamera,
    iconColor: 'var(--ai-accent-purple)',
    iconBg: 'linear-gradient(135deg, rgba(114,46,209,0.12) 0%, rgba(114,46,209,0.04) 100%)',
    glowBg: 'radial-gradient(circle at 50% 50%, rgba(114,46,209,0.15) 0%, transparent 70%)',
    action: () => router.push('/mock-interview')
  },
  {
    title: 'AI数据分析',
    description: '智能数据洞察，预测招聘趋势',
    icon: DataAnalysis,
    iconColor: 'var(--ai-accent-orange)',
    iconBg: 'linear-gradient(135deg, rgba(250,140,22,0.12) 0%, rgba(250,140,22,0.04) 100%)',
    glowBg: 'radial-gradient(circle at 50% 50%, rgba(250,140,22,0.15) 0%, transparent 70%)',
    action: () => router.push('/statistics')
  }
]);

const loadUserInfo = async () => {
  loading.value = true;
  try {
    if (!userStore.isLogin || !userStore.userInfo?.role) {
      loading.value = false;
      return;
    }
    if (isSeeker.value) {
      const info = await getJobSeekerInfo();
      jobSeekerName.value = info.jobSeeker?.name || '';
      await Promise.all([loadLatestPositions(), loadHotPositions()]);
    } else if (isBoss.value) {
      const info = await getCompanyInfo();
      companyName.value = info.companyName || '';
    }
  } catch {
    // 静默处理加载失败
  } finally {
    loading.value = false;
  }
};

const loadLatestPositions = async () => {
  try {
    latestPositions.value = (await getLatestPositions(10)) || [];
  } catch {
    latestPositions.value = [];
  }
};

const loadHotPositions = async () => {
  try {
    hotPositions.value = (await getHotPositions(10)) || [];
  } catch {
    hotPositions.value = [];
  }
};

const goToProfile = () => router.push(isSeeker.value ? '/profile' : '/company');
const goToBossPosition = () => router.push('/company');
const goToJobDiscovery = () => router.push('/discover');
const viewPosition = (position: PositionInfo) => {
  router.push({ path: '/discover', query: { positionId: position.id } });
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  animation: ai-fade-in 0.4s ease;
}

.home-content {
  display: flex;
  flex-direction: column;
  gap: var(--ai-spacing-lg);
}

.page-header {
  margin-bottom: var(--ai-spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-title {
  display: flex;
  flex-direction: column;
  gap: var(--ai-spacing-xs);
}

.title-text {
  font-size: var(--ai-font-title);
  font-weight: 700;
  background: var(--ai-gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  margin: 0;
}

.title-subtext {
  font-size: var(--ai-font-sm);
  color: var(--ai-text-tertiary);
  letter-spacing: 2px;
}

.user-status {
  font-size: var(--ai-font-sm);
  color: var(--ai-text-tertiary);
  display: flex;
  align-items: center;
  background: var(--ai-primary-bg);
  padding: 8px 16px;
  border-radius: var(--ai-radius-round);
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.status-value {
  color: var(--ai-primary);
  font-weight: 600;
  margin-left: 4px;
}

.status-separator {
  margin: 0 12px;
  color: var(--ai-border);
}

.welcome-card {
  border: 1px solid rgba(64, 158, 255, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  position: relative;
  overflow: hidden;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--ai-gradient-primary);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--ai-spacing-xl);
  gap: 40px;
}

.welcome-left {
  flex: 1;
}

.welcome-title {
  font-size: var(--ai-font-xxl);
  font-weight: 700;
  margin-bottom: 12px;
  background: var(--ai-gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-subtitle {
  font-size: var(--ai-font-md);
  color: var(--ai-text-secondary);
  margin-bottom: var(--ai-spacing-lg);
  line-height: var(--ai-line-height);
}

.welcome-features {
  display: flex;
  gap: var(--ai-spacing-lg);
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--ai-spacing-sm);
  padding: 6px 16px;
  background: var(--ai-primary-bg);
  border-radius: var(--ai-radius-round);
  border: 1px solid rgba(64, 158, 255, 0.1);
  font-size: var(--ai-font-sm);
  color: var(--ai-text-secondary);
  transition: all var(--ai-animation-fast);
}

.feature-item:hover {
  background: rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.welcome-right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.welcome-button {
  min-width: 140px;
  height: 46px;
  font-size: var(--ai-font-md);
  font-weight: 600;
  border-radius: var(--ai-radius-round);
  transition: all var(--ai-animation-fast);
}

.welcome-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--ai-spacing-lg);
}

.feature-card {
  text-align: center;
  cursor: pointer;
  border: 1px solid var(--ai-border-light);
  position: relative;
  overflow: hidden;
  padding: var(--ai-spacing-lg) 0;
}

.feature-card:hover {
  transform: translateY(-6px);
  border-color: var(--ai-primary);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-card:hover .feature-icon-glow {
  opacity: 1;
  transform: scale(1.5);
}

.feature-icon {
  display: inline-flex;
  padding: 18px;
  border-radius: 50%;
  transition: all var(--ai-animation-normal);
  position: relative;
  z-index: 1;
}

.feature-icon-glow {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0;
  transition: all var(--ai-animation-normal);
  pointer-events: none;
}

.feature-title {
  font-size: var(--ai-font-lg);
  font-weight: 700;
  margin: var(--ai-spacing-md) 0;
  color: var(--ai-text-primary);
  position: relative;
  z-index: 1;
}

.feature-description {
  font-size: var(--ai-font-sm);
  color: var(--ai-text-secondary);
  line-height: var(--ai-line-height);
  padding: 0 var(--ai-spacing-md);
  position: relative;
  z-index: 1;
}

.positions-section {
  margin-bottom: var(--ai-spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--ai-spacing-lg);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--ai-primary-light);
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--ai-spacing-sm);
  background: var(--ai-gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  font-size: var(--ai-font-sm);
  color: var(--ai-text-secondary);
  font-weight: 500;
}

.positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--ai-spacing-lg);
  margin-bottom: var(--ai-spacing-lg);
}

.more-positions-link {
  text-align: center;
  margin-top: var(--ai-spacing-lg);
}

.loading-wrapper {
  padding: 40px 0;
}

.loading-text {
  text-align: center;
  margin-top: var(--ai-spacing-lg);
  color: var(--ai-text-tertiary);
}
</style>

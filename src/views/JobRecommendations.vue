<template>
  <AppLayout>
    <div class="recommendations-container">
      <div class="page-header">
        <h2>岗位推荐</h2>
        <div class="header-actions">
          <el-button type="primary" @click="handleRefresh" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新推荐
          </el-button>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <div v-else-if="recommendations.length > 0" class="recommendations-content">
        <div class="recommendation-list">
          <JobCard
            v-for="item in recommendations"
            :key="item.positionId"
            :position="item"
            @click="handleViewDetails(item)"
          />
        </div>
      </div>

      <div v-else class="empty-container">
        <el-empty description="暂无推荐岗位">
          <el-button type="primary" @click="handleRefresh">
            刷新推荐
          </el-button>
        </el-empty>
      </div>

      <!-- 职位详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        :title="selectedPosition?.title || selectedPosition?.jobName || '职位详情'"
        width="800px"
        class="job-detail-dialog"
      >
        <div v-if="selectedPosition" class="job-detail-content">
          <!-- 职位标题和薪资 -->
          <div class="detail-header">
            <div class="detail-title-section">
              <h2>{{ selectedPosition.title || selectedPosition.jobName }}</h2>
              <div class="detail-salary">
                {{ selectedPosition.salaryRange || (selectedPosition.salaryMin ? `${selectedPosition.salaryMin}k` : '面议') }}
                {{ selectedPosition.salaryMax && !selectedPosition.salaryRange ? `- ${selectedPosition.salaryMax}k` : '' }}
              </div>
            </div>

            <!-- 公司信息 -->
            <div class="detail-company-info">
              <div class="company-logo-name">
                <img
                  v-if="selectedPosition.companyLogo"
                  :src="selectedPosition.companyLogo"
                  alt="公司Logo"
                  class="company-logo"
                  @error="handleDetailLogoError"
                  :data-company-name="selectedPosition.companyName || ''"
                />
                <h3 @click="viewCompanyDetail(selectedPosition.companyId)">
                  {{ selectedPosition.companyName || '未指定公司' }}
                </h3>
              </div>
            </div>
          </div>

          <!-- 基本信息表格 -->
          <div class="detail-basic-info">
            <h3>基本信息</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">职位类别：</span>
                  <span class="info-value">{{ selectedPosition.category || '未指定' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">工作城市：</span>
                  <span class="info-value">{{ selectedPosition.city || selectedPosition.location || '未指定' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">工作地址：</span>
                  <span class="info-value">{{ selectedPosition.address || '未指定' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">学历要求：</span>
                  <span class="info-value">{{ formatEducation(selectedPosition.educationMin || selectedPosition.educationRequire) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">工作经验：</span>
                  <span class="info-value">{{ formatExperience(selectedPosition.workYearsMin || selectedPosition.experienceRequire) }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <span class="info-label">职位状态：</span>
                  <span class="info-value status-tag" :class="{'status-closed': selectedPosition.status === 0, 'status-open': selectedPosition.status === 1}">
                    {{ selectedPosition.status === 1 ? '招聘中' : '已关闭' }}
                  </span>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="info-item">
                  <span class="info-label">发布时间：</span>
                  <span class="info-value">{{ formatDate(selectedPosition.createTime) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 岗位职责 -->
          <div class="detail-section">
            <h3>岗位职责</h3>
            <div class="detail-content">
              <pre>{{ selectedPosition.description || '暂无岗位职责描述' }}</pre>
            </div>
          </div>

          <!-- 任职要求 -->
          <div class="detail-section">
            <h3>任职要求</h3>
            <div class="detail-content">
              <pre>{{ selectedPosition.requirement || '暂无任职要求' }}</pre>
            </div>
          </div>

          <!-- 福利标签 -->
          <div v-if="parseTags(selectedPosition.tags || selectedPosition.jobTags).length > 0" class="detail-section">
            <h3>公司福利</h3>
            <div class="benefits-container">
              <el-tag v-for="tag in parseTags(selectedPosition.tags || selectedPosition.jobTags)" :key="tag" class="benefit-tag">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
        <div v-else class="loading-detail">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="detailDialogVisible = false">关闭</el-button>
            <el-button
              type="primary"
              @click="handleApply(selectedPosition!)"
              :disabled="!selectedPosition || selectedPosition.status !== 1"
            >
              立即投递
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getJobRecommendations, getPositionDetail, applyPosition } from '@/utils/api';
const AppLayout = defineAsyncComponent(() => import('@/components/AppLayout.vue'));
const JobCard = defineAsyncComponent(() => import('../components/position/JobCard.vue'));
import { useUserStore } from '../stores/userStore';
import type { PositionInfo, PositionDetail } from '@/types';

const loading = ref(false);
const recommendations = ref<any[]>([]);

// 职位详情相关
const detailDialogVisible = ref(false);
const selectedPosition = ref<any>(null);
const loadingDetail = ref(false);

const fetchRecommendations = async () => {
  loading.value = true;
  try {
    const data = await getJobRecommendations(10);
    if (data) {
      recommendations.value = data;
    }
  } catch (error) {
    console.error('获取岗位推荐失败:', error);
    ElMessage.error('获取岗位推荐失败');
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  fetchRecommendations();
};

const handleViewDetails = async (item: any) => {
  try {
    loadingDetail.value = true;
    detailDialogVisible.value = true;

    const positionId = item.id || item.positionId;
    const response = await getPositionDetail(positionId);
    selectedPosition.value = response;

  } catch (error) {
    console.error('获取职位详情失败:', error);
    ElMessage.error('获取职位详情失败');
    // 如果获取详情失败，使用基本职位信息
    selectedPosition.value = {
      ...item,
      id: item.id || item.positionId,
      title: item.title || item.jobName,
      city: item.city || item.location,
      bossId: 0 // 使用默认值
    };
  } finally {
    loadingDetail.value = false;
  }
};

const handleApply = async (position: any) => {
  if (!position) return;
  
  if (position.status !== 1) {
    ElMessage.warning('该职位已关闭，无法投递');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要投递"${position.title || position.jobName}"职位吗？`,
      '确认投递',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );

    // 调用后端API投递职位
    const positionId = position.id || position.positionId;
    await applyPosition({ positionId });

    ElMessage.success(`已成功投递"${position.title || position.jobName}"职位`);

    // 立即刷新角标计数
    const userStore = useUserStore();
    userStore.refreshCounts();

    // 关闭对话框
    detailDialogVisible.value = false;
  } catch (error: any) {
    // 用户取消投递或API错误
    if (error.message && typeof error.message === 'string') {
      if (error.message.includes('已投递过该职位')) {
        ElMessage.warning('您已经投递过该职位，请不要重复投递');
      } else if (error.message.includes('停止招聘')) {
        ElMessage.error('该职位已停止招聘');
      } else {
        ElMessage.error(`投递失败: ${error.message}`);
      }
    } else {
      console.log('用户取消投递');
    }
  }
};

const EDUCATION_MAP: Record<string, string> = {
  '1': '高中及以下',
  '2': '大专',
  '3': '本科',
  '4': '硕士',
  '5': '博士'
};

// 工具方法：格式化学历
const formatEducation = (educationLevel?: number | string): string => {
  if (!educationLevel) return '不限';
  return EDUCATION_MAP[educationLevel] || '未知';
};

// 工具方法：格式化工作经验
const formatExperience = (years?: number | string): string => {
  if (years === undefined || years === null) return '不限';
  const yearsNum = typeof years === 'string' ? parseInt(years) : years;
  if (yearsNum === 0) return '应届生';
  if (yearsNum === 1) return '1年以下';
  if (yearsNum < 3) return '1-3年';
  if (yearsNum < 5) return '3-5年';
  if (yearsNum < 10) return '5-10年';
  return '10年以上';
};

// 工具方法：格式化日期
const formatDate = (dateString?: string): string => {
  if (!dateString) return '未知';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

// 工具方法：处理公司Logo加载错误
const handleDetailLogoError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    const companyName = (img.dataset.companyName || '').trim();
    parent.innerHTML = `
      <div class="company-logo-placeholder-detail">
        ${getCompanyInitial(companyName)}
      </div>
    `;
  }
};

// 工具方法：获取公司名称首字母
const getCompanyInitial = (companyName?: string): string => {
  if (!companyName || companyName.trim().length === 0) return '公';
  const firstChar = companyName.trim().charAt(0);
  return firstChar.toUpperCase();
};

// 查看公司详情
const viewCompanyDetail = (companyId?: number) => {
  if (!companyId) {
    ElMessage.warning('暂无法查看该公司详情');
    return;
  }

  // 直接跳转到公司详情页面
  import('vue-router').then(({ useRouter }) => {
    const router = useRouter();
    router.push({
      path: `/company/${companyId}`
    });
  });
};

// 工具方法：解析标签JSON
const parseTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsedTags = JSON.parse(tags);
    return Array.isArray(parsedTags) ? parsedTags : [];
  } catch (error) {
    console.error('解析标签失败:', error);
    return [];
  }
};

onMounted(() => {
  fetchRecommendations();
});
</script>

<style scoped>
.recommendations-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.recommendation-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.recommendation-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.job-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.company-info {
  display: flex;
  gap: 12px;
  color: #606266;
  font-size: 14px;
}

.location {
  color: #909399;
}

.salary-range {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.job-tag {
  font-size: 12px;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.details-content {
  padding: 10px 0;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.overall-score {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.details-section {
  margin-bottom: 20px;
}

.details-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #909399;
  margin-right: 8px;
}

.info-item .value {
  color: #303133;
}

.match-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.match-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.match-row span {
  width: 80px;
  font-size: 14px;
  color: #606266;
}

.skills-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.skills-label {
  font-size: 14px;
  color: #606266;
}

.skill-tag {
  margin-right: 4px;
}

/* 职位详情对话框样式 */
.job-detail-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.detail-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.detail-title-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #303133;
  flex: 1;
}

.detail-salary {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
  margin-left: 20px;
}

.company-logo-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.company-logo-placeholder-detail {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  min-width: 40px;
}

.detail-company-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #409eff;
}

.detail-company-info h3 {
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.detail-company-info h3:hover {
  color: #1d68ce;
  text-decoration: underline;
}

.detail-basic-info {
  margin: 24px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-basic-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.el-row {
  margin-bottom: 0 !important;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  min-height: 32px;
}

.info-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  flex: 1;
}

.status-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.status-open {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.status-closed {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.detail-section {
  margin: 24px 0;
}

.detail-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.detail-content {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.detail-content pre {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.benefits-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.benefit-tag {
  font-size: 14px;
  padding: 0 12px;
  height: 32px;
  line-height: 30px;
}

.loading-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #409eff;
}

.loading-detail .loading-icon {
  font-size: 40px;
  margin-bottom: 10px;
  animation: spin 1.5s linear infinite;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 滚动条优化 */
.job-detail-content::-webkit-scrollbar {
  width: 6px;
}

.job-detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.job-detail-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.job-detail-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .recommendations-container {
    padding: 10px;
  }

  .recommendation-list {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .match-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .detail-title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-salary {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>

<template>
  <AppLayout>
    <div class="seeker-applications-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h2>我的投递</h2>
          <p class="header-subtitle">查看和管理您的职位投递记录</p>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            :loading="loading"
            @click="fetchApplications"
          >
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="6">
            <el-card shadow="never" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon total">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ totalApplications }}</div>
                  <div class="stat-label">总投递数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="6">
            <el-card shadow="never" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon pending">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ pendingCount }}</div>
                  <div class="stat-label">待查看</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="6">
            <el-card shadow="never" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon interviewing">
                  <el-icon><ChatDotSquare /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ interviewingCount }}</div>
                  <div class="stat-label">面试中</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="6">
            <el-card shadow="never" class="stat-card">
              <div class="stat-content">
                <div class="stat-icon success">
                  <el-icon><SuccessFilled /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ hiredCount }}</div>
                  <div class="stat-label">已录用</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && tableData.length === 0" class="loading-container">
        <div class="loading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>加载投递记录中...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="tableData.length === 0" class="empty-container">
        <el-empty description="暂无投递记录" image-size="200">
          <p>您还没有投递过任何职位</p>
          <el-button type="primary" @click="goToJobDiscovery">
            <el-icon><Position /></el-icon>
            去发现职位
          </el-button>
        </el-empty>
      </div>

      <!-- 投递列表 -->
      <div v-else class="applications-list">
        <el-card shadow="never">
          <template #header>
            <div class="table-header">
              <span>投递记录({{ totalApplications }} 条)</span>
              <el-button
                type="primary"
                text
                size="small"
                @click="fetchApplications"
                :loading="loading"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>

          <el-table
            :data="applicationsWithDetails.length > 0 ? applicationsWithDetails : tableData"
            v-loading="loading && tableData.length > 0"
            stripe
            style="width: 100%"
            :border="true"
          >
            <el-table-column label="职位信息" width="300">
              <template #default="{ row }">
                <div class="position-info" @click="viewJobDetailFromApp(row.id)" style="cursor: pointer">
                  <div class="position-header">
                    <h4 class="position-title">
                      {{ getPositionTitle(row) }}
                    </h4>
                    <div class="position-company">
                      <img 
                        v-if="row.position?.companyLogo" 
                        :src="row.position.companyLogo" 
                        alt="公司Logo"
                        class="company-logo-small"
                      />
                      <span>{{ getCompanyName(row) }}</span>
                    </div>
                  </div>
                  <div class="position-details">
                    <div class="salary-range" v-if="hasSalaryInfo(row)">
                      <el-tag size="small" type="danger">
                        {{ row.position?.salaryMin || 0 }}k-{{ row.position?.salaryMax || 0 }}k
                      </el-tag>
                    </div>
                    <div class="position-location">
                      <el-icon><Location /></el-icon>
                      <span>{{ getCityInfo(row) }}</span>
                    </div>
                    <div class="position-requirements" v-if="hasRequirementInfo(row)">
                      <span v-if="row.position?.educationMin" class="education">
                        学历: {{ formatEducation(row.position.educationMin) }}
                      </span>
                      <span v-if="row.position?.workYearsMin" class="experience">
                        经验: {{ formatExperience(row.position.workYearsMin) }}
                      </span>
                    </div>
                    <div v-else class="position-hint">
                      <span class="hint-text">点击查看职位详细要求和公司信息</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="投递状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="getStatusTagType(row.status)"
                  size="small"
                  round
                >
                  {{ APPLICATION_STATUS_MAP[row.status as ApplicationStatus] }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="投递时间" width="180">
              <template #default="{ row }">
                <div class="apply-time">
                  <div class="time">{{ formatDate(row.createTime) }}</div>
                  <div class="update-time" v-if="row.updateTime !== row.createTime">
                    更新: {{ formatDate(row.updateTime) }}
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="250" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewJobDetailFromApp(row.id)"
                    :loading="loadingPosition && selectedApplicationForPosition?.id === row.id"
                  >
                    查看职位
                  </el-button>
                  <el-button
                    type="success"
                    size="small"
                    plain
                    @click="viewCompanyInfo(row.id)"
                    :loading="loadingCompany && selectedApplicationForInfo?.id === row.id"
                  >
                    查看公司
                  </el-button>
                  <el-button
                    v-if="row.aiScore !== null && row.aiScore !== undefined"
                    size="small"
                    @click="showAiScoreDetail(row)"
                  >
                    AI评分: {{ row.aiScore.toFixed(1) }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container" v-if="totalApplications > pageSize">
            <el-pagination
              v-model:current-page="pageNum"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalApplications"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>

      <!-- 职位详情对话框 -->
      <JobDetailDialog
        v-if="selectedPosition"
        v-model="detailDialogVisible"
        :position="selectedPosition"
      />

      <!-- AI评分详情对话框 -->
      <el-dialog
        v-model="aiScoreDialogVisible"
        title="AI匹配度分析"
        width="400px"
      >
        <div v-if="selectedApplication" class="ai-score-detail">
          <div class="score-display">
            <el-rate
              v-model="selectedApplication.aiScore"
              disabled
              allow-half
              :max="5"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              text-color="#ff9900"
            />
            <div class="score-value">{{ selectedApplication.aiScore?.toFixed(1) || '未知' }}</div>
          </div>
          <div class="score-description">
            <p>AI匹配度是基于您的简历与职位要求进行智能分析的结果，评分越高表示匹配程度越好。</p>
            <p class="score-tip">建议分数4.0以上的职位重点关注！</p>
          </div>
        </div>
      </el-dialog>

      <!-- 公司信息对话框 -->
      <el-dialog
        v-model="companyDialogVisible"
        :title="`公司信息 - ${selectedApplicationForInfo?.positionTitle || ''}`"
        width="700px"
        top="5vh"
      >
        <div v-if="loadingCompany" class="loading-container">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>加载公司信息中...</p>
        </div>
        
        <div v-else-if="companyInfo" class="company-info-content">
          <!-- 公司基本信息 -->
          <div class="company-header">
            <div class="company-logo-name">
              <img 
                v-if="companyInfo.logo" 
                :src="companyInfo.logo" 
                alt="公司logo" 
                class="company-logo"
              />
              <div class="company-name-wrapper">
                <h3>{{ companyInfo.companyName }}</h3>
                <div class="company-tags">
                  <el-tag type="info">{{ companyInfo.industry || '未填写' }}</el-tag>
                  <el-tag>{{ SCALE_MAP[companyInfo.scale] || '未知规模' }}</el-tag>
                </div>
              </div>
            </div>
          </div>
          
          <div class="company-info-section">
            <h4>公司信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">所在城市：</span>
                <span class="info-value">{{ companyInfo.city || '未填写' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">企业规模：</span>
                <span class="info-value">{{ SCALE_MAP[companyInfo.scale] || '未填写' }}</span>
              </div>
            </div>
          </div>
          
          <div class="company-description-section" v-if="companyInfo.description">
            <h4>公司简介</h4>
            <div class="description-content">
              {{ companyInfo.description }}
            </div>
          </div>
          
          <div v-else class="empty-description">
            <p>暂无公司简介</p>
          </div>
        </div>
        
        <div v-else class="error-container">
          <el-empty description="加载公司信息失败">
            <p>无法加载公司信息，请稍后重试</p>
          </el-empty>
        </div>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Loading, Location, Document, Timer, ChatDotSquare, SuccessFilled, Position } from '@element-plus/icons-vue'
import AppLayout from '@/components/AppLayout.vue'
import JobDetailDialog from '@/components/JobDetailDialog.vue'
import { getSeekerApplications, getCompanyFromApplication, getPositionFromApplication, getApplicationDetail } from '@/utils/api'
import type { ApplicationInfo, ApplicationStatus, PositionInfo, EducationLevel, CompanyFromApplication, PositionFromApplication } from '@/types'
import { APPLICATION_STATUS_MAP, SCALE_MAP } from '@/types'

const router = useRouter()

// 分页
const pageNum = ref(1)
const pageSize = ref(10)

// 数据
const loading = ref(true)
const totalApplications = ref(0)
const tableData = ref<ApplicationInfo[]>([])

// 对话框
const detailDialogVisible = ref(false)
const aiScoreDialogVisible = ref(false)
const companyDialogVisible = ref(false)
const selectedPosition = ref<PositionInfo | null>(null)
const companyInfo = ref<CompanyFromApplication | null>(null)
const loadingCompany = ref(false)
const loadingPosition = ref(false)
const selectedApplicationForInfo = ref<ApplicationInfo | null>(null)
const selectedApplicationForPosition = ref<ApplicationInfo | null>(null)
const selectedApplication = ref<ApplicationInfo | null>(null)
const positionCache = ref<Record<number, PositionFromApplication>>({})

// 学历映射
const educationMap: Record<EducationLevel, string> = {
  1: '高中及以下',
  2: '大专',
  3: '本科',
  4: '硕士',
  5: '博士'
}

// 计算属性
const pendingCount = computed(() => {
  return tableData.value.filter(item => item.status === 1).length
})

const interviewingCount = computed(() => {
  return tableData.value.filter(item => item.status === 3).length
})

const hiredCount = computed(() => {
  return tableData.value.filter(item => item.status === 5).length
})

// 详细数据
const applicationsWithDetails = ref<ApplicationInfo[]>([])
const loadingDetails = ref(false)

// 获取投递列表
const fetchApplications = async () => {
  try {
    loading.value = true
    const response = await getSeekerApplications({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    
    const records = response.records || []
    tableData.value = records
    totalApplications.value = response.total || 0
    
    // 清除之前的缓存
    positionCache.value = {}
    applicationsWithDetails.value = []
    
    // 批量获取详细信息（如果有记录）
    if (records.length > 0) {
      await fetchApplicationsDetails(records)
    }
    
  } catch (error) {
    console.error('获取投递列表失败', error)
    ElMessage.error('获取投递列表失败')
    tableData.value = []
    totalApplications.value = 0
    applicationsWithDetails.value = []
  } finally {
    loading.value = false
  }
}

// 批量获取投递记录详细信息
const fetchApplicationsDetails = async (records: ApplicationInfo[]) => {
  try {
    loadingDetails.value = true
    
    // 使用Promise.all并行获取所有详情
    const detailPromises = records.map(record => 
      getApplicationDetail(record.id).then(response => {
        return {
          ...record,
          // 如果有详情数据，则合并
          companyName: response.application?.companyName || record.companyName,
          positionTitle: response.application?.positionTitle || record.positionTitle,
          position: response.application?.position ? {
            ...record.position,
            ...response.application.position
          } : record.position
        }
      }).catch(error => {
        console.error(`获取投递${record.id}的详情失败:`, error)
        // 如果详情请求失败，返回原始记录
        return record
      })
    )
    
    const detailedRecords = await Promise.all(detailPromises)
    applicationsWithDetails.value = detailedRecords
    
    // 更新缓存
    detailedRecords.forEach(record => {
      if (record.position && record.positionId) {
        positionCache.value[record.positionId] = record.position as PositionFromApplication
      }
    })
    
  } catch (error) {
    console.error('批量获取详情失败:', error)
    // 不显示错误信息，因为这只是增强功能
  } finally {
    loadingDetails.value = false
  }
}



// 查看公司信息
const viewCompanyInfo = async (applicationId: number) => {
  try {
    loadingCompany.value = true
    // 查找对应的应用
    const app = tableData.value.find(item => item.id === applicationId)
    selectedApplicationForInfo.value = app || null
    
    const response = await getCompanyFromApplication(applicationId)
    companyInfo.value = response
    companyDialogVisible.value = true
  } catch (error) {
    console.error('获取公司信息失败:', error)
    ElMessage.error('获取公司信息失败')
  } finally {
    loadingCompany.value = false
  }
}

// 通过投递记录查看职位详情
const viewJobDetailFromApp = async (applicationId: number) => {
  try {
    loadingPosition.value = true
    // 查找对应的应用
    const app = tableData.value.find(item => item.id === applicationId)
    selectedApplicationForPosition.value = app || null
    
    // 首先尝试从缓存中获取
    if (positionCache.value[app?.positionId || 0]) {
      selectedPosition.value = positionCache.value[app?.positionId || 0] as PositionInfo
      detailDialogVisible.value = true
      return
    }
    
    const response = await getPositionFromApplication(applicationId)
    // 存入缓存
    if (response && app?.positionId) {
      positionCache.value[app.positionId] = response
    }
    selectedPosition.value = response as PositionInfo
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取职位信息失败:', error)
    ElMessage.error('获取职位信息失败')
  } finally {
    loadingPosition.value = false
  }
}

// 显示AI评分详情
const showAiScoreDetail = (application: ApplicationInfo) => {
  selectedApplication.value = application
  aiScoreDialogVisible.value = true
}

// 前往发现职位页面
const goToJobDiscovery = () => {
  router.push('/discover')
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  pageNum.value = 1
  fetchApplications()
}

const handleCurrentChange = (val: number) => {
  pageNum.value = val
  fetchApplications()
}

// 工具函数
const formatDate = (dateString: string): string => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

const formatEducation = (educationLevel?: EducationLevel): string => {
  if (!educationLevel) return '不限'
  return educationMap[educationLevel] || '未知'
}

const formatExperience = (years?: number): string => {
  if (years === undefined || years === null) return '不限'
  if (years === 0) return '应届生'
  if (years === 1) return '1年以内'
  if (years < 3) return '1-3年'
  if (years < 5) return '3-5年'
  if (years < 10) return '5-10年'
  return '10年以上'
}

const getStatusTagType = (status: number): string => {
  const typeMap: Record<number, string> = {
    1: 'info',      // 待查看-蓝色
    2: '',          // 已查看-默认
    3: 'warning',   // 面试中-橙色
    4: 'danger',    // 不合格-红色
    5: 'success'    // 录用 - 绿色
  }
  return typeMap[status] || ''
}

// 辅助函数：获取职位标题
const getPositionTitle = (row: ApplicationInfo): string => {
  if (row.positionTitle) return row.positionTitle
  if (row.position?.title) return row.position.title
  return `职位-${row.positionId}`
}

// 辅助函数：获取公司名称
const getCompanyName = (row: ApplicationInfo): string => {
  if (row.companyName) return row.companyName
  if (row.position?.companyName) return row.position.companyName
  return `公司-${row.companyId}`
}

// 辅助函数：获取城市信息
const getCityInfo = (row: ApplicationInfo): string => {
  if (row.position?.city) return row.position.city
  if (positionCache.value[row.positionId]?.city) return positionCache.value[row.positionId].city
  return '点击查看详情'
}

// 辅助函数：检查是否有薪资信息
const hasSalaryInfo = (row: ApplicationInfo): boolean => {
  return !!(row.position?.salaryMin || row.position?.salaryMax)
}

// 辅助函数：检查是否有要求信息
const hasRequirementInfo = (row: ApplicationInfo): boolean => {
  return !!(row.position?.educationMin || row.position?.workYearsMin)
}

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
.seeker-applications-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.header-left h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
}

.header-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.total {
  background: #e8f4ff;
  color: #409eff;
}

.stat-icon.pending {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.interviewing {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.success {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

/* 加载状态 */
.loading-container,
.empty-container {
  padding: 60px 20px;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading-content {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  font-size: 40px;
  color: #409eff;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 职位信息样式 */
.position-info {
  padding: 8px 0;
}

.position-header {
  margin-bottom: 8px;
}

.position-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.position-company {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.company-logo-small {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  object-fit: cover;
}

.position-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.salary-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.position-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.position-hint {
  margin-top: 8px;
}

.hint-text {
  font-size: 11px;
  color: #67c23a;
  font-style: italic;
  background: #f0f9eb;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.education,
.experience {
  padding: 2px 6px;
  background: #f8f9fa;
  border-radius: 3px;
}

/* 投递时间 */
.apply-time {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time {
  font-size: 14px;
  color: #303133;
}

.update-time {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* AI评分详情对话框 */
.ai-score-detail {
  text-align: center;
  padding: 20px;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  color: #ff9900;
}

.score-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  text-align: left;
}

.score-tip {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff2e5;
  border-radius: 6px;
  color: #e6a23c;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .seeker-applications-container {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-section .el-col {
    margin-bottom: 16px;
  }
  
  .position-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .position-requirements {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
  
  .action-buttons {
    flex-direction: row;
  }
}
</style>
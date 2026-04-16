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
            :data="tableData"
            v-loading="loading && tableData.length > 0"
            stripe
            style="width: 100%"
            :border="true"
          >
            <el-table-column label="职位信息" width="320">
              <template #default="{ row }">
                <div class="position-info" @click="viewJobDetailFromApp(row.id)" style="cursor: pointer">
                  <div class="position-header">
                    <div class="position-title-wrapper">
                      <el-tooltip :content="getPositionTitle(row)" placement="top">
                        <h4 class="position-title">
                          {{ getPositionTitle(row) }}
                        </h4>
                      </el-tooltip>
                      <el-tag v-if="row.status === 5" type="success" size="small">录用</el-tag>
                      <el-tag v-else-if="row.status === 3" type="warning" size="small">面试中</el-tag>
                      <el-tag v-else-if="row.status === 4" type="danger" size="small">不合适</el-tag>
                    </div>
                    <div class="position-company">
                      <el-avatar 
                        v-if="row.position?.companyLogo || row.company?.logo" 
                        :src="row.position?.companyLogo || row.company?.logo" 
                        :size="16"
                        shape="square"
                        class="company-logo-small"
                      />
                      <el-tooltip :content="getCompanyName(row)" placement="top">
                        <span class="company-name">{{ getCompanyName(row) }}</span>
                      </el-tooltip>
                      <el-tag v-if="row.position?.category" size="mini" type="info">{{ row.position.category }}</el-tag>
                    </div>
                  </div>
                  <div class="position-details">
                    <div class="position-metadata">
                      <div class="salary-range" v-if="hasSalaryInfo(row)">
                        <span class="salary-icon">💰</span>
                        <span class="salary-text">
                          {{ formatSalary(row) }}
                        </span>
                      </div>
                      <div class="position-location" v-if="getCityInfo(row) && getCityInfo(row) !== '点击查看详情'">
                        <el-icon><Location /></el-icon>
                        <span>{{ getCityInfo(row) }}</span>
                      </div>
                      <div class="ai-score-badge" v-if="row.aiScore !== null && row.aiScore !== undefined">
                        <el-rate
                          v-model="row.aiScore"
                          disabled
                          allow-half
                          :max="5"
                          :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                          text-color="#ff9900"
                          size="small"
                        />
                        <span class="ai-score-text">{{ row.aiScore.toFixed(1) }}</span>
                      </div>
                    </div>
                    
                    <div class="position-requirements" v-if="hasRequirementInfo(row)">
                      <el-tag v-if="row.position?.educationMin" size="mini">
                        学历: {{ formatEducation(row.position.educationMin) }}
                      </el-tag>
                      <el-tag v-if="row.position?.workYearsMin" size="mini" type="info">
                        经验: {{ formatExperience(row.position.workYearsMin) }}
                      </el-tag>
                    </div>
                    
                    <div v-if="!hasRequirementInfo(row) && !hasSalaryInfo(row) && !hasCityInfo(row)" class="position-hint">
                      <span class="hint-text">
                        <el-icon><InfoFilled /></el-icon>
                        点击查看职位详细要求和公司信息
                      </span>
                    </div>
                    
                    <div class="apply-time-sm" v-if="row.createTime">
                      投递时间: {{ formatDateShort(row.createTime) }}
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
                  {{ getStatusLabel(row.status) }}
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
              :current-page="pageNum"
              :page-size="pageSize"
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

      
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Loading, Location, Document, Timer, ChatDotSquare, SuccessFilled, Position, InfoFilled } from '@element-plus/icons-vue'
// 动态导入组件
const AppLayout = defineAsyncComponent(() => import('../components/AppLayout.vue'))
const JobDetailDialog = defineAsyncComponent(() => import('../components/JobDetailDialog.vue'))
import { getSeekerApplications, getPositionFromApplication } from '../utils/api'
import { useUserStore } from '../stores/userStore'
import type { ApplicationInfo, PositionInfo, EducationLevel, PositionFromApplication } from '../types'
import { APPLICATION_STATUS_MAP } from '../types'

const router = useRouter()
const userStore = useUserStore()

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
const selectedPosition = ref<PositionInfo | null>(null)
const loadingPosition = ref(false)
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

// 计算属性 (注意：目前仅统计当前页数据，完整统计需后端支持)
const pendingCount = computed(() => {
  return tableData.value.filter(item => item.status === 1).length
})

const interviewingCount = computed(() => {
  return tableData.value.filter(item => item.status === 3).length
})

const hiredCount = computed(() => {
  return tableData.value.filter(item => item.status === 5).length
})

// 获取投递列表
const fetchApplications = async () => {
  try {
    loading.value = true
    
    const response = await getSeekerApplications({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    
    const records = response.records || []
    totalApplications.value = response.total || 0
    
    // 简化数据处理：直接使用API返回的字段
    const enhancedRecords = records.map((record: ApplicationInfo) => ({
      ...record,
      positionTitle: record.positionTitle || `职位-${record.positionId}`,
      companyName: record.companyName || `公司-${record.companyId}`,
      position: record.position || { id: record.positionId, title: record.positionTitle || `职位-${record.positionId}` }
    } as ApplicationInfo))
    
    tableData.value = enhancedRecords
    
    // 清除之前的缓存
    positionCache.value = {}
    
    // 立即刷新全局计数
    userStore.refreshCounts()
  } catch (error) {
    console.error('获取投递列表失败', error)
    ElMessage.error('获取投递列表失败')
    tableData.value = []
    totalApplications.value = 0
  } finally {
    loading.value = false
  }
}

// 不再需要批量获取详情函数，因为API已直接返回关键字段
// 职位详情在需要查看时通过viewJobDetailFromApp函数获取



// 查看公司信息 - 跳转到公司详情页面
const viewCompanyInfo = async (applicationId: number) => {
  try {
    // 查找对应的应用获取公司ID
    const app = tableData.value.find(item => item.id === applicationId)
    if (!app?.companyId) {
      ElMessage.warning('暂无法查看该公司详情')
      return
    }
    
    // 跳转到公司详情页面
    router.push({
      path: `/company/${app.companyId}`
    })
  } catch (error) {
    console.error('查看公司详情失败:', error)
    ElMessage.error('查看公司详情失败，请稍后重试')
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

// 格式化薪资显示
const formatSalary = (row: ApplicationInfo): string => {
  const position = row.position as any
  if (position?.salaryMin && position?.salaryMax) {
    return `${position.salaryMin}k-${position.salaryMax}k`
  } else if (position?.salaryMin) {
    return `${position.salaryMin}k以上`
  } else if (position?.salaryMax) {
    return `${position.salaryMax}k以下`
  } else if (position?.salary) {
    return `${position.salary}k`
  }
  return '面议'
}

// 格式化短日期
const formatDateShort = (dateString: string): string => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        if (diffMinutes < 1) return '刚刚'
        return `${diffMinutes}分钟前`
      }
      return `${diffHours}小时前`
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      })
    }
  } catch (error) {
    return dateString
  }
}

// 检查是否有城市信息
const hasCityInfo = (row: ApplicationInfo): boolean => {
  const cityInfo = getCityInfo(row)
  return !!cityInfo && cityInfo !== '点击查看详情'
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

const getStatusLabel = (status: any): string => {
  return (APPLICATION_STATUS_MAP as Record<number, string>)[status as number] || '未知'
}

// 辅助函数：获取职位标题
const getPositionTitle = (row: ApplicationInfo): string => {
  return row.positionTitle || `职位-${row.positionId}`
}

// 辅助函数：获取公司名称
const getCompanyName = (row: ApplicationInfo): string => {
  return row.companyName || `公司-${row.companyId}`
}

// 辅助函数：获取城市信息
const getCityInfo = (row: ApplicationInfo): string => {
  if (row.position?.city) return row.position.city
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
  console.log('SeekerApplications组件已挂载，开始加载数据')
  
  // 添加延迟加载以避免可能的初始化问题
  setTimeout(() => {
    fetchApplications()
  }, 100)
})

// 添加智能缓存管理
const clearCache = () => {
  positionCache.value = {}
  console.log('已清除职位缓存')
}

// 添加手动刷新功能（可以从控制台调用）
const manualRefresh = () => {
  console.log('手动刷新投递记录')
  clearCache()
  fetchApplications()
}



// 暴露一些方法供调试使用
defineExpose({
  fetchApplications,
  clearCache,
  manualRefresh,
  positionCache
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

/* 职位信息新样式 */
.position-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.position-company {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.position-company .company-name {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.position-metadata {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.salary-range {
  display: flex;
  align-items: center;
  gap: 4px;
}

.salary-icon {
  font-size: 12px;
}

.salary-text {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 500;
}

.ai-score-badge {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-score-text {
  font-size: 11px;
  color: #ff9900;
  font-weight: 600;
}

.apply-time-sm {
  font-size: 11px;
  color: #909399;
  font-style: italic;
  margin-top: 4px;
}

.position-metadata .position-location {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #909399;
}

/* 职位信息样式增强 */
.position-info:hover {
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.position-header {
  margin-bottom: 8px;
}

.position-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1.3;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.position-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.position-requirements {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.position-hint {
  margin-top: 4px;
}

.hint-text {
  font-size: 11px;
  color: #67c23a;
  font-style: italic;
  background: #f0f9eb;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.hint-text .el-icon {
  font-size: 11px;
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
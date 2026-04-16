<template>
  <AppLayout>
    <div class="boss-applications-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h2>投递管理</h2>
          <p class="header-subtitle">查看求职者投递的简历，管理投递状态</p>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            :loading="loading"
            @click="fetchApplications"
            :disabled="!hasMoreFilters"
          >
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-card shadow="never">
          <div class="filter-content">
            <div class="filter-row">
              <div class="filter-group">
                <span class="filter-label">投递状态：</span>
                <el-select
                  v-model="filterStatus"
                  placeholder="全部状态"
                  style="width: 180px"
                  clearable
                  @change="handleFilterStatusChange"
                >
                  <el-option label="全部" value="" />
                  <el-option
                    v-for="(label, value) in APPLICATION_STATUS_MAP"
                    :key="value"
                    :label="label"
                    :value="value"
                  />
                </el-select>
              </div>

              <el-button
                type="primary"
                plain
                @click="fetchApplications"
                :loading="loading"
              >
                <el-icon><Search /></el-icon>搜索
              </el-button>
              <el-button @click="resetFilters" :disabled="!hasActiveFilters">
                <el-icon><Refresh /></el-icon>重置
              </el-button>
            </div>

            <!-- 统计信息 -->
            <div class="stats-row">
              <el-space :size="16">
                <el-statistic title="总投递数" :value="totalApplications" />
                <el-statistic title="待查看" :value="pendingCount" :value-style="{ color: '#f56c6c' }" />
                <el-statistic title="面试中" :value="interviewingCount" :value-style="{ color: '#e6a23c' }" />
                <el-statistic title="已录用" :value="hiredCount" :value-style="{ color: '#67c23a' }" />
              </el-space>
            </div>
          </div>
        </el-card>
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
          <p>还没有求职者投递您的职位</p>
        </el-empty>
      </div>

      <!-- 投递列表 -->
      <div v-else class="applications-list">
        <el-card shadow="never">
          <template #header>
            <div class="table-header">
              <span>投递记录 ({{ totalApplications }} 条)</span>
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
            <el-table-column label="求职者" width="180">
              <template #default="{ row }">
                <div class="applicant-info">
                  <div v-if="row.jobSeeker?.avatar" class="applicant-avatar">
                    <img 
                      :src="row.jobSeeker.avatar" 
                      :alt="row.jobSeekerName || row.jobSeeker?.name || `求职者-${row.jobSeekerId}`"
                      @error="handleAvatarError($event, row)" 
                    />
                  </div>
                  <div v-else class="default-avatar">
                    {{ getInitials(row.jobSeekerName) }}
                  </div>
                  <div class="applicant-details">
                    <div class="applicant-name" :title="row.jobSeekerName">
                      {{ row.jobSeekerName }}
                    </div>
                    <div class="applicant-meta">
                      <el-tag size="small" v-if="row.jobSeeker?.workYears">
                        {{ row.jobSeeker.workYears }}年经验
                      </el-tag>
                      <el-tag size="small" v-if="row.jobSeeker?.expectedSalary" type="warning">
                        {{ row.jobSeeker.expectedSalary }}万/年
                      </el-tag>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="positionTitle" label="投递职位" width="180">
              <template #default="{ row }">
                <div class="position-info">
                  <div class="position-title" :title="row.positionTitle">
                    {{ row.positionTitle }}
                  </div>
                  <div class="position-meta">
                    <span class="salary" v-if="row.position?.salaryMin && row.position?.salaryMax">
                      {{ row.position.salaryMin }}k-{{ row.position.salaryMax }}k
                    </span>
                    <span class="salary" v-else-if="row.position?.salary">
                      {{ row.position.salary }}
                    </span>
                    <span class="no-salary" v-else>面议</span>
                    <span class="city" v-if="row.position?.city">
                      <el-icon><Location /></el-icon>
                      {{ row.position.city }}
                    </span>
                    <span class="city" v-else-if="row.position?.workPlace">
                      <el-icon><Location /></el-icon>
                      {{ row.position.workPlace }}
                    </span>
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

            <el-table-column label="AI评分" width="100" align="center">
              <template #default="{ row }">
                <div v-if="row.aiScore !== null && row.aiScore !== undefined" class="ai-score">
                  <el-rate
                    v-model="row.aiScore"
                    disabled
                    allow-half
                    :max="5"
                    :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                    text-color="#ff9900"
                  />
                  <span class="score-value">{{ row.aiScore.toFixed(1) }}</span>
                </div>
                <span v-else class="no-score">待评估</span>
              </template>
            </el-table-column>

            <el-table-column prop="createTime" label="投递时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="450" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewApplicationDetail(row)"
                    :disabled="loadingDetail"
                  >
                    查看详情
                  </el-button>
                  
                  <el-button
                    type="warning"
                    size="small"
                    plain
                    @click="viewJobSeekerInfo(row.id)"
                    :loading="loadingJobSeeker && selectedApplicationForInfo?.id === row.id"
                  >
                    求职者简历
                  </el-button>
                  
                  <el-button
                    type="success"
                    size="small"
                    plain
                    @click="viewPositionInfo(row.id)"
                    :loading="loadingPosition && selectedApplicationForInfo?.id === row.id"
                  >
                    职位详情
                  </el-button>
                  
                  <el-button
                    :type="row.isFavorite ? 'warning' : 'info'"
                    size="small"
                    plain
                    @click="handleFavorite(row)"
                  >
                    <el-icon><Star /></el-icon>
                    {{ row.isFavorite ? '已收藏' : '收藏' }}
                  </el-button>
                  
                  <el-dropdown
                    size="small"
                    trigger="click"
                    @command="(command: string) => handleStatusChangeMenu(row, command)"
                    :disabled="loadingStatusChange"
                  >
                    <el-button type="info" size="small" plain>
                      更新状态
                      <el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="(label, value) in APPLICATION_STATUS_MAP"
                          :key="value"
                          :command="value"
                          :disabled="row.status === parseInt(value)"
                        >
                          {{ label }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container" v-if="totalApplications > pageSize">
            <el-pagination
              v-model:current-page="pageNum"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalApplications"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>

      <!-- 投递详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        :title="`查看详情 - ${selectedApplication?.positionTitle || '未知职位'}`"
        width="900px"
        top="5vh"
        @close="handleDetailDialogClose"
      >
        <ApplicationDetailDialog
          v-if="selectedApplication"
          :application="selectedApplication"
          @status-updated="handleStatusUpdated"
        />
      </el-dialog>

      <!-- 求职者信息对话框 -->
      <el-dialog
        v-model="jobSeekerDialogVisible"
        :title="`求职者信息 - ${selectedApplicationForInfo?.jobSeekerName || ''}`"
        width="800px"
        top="5vh"
      >
        <div v-if="loadingJobSeeker" class="loading-container">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>加载求职者信息中...</p>
        </div>
        
        <div v-else-if="jobSeekerInfo" class="job-seeker-info-content">
          <!-- 求职者基本信息 -->
          <div class="job-seeker-header">
            <div class="job-seeker-avatar-name">
              <img 
                v-if="jobSeekerInfo.avatar" 
                :src="jobSeekerInfo.avatar" 
                alt="求职者头像" 
                class="job-seeker-avatar"
              />
              <div class="job-seeker-name-wrapper">
                <h3>{{ jobSeekerInfo.name }}</h3>
                <div class="job-seeker-meta">
                  <el-tag size="small">{{ jobSeekerInfo.gender === 1 ? '男' : '女' }}</el-tag>
                  <el-tag size="small" type="info">{{ jobSeekerInfo.age }}岁</el-tag>
                  <el-tag size="small" type="warning">{{ jobSeekerInfo.workYears }}年经验</el-tag>
                  <el-tag size="small" type="success">
                    <el-icon><Location /></el-icon>
                    {{ jobSeekerInfo.city }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
          
          <div class="job-seeker-info-section">
            <h4>基本信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">手机号：</span>
                <span class="info-value">{{ jobSeekerInfo.phone || '未填写' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">邮箱：</span>
                <span class="info-value">{{ jobSeekerInfo.email || '未填写' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">所在城市：</span>
                <span class="info-value">{{ jobSeekerInfo.city || '未填写' }}</span>
              </div>
            </div>
          </div>
          
          <div class="job-seeker-introduction-section" v-if="jobSeekerInfo.introduction">
            <h4>个人简介</h4>
            <div class="introduction-content">
              {{ jobSeekerInfo.introduction }}
            </div>
          </div>
          
          <div class="job-seeker-skills-section" v-if="jobSeekerInfo.skills">
            <h4>技能标签</h4>
            <div class="skills-container">
              <el-tag
                v-for="skill in parseSkills(jobSeekerInfo.skills)"
                :key="skill"
                class="skill-tag"
                size="medium"
                type="info"
              >
                {{ skill }}
              </el-tag>
            </div>
          </div>
          
          <div class="job-seeker-resume-section" v-if="jobSeekerInfo.resumeUrl">
            <h4>简历附件</h4>
            <div class="resume-action">
              <el-button 
                type="primary" 
                @click="openResume(jobSeekerInfo!.resumeUrl!)"
                :loading="loadingResume"
              >
                <el-icon><Document /></el-icon>
                查看完整简历
              </el-button>
              <p class="resume-tip">点击上方按钮在新窗口查看求职者完整简历</p>
            </div>
          </div>
        </div>
        
        <div v-else class="error-container">
          <el-empty description="加载求职者信息失败">
            <p>无法加载求职者信息，请稍后重试</p>
          </el-empty>
        </div>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="jobSeekerDialogVisible = false">关闭</el-button>
            <el-button
              v-if="jobSeekerInfo?.resumeUrl"
              type="primary"
              @click="openResume(jobSeekerInfo!.resumeUrl!)"
            >
              查看附件简历
            </el-button>
            <el-button
              type="primary"
              plain
              @click="viewOnlineResume(selectedApplicationForInfo?.id || 0)"
            >
              查看在线简历
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 职位信息对话框 -->
      <el-dialog
        v-model="positionDialogVisible"
        :title="`职位信息 - ${selectedApplicationForInfo?.positionTitle || ''}`"
        width="800px"
        top="5vh"
      >
        <div v-if="loadingPosition" class="loading-container">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>加载职位信息中...</p>
        </div>
        
        <div v-else-if="positionInfo" class="position-info-content">
          <!-- 职位基本信息 -->
          <div class="position-header">
            <div class="position-title-salary">
              <h3>{{ positionInfo.title }}</h3>
              <div class="position-salary">
                {{ positionInfo.salaryMin ? `${positionInfo.salaryMin}k` : '面议' }}
                {{ positionInfo.salaryMax ? `- ${positionInfo.salaryMax}k` : '' }}
              </div>
            </div>
            
            <div class="position-meta">
              <el-tag>{{ positionInfo.category || '未知类别' }}</el-tag>
              <el-tag type="info">
                <el-icon><Location /></el-icon>
                {{ positionInfo.city || '未知城市' }}
              </el-tag>
            </div>
          </div>
          
          <div class="position-description-section" v-if="positionInfo.description">
            <h4>岗位职责</h4>
            <div class="description-content">
              {{ positionInfo.description }}
            </div>
          </div>
          
          <div class="position-requirement-section" v-if="positionInfo.requirement">
            <h4>任职要求</h4>
            <div class="requirement-content">
              {{ positionInfo.requirement }}
            </div>
          </div>
          
          <div v-if="!positionInfo.description && !positionInfo.requirement" class="empty-content">
            <p>暂无职位详细信息</p>
          </div>
        </div>
        
        <div v-else class="error-container">
          <el-empty description="加载职位信息失败">
            <p>无法加载职位信息，请稍后重试</p>
          </el-empty>
        </div>
      </el-dialog>

      <!-- 在线简历对话框 -->
      <el-dialog
        v-model="onlineResumeDialogVisible"
        :title="`求职者完整在线简历`"
        width="900px"
        top="5vh"
      >
        <JobSeekerOnlineResumeDialog
          v-if="onlineResumeDialogVisible && onlineResumeApplicationId"
          :application-id="onlineResumeApplicationId"
        />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="onlineResumeDialogVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Loading, Location, ArrowDown, Document, Star } from '@element-plus/icons-vue'
import AppLayout from '../components/AppLayout.vue'
import ApplicationDetailDialog from '../components/application/ApplicationDetailDialog.vue'
import JobSeekerOnlineResumeDialog from '../components/application/JobSeekerOnlineResumeDialog.vue'
import { useUserStore } from '../stores/userStore'
import { 
  getBossApplications, 
  updateApplicationStatus, 
  getJobSeekerSimpleFromApplication,
  getPositionFromApplication,
  markApplicationAsRead,
  addFavorite, 
  removeFavorite, 
  checkFavorite
} from '../utils/api'
import type { ApplicationInfo, ApplicationStatus, JobSeekerFromApplication, PositionFromApplication } from '../types'
import { APPLICATION_STATUS_MAP } from '../types'

const userStore = useUserStore()

// 筛选项
const filterStatus = ref<string>('')

// 分页
const pageNum = ref(1)
const pageSize = ref(10)

// 数据
const loading = ref(true)
const loadingDetail = ref(false)
const loadingStatusChange = ref(false)
const totalApplications = ref(0)
const tableData = ref<ApplicationInfo[]>([])

// 详情对话框
const detailDialogVisible = ref(false)
const selectedApplication = ref<ApplicationInfo | null>(null)

// 求职者信息对话框
const jobSeekerDialogVisible = ref(false)
const jobSeekerInfo = ref<JobSeekerFromApplication | null>(null)
const loadingJobSeeker = ref(false)

// 职位信息对话框
const positionDialogVisible = ref(false)
const positionInfo = ref<PositionFromApplication | null>(null)
const loadingPosition = ref(false)

// 简历加载状态
const loadingResume = ref(false)

// 在线简历对话框
const onlineResumeDialogVisible = ref(false)
const onlineResumeApplicationId = ref<number | null>(null)

// 当前查看信息的应用ID
const selectedApplicationForInfo = ref<ApplicationInfo | null>(null)

// 计算属性
const hasActiveFilters = computed(() => {
  return filterStatus.value !== ''
})

const hasMoreFilters = computed(() => {
  return true // 可以扩展更多筛选条件
})

// 状态统计 (注意：目前仅统计当前页数据，完整统计需后端支持)
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
    const params = {
      status: filterStatus.value ? parseInt(filterStatus.value) as ApplicationStatus : undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    
    const response = await getBossApplications(params)
    
    if (!response) {
      tableData.value = []
      totalApplications.value = 0
      return
    }
    
    const records = response.records || []
    
    const enhancedRecords = await Promise.all(records.map(async (record: ApplicationInfo) => {
      // 检查是否已收藏该求职者
      let isFavorite = false
      try {
        const response = await checkFavorite(3, record.jobSeekerId)
        isFavorite = response.isFavorite
      } catch (error) {
        console.error('检查收藏状态失败:', error)
      }
      
      return {
        ...record,
        jobSeekerName: record.jobSeekerName || `求职者-${record.jobSeekerId}`,
        positionTitle: record.positionTitle || `职位-${record.positionId}`,
        companyName: record.companyName || `公司-${record.companyId}`,
        aiScore: record.aiScore || 0,
        isFavorite
      } as ApplicationInfo & { isFavorite: boolean }
    }))
    
    tableData.value = enhancedRecords
    totalApplications.value = response.total || 0
  } catch (error: any) {
    console.error('获取投递列表失败:', error)
    ElMessage.error('获取投递列表失败：' + (error.message || '网络错误'))
    tableData.value = []
    totalApplications.value = 0
  } finally {
    loading.value = false
  }
}

// 查看投递详情
const viewApplicationDetail = async (application: ApplicationInfo) => {
  selectedApplication.value = application
  detailDialogVisible.value = true
  
  // 标记为已查看
  if (application.status === 1) {
    try {
      await markApplicationAsRead(application.id)
      application.status = 2
      // 立即刷新全局计数
      userStore.refreshCounts()
    } catch (error) {
      console.error('标记已查看失败:', error)
    }
  }
}

// 查看求职者信息
const viewJobSeekerInfo = async (applicationId: number) => {
  try {
    loadingJobSeeker.value = true
    const app = tableData.value.find(item => item.id === applicationId)
    selectedApplicationForInfo.value = app || null
    
    const response = await getJobSeekerSimpleFromApplication(applicationId)
    jobSeekerInfo.value = response
    
    // 标记为已查看
    if (app && app.status === 1) {
      try {
        await markApplicationAsRead(applicationId)
        app.status = 2
        // 立即刷新全局计数
        userStore.refreshCounts()
      } catch (error) {
        console.error('标记已查看失败:', error)
      }
    }
    
    jobSeekerDialogVisible.value = true
  } catch (error) {
    console.error('获取求职者信息失败:', error)
    ElMessage.error('获取求职者信息失败')
  } finally {
    loadingJobSeeker.value = false
  }
}

// 查看求职者完整在线简历
const viewOnlineResume = (applicationId: number) => {
  onlineResumeApplicationId.value = applicationId
  onlineResumeDialogVisible.value = true
}

// 查看职位信息
const viewPositionInfo = async (applicationId: number) => {
  try {
    loadingPosition.value = true
    const app = tableData.value.find(item => item.id === applicationId)
    selectedApplicationForInfo.value = app || null
    
    const response = await getPositionFromApplication(applicationId)
    positionInfo.value = response
    positionDialogVisible.value = true
  } catch (error) {
    console.error('获取职位信息失败:', error)
    ElMessage.error('获取职位信息失败')
  } finally {
    loadingPosition.value = false
  }
}

// 处理状态筛选变化
const handleFilterStatusChange = () => {
  pageNum.value = 1
  fetchApplications()
}

// 更新投递状态
const handleStatusChangeMenu = async (application: ApplicationInfo, newStatus: string) => {
  try {
    loadingStatusChange.value = true
    
    await ElMessageBox.confirm(
      `确定要将"${application.jobSeekerName || '该求职者'}"的投递状态更新为"${APPLICATION_STATUS_MAP[parseInt(newStatus) as ApplicationStatus]}"吗？`,
      '确认更新',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    
    await updateApplicationStatus({
      id: application.id,
      status: parseInt(newStatus) as ApplicationStatus
    })
    
    ElMessage.success('投递状态更新成功')
    
    // 立即刷新全局计数
    userStore.refreshCounts()
    
    // 更新本地数据
    const index = tableData.value.findIndex(item => item.id === application.id)
    if (index !== -1) {
      tableData.value[index].status = parseInt(newStatus) as ApplicationStatus
    }
    
  } catch (error) {
    console.error('更新状态失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('更新状态失败')
    }
  } finally {
    loadingStatusChange.value = false
  }
}

// 处理状态更新事件
const handleStatusUpdated = (applicationId: number, newStatus: ApplicationStatus) => {
  const index = tableData.value.findIndex(item => item.id === applicationId)
  if (index !== -1) {
    tableData.value[index].status = newStatus
  }
  // 立即刷新全局计数
  userStore.refreshCounts()
}

// 重置筛选条件
const resetFilters = () => {
  filterStatus.value = ''
  pageNum.value = 1
  fetchApplications()
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

// 处理详情对话框关闭
const handleDetailDialogClose = () => {
  // 可以在这里添加清理逻辑
  console.log('详情对话框关闭')
}

const getStatusTagType = (status: ApplicationStatus): string => {
  const typeMap: Record<ApplicationStatus, string> = {
    1: 'danger',    // 待查看 - 红色
    2: 'info',      // 已查看 - 灰色
    3: 'warning',   // 面试中 - 橙色
    4: '',          // 不合适 - 默认
    5: 'success'    // 录用 - 绿色
  }
  return typeMap[status] || ''
}



// 打开简历
const openResume = (resumeUrl: string) => {
  try {
    loadingResume.value = true
    window.open(resumeUrl, '_blank')
  } catch (error) {
    console.error('打开简历失败:', error)
    ElMessage.error('无法打开简历，请检查链接')
  } finally {
    setTimeout(() => {
      loadingResume.value = false
    }, 500)
  }
}

// 处理头像加载错误
const handleAvatarError = (event: Event, row: ApplicationInfo) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    parent.innerHTML = `<div class="default-avatar">${getInitials(row.jobSeekerName)}</div>`
  }
}

// 处理收藏操作
const handleFavorite = async (row: ApplicationInfo) => {
  try {
    if (row.isFavorite) {
      // 取消收藏
      await removeFavorite(3, row.jobSeekerId)
      row.isFavorite = false
      ElMessage.success('已取消收藏该求职者')
    } else {
      // 添加收藏
      await addFavorite(3, row.jobSeekerId)
      row.isFavorite = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('处理收藏操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 获取姓名首字母
const getInitials = (name?: string): string => {
  if (!name) return '?'
  // 提取中文字符或英文字符的首字符
  const firstChar = name.charAt(0)
  return firstChar.toUpperCase()
}

// 解析技能标签
const parseSkills = (skillsString: string): string[] => {
  if (!skillsString) return []
  try {
    const skills = JSON.parse(skillsString)
    return Array.isArray(skills) ? skills : []
  } catch (error) {
    console.error('解析技能标签失败:', error)
    return []
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
/* ==================== 统计信息优化 ==================== */
.stats-row {
  margin-top: 16px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  justify-content: flex-start;
}

.stats-row :deep(.el-statistic) {
  --el-statistic-title-font-size: 13px;
  --el-statistic-content-font-size: 24px;
  --el-statistic-content-font-weight: 700;
  min-width: 100px;
}

.stats-row :deep(.el-statistic__title) {
  color: #909399;
  margin-bottom: 4px;
}

.stats-row :deep(.el-statistic__content) {
  color: #303133;
}

.stats-row :deep(.el-statistic:not(:last-child)) {
  margin-right: 48px;
  position: relative;
}

.stats-row :deep(.el-statistic:not(:last-child)::after) {
  content: '';
  position: absolute;
  right: -24px;
  top: 10px;
  height: 24px;
  width: 1px;
  background-color: #f0f2f5;
}

/* ==================== 页面布局样式 ==================== */
.boss-applications-container {
  max-width: 1440px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-left h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #303133;
}

.header-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section :deep(.el-card) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-content {
  padding: 4px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.loading-container,
.empty-container {
  padding: 80px 20px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.loading-content {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-icon {
  font-size: 48px;
  color: #00beaa;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.applications-list :deep(.el-card) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 16px;
  color: #303133;
}

/* ==================== 表格内部样式 ==================== */
.applicant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.applicant-avatar, .default-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #f0f2f5;
}

.applicant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  background: linear-gradient(135deg, #00beaa 0%, #00a896 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  border: none;
}

.applicant-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.applicant-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.applicant-meta {
  display: flex;
  gap: 6px;
}

.applicant-meta :deep(.el-tag) {
  border-radius: 4px;
}

.position-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.position-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.position-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.salary {
  color: #f56c6c;
  font-weight: 700;
}

.city {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-value {
  font-size: 13px;
  font-weight: 700;
  color: #ff9900;
}

.no-score {
  font-size: 13px;
  color: #c0c4cc;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

/* ==================== 对话框详情样式优化 ==================== */
.job-seeker-info-content {
  padding: 0 20px;
}

.job-seeker-header {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f2f5;
}

.job-seeker-avatar-name {
  display: flex;
  align-items: center;
  gap: 20px;
}

.job-seeker-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f9f8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.job-seeker-name-wrapper h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.job-seeker-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.job-seeker-meta :deep(.el-tag) {
  border-radius: 6px;
  padding: 0 10px;
  font-weight: 500;
}

.job-seeker-info-section,
.job-seeker-introduction-section,
.job-seeker-skills-section,
.job-seeker-resume-section {
  margin-bottom: 28px;
}

.job-seeker-info-section h4,
.job-seeker-introduction-section h4,
.job-seeker-skills-section h4,
.job-seeker-resume-section h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.job-seeker-info-section h4::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background-color: #00beaa;
  margin-right: 10px;
  border-radius: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 13px;
  color: #909399;
}

.info-value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.introduction-content {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 12px;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  border-radius: 8px;
  padding: 4px 12px;
  font-weight: 500;
  background-color: #f0f9f8;
  border-color: #e6f6f4;
  color: #00beaa;
}

.resume-action {
  background-color: #f0f9f8;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  border: 1px dashed #00beaa;
}

.resume-tip {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}

/* 职位详情样式优化 */
.position-info-content {
  padding: 0 10px;
}

.position-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
}

.position-title-salary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.position-title-salary h3 {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  color: #303133;
}

.position-salary {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.position-meta {
  display: flex;
  gap: 12px;
}

.position-description-section,
.position-requirement-section {
  margin-bottom: 24px;
}

.position-description-section h4,
.position-requirement-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.description-content,
.requirement-content {
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .stats-row {
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .stats-row :deep(.el-statistic:not(:last-child)::after) {
    display: none;
  }
  
  .stats-row :deep(.el-statistic) {
    margin-right: 0;
    width: calc(50% - 10px);
  }
}
</style>
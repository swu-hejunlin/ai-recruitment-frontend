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
                    v-for="(label, value) in statusOptions"
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
                    <img :src="row.jobSeeker.avatar" alt="求职者头像" />
                  </div>
                  <div class="applicant-details">
                    <div class="applicant-name">
                      {{ row.jobSeekerName || `求职者-${row.jobSeekerId}` }}
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
                  <div class="position-title">
                    {{ row.positionTitle || `职位-${row.positionId}` }}
                  </div>
                  <div class="position-meta">
                    <span class="salary">
                      {{ row.position?.salaryMin }}k-{{ row.position?.salaryMax }}k
                    </span>
                    <span class="city">
                      <el-icon><Location /></el-icon>
                      {{ row.position?.city }}
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

            <el-table-column label="操作" width="500" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewApplicationDetail(row)"
                    :disabled="loadingDetail"
                  >
                    投递详情
                  </el-button>
                  
                  <el-button
                    type="success"
                    size="small"
                    plain
                    @click="viewCompanyInfo(row.id)"
                    :loading="loadingCompany && selectedApplicationForInfo?.id === row.id"
                  >
                    公司信息
                  </el-button>
                  
                  <el-button
                    type="warning"
                    size="small"
                    plain
                    @click="viewJobSeekerInfo(row.id)"
                    :loading="loadingJobSeeker && selectedApplicationForInfo?.id === row.id"
                  >
                    求职者信息
                  </el-button>
                  
                  <el-button
                    type="success"
                    size="small"
                    plain
                    @click="viewPositionInfo(row.id)"
                    :loading="loadingPosition && selectedApplicationForInfo?.id === row.id"
                  >
                    职位信息
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
                          v-for="(label, value) in statusOptions"
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
        :title="`投递详情 - ${selectedApplication?.positionTitle || ''}`"
        width="900px"
        top="5vh"
      >
        <ApplicationDetailDialog
          v-if="selectedApplication"
          :application="selectedApplication"
          @status-updated="handleStatusUpdated"
        />
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
              查看简历
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
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Loading, Location, ArrowDown, Document } from '@element-plus/icons-vue'
import AppLayout from '@/components/AppLayout.vue'
import ApplicationDetailDialog from '@/components/application/ApplicationDetailDialog.vue'
import { 
  getBossApplications, 
  updateApplicationStatus, 
  getCompanyFromApplication, 
  getJobSeekerFromApplication,
  getPositionFromApplication,
  markApplicationAsRead
} from '@/utils/api'
import type { ApplicationInfo, ApplicationStatus, CompanyFromApplication, JobSeekerFromApplication, PositionFromApplication } from '@/types'
import { APPLICATION_STATUS_MAP, SCALE_MAP } from '@/types'

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

// 公司信息对话框
const companyDialogVisible = ref(false)
const companyInfo = ref<CompanyFromApplication | null>(null)
const loadingCompany = ref(false)

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

// 当前查看信息的应用ID
const selectedApplicationForInfo = ref<ApplicationInfo | null>(null)

// 状态选项
const statusOptions: Record<ApplicationStatus, string> = {
  1: '待查看',
  2: '已查看',
  3: '面试中',
  4: '不合适',
  5: '录用'
}

// 计算属性
const hasActiveFilters = computed(() => {
  return filterStatus.value !== ''
})

const hasMoreFilters = computed(() => {
  return true // 可以扩展更多筛选条件
})

// 状态统计
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
    const response = await getBossApplications({
      status: filterStatus.value ? parseInt(filterStatus.value) as ApplicationStatus : undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    
    tableData.value = response.records || []
    totalApplications.value = response.total || 0
    
  } catch (error) {
    console.error('获取投递列表失败:', error)
    ElMessage.error('获取投递列表失败')
    tableData.value = []
    totalApplications.value = 0
  } finally {
    loading.value = false
  }
}

// 查看投递详情
const viewApplicationDetail = (application: ApplicationInfo) => {
  selectedApplication.value = application
  detailDialogVisible.value = true
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

// 查看求职者信息
const viewJobSeekerInfo = async (applicationId: number) => {
  try {
    loadingJobSeeker.value = true
    // 查找对应的应用
    const app = tableData.value.find(item => item.id === applicationId)
    selectedApplicationForInfo.value = app || null
    
    const response = await getJobSeekerFromApplication(applicationId)
    jobSeekerInfo.value = response
    
    // 标记为已查看
    if (app && app.status === 1) {
      try {
        await markApplicationAsRead(applicationId)
// 更新本地状态
    app.status = 2
    // 统计会自动更新，因为是计算属性
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

// 查看职位信息
const viewPositionInfo = async (applicationId: number) => {
  try {
    loadingPosition.value = true
    // 查找对应的应用
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
      `确定要将"${application.jobSeekerName || '该求职者'}"的投递状态更新为"${statusOptions[parseInt(newStatus) as ApplicationStatus]}"吗？`,
      '确认更新',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    
    await updateApplicationStatus({
      id: application.id,
      status: parseInt(newStatus) as ApplicationStatus
    })
    
    ElMessage.success('投递状态更新成功')
    
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
.boss-applications-container {
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

.filter-section {
  margin-bottom: 24px;
}

.filter-content {
  padding: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
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

.stats-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading-content {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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

.applications-list .el-card {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

/* 求职者信息样式 */
.applicant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.applicant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.applicant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.applicant-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.applicant-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.applicant-meta {
  display: flex;
  gap: 4px;
}

/* 职位信息样式 */
.position-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.position-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.position-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.salary {
  color: #f56c6c;
  font-weight: 500;
}

.city {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* AI评分样式 */
.ai-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ai-score .el-rate {
  display: inline-block;
}

.score-value {
  font-size: 12px;
  color: #ff9900;
  font-weight: 600;
}

.no-score {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
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

/* 对话框通用样式 */
.loading-container {
  padding: 60px 20px;
  text-align: center;
  color: #409eff;
}

.loading-icon {
  font-size: 40px;
  margin-bottom: 12px;
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

.error-container {
  padding: 40px 20px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 公司信息对话框样式 */
.company-info-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.company-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.company-logo-name {
  display: flex;
  align-items: center;
  gap: 20px;
}

.company-logo {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #f0f2f5;
}

.company-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.company-name-wrapper h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.company-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.company-info-section {
  margin-bottom: 24px;
}

.company-info-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px 32px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
}

.info-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  font-size: 14px;
  color: #303133;
  flex: 1;
  font-weight: 500;
}

.company-description-section {
  margin-top: 24px;
}

.company-description-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.description-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.empty-description {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  font-style: italic;
}

/* 求职者信息对话框样式 */
.job-seeker-info-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.job-seeker-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
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
  border: 3px solid #f0f2f5;
}

.job-seeker-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.job-seeker-name-wrapper h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.job-seeker-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.job-seeker-info-section {
  margin-bottom: 24px;
}

.job-seeker-introduction-section {
  margin-bottom: 24px;
}

.job-seeker-introduction-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.introduction-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.job-seeker-skills-section {
  margin-bottom: 24px;
}

.job-seeker-skills-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  cursor: default;
  user-select: none;
}

.skill-tag:hover {
  opacity: 0.9;
}

.job-seeker-resume-section {
  margin-top: 24px;
}

.job-seeker-resume-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.resume-action {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resume-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
  font-style: italic;
}

/* 职位信息对话框样式 */
.position-info-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.position-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.position-title-salary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.position-title-salary h3 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: #303133;
  flex: 1;
}

.position-salary {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
  white-space: nowrap;
}

.position-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.position-description-section {
  margin-bottom: 24px;
}

.position-description-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.position-requirement-section {
  margin-bottom: 24px;
}

.position-requirement-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.requirement-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.empty-content {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  font-style: italic;
}

/* 滚动条优化 */
.company-info-content::-webkit-scrollbar,
.job-seeker-info-content::-webkit-scrollbar,
.position-info-content::-webkit-scrollbar {
  width: 6px;
}

.company-info-content::-webkit-scrollbar-track,
.job-seeker-info-content::-webkit-scrollbar-track,
.position-info-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.company-info-content::-webkit-scrollbar-thumb,
.job-seeker-info-content::-webkit-scrollbar-thumb,
.position-info-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.company-info-content::-webkit-scrollbar-thumb:hover,
.job-seeker-info-content::-webkit-scrollbar-thumb:hover,
.position-info-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .boss-applications-container {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .position-meta {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }
}
</style>
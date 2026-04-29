<template>
  <div class="application-detail-dialog">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <p>加载投递详情中...</p>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="applicationDetail" class="detail-content">
      <!-- 头部信息 -->
      <div class="detail-header">
        <div class="applicant-title-section">
          <div class="applicant-info">
            <div class="applicant-avatar-name">
              <img
                v-if="applicationDetail.jobSeeker?.avatar"
                :src="applicationDetail.jobSeeker.avatar"
                alt="求职者头像"
                class="applicant-avatar"
              />
              <div class="applicant-name-wrapper">
                <h3 class="applicant-name">
                  {{ applicationDetail.jobSeekerName || `求职者-${applicationDetail.jobSeekerId}` }}
                </h3>
                <div class="applicant-meta">
                  <el-tag v-if="applicationDetail.jobSeeker?.gender" size="small">
                    {{ applicationDetail.jobSeeker.gender === 1 ? '男' : '女' }}
                  </el-tag>
                  <el-tag v-if="applicationDetail.jobSeeker?.age" size="small" type="info">
                    {{ applicationDetail.jobSeeker.age }}岁
                  </el-tag>
                  <el-tag v-if="applicationDetail.jobSeeker?.workYears" size="small" type="warning">
                    {{ applicationDetail.jobSeeker.workYears }}年经验
                  </el-tag>
                  <el-tag v-if="applicationDetail.jobSeeker?.city" size="small" type="success">
                    <el-icon><Location /></el-icon>
                    {{ applicationDetail.jobSeeker.city }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="application-status-section">
            <div class="status-info">
              <span class="status-label">投递状态：</span>
              <el-tag :type="getStatusTagType(applicationDetail.status)" size="large">
                {{ APPLICATION_STATUS_MAP[applicationDetail.status] }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 投递职位信息 -->
        <div class="position-info-section">
          <div class="position-header">
            <div class="position-title-salary">
              <h4 class="position-title">
                {{ applicationDetail.positionTitle }}
              </h4>
              <div class="position-salary">
                {{ applicationDetail.position?.salaryMin }}k-{{ applicationDetail.position?.salaryMax }}k
              </div>
            </div>
            <div class="position-meta">
              <span class="company-name">{{ applicationDetail.companyName || '未知公司' }}</span>
              <span class="position-category">{{ applicationDetail.position?.category || '未知类别' }}</span>
              <span class="position-location">
                <el-icon><Location /></el-icon>
                {{ applicationDetail.position?.city || '未知城市' }}
              </span>
              <span class="apply-time">
                投递时间：{{ formatDate(applicationDetail.createTime) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 求职者基本信息 -->
      <div class="detail-section">
        <h4 class="section-title">基本信息</h4>
        <div class="basic-info-grid">
          <div class="basic-info-item">
            <span class="info-label">手机号：</span>
            <span class="info-value">{{ applicationDetail.jobSeeker?.phone || '未填写' }}</span>
          </div>
          <div class="basic-info-item">
            <span class="info-label">邮箱：</span>
            <span class="info-value">{{ applicationDetail.jobSeeker?.email || '未填写' }}</span>
          </div>
          <div class="basic-info-item">
            <span class="info-label">当前状态：</span>
            <span class="info-value">{{ getCurrentStatus(applicationDetail.jobSeeker?.currentStatus) }}</span>
          </div>
          <div class="basic-info-item">
            <span class="info-label">当前薪资：</span>
            <span class="info-value">{{ applicationDetail.jobSeeker?.currentSalary || '未填写' }}K/月</span>
          </div>
          <div class="basic-info-item">
            <span class="info-label">期望薪资：</span>
            <span class="info-value">{{ applicationDetail.jobSeeker?.expectedSalary || '未填写' }}K/月</span>
          </div>
          <div class="basic-info-item">
            <span class="info-label">地址：</span>
            <span class="info-value">{{ applicationDetail.jobSeeker?.address || '未填写' }}</span>
          </div>
        </div>
      </div>

      <!-- 个人简介 -->
      <div class="detail-section" v-if="applicationDetail.jobSeeker?.introduction">
        <h4 class="section-title">个人简介</h4>
        <div class="text-content">
          {{ applicationDetail.jobSeeker.introduction }}
        </div>
      </div>

      <!-- 技能标签 -->
      <div class="detail-section" v-if="applicationDetail.jobSeeker?.skills">
        <h4 class="section-title">技能标签</h4>
        <div class="skills-container">
          <el-tag
            v-for="skill in parseSkills(applicationDetail.jobSeeker.skills)"
            :key="skill"
            class="skill-tag"
            size="medium"
            type="info"
          >
            {{ skill }}
          </el-tag>
        </div>
      </div>

      <!-- 简历 -->
      <div class="detail-section" v-if="applicationDetail.jobSeeker?.resumeUrl">
        <h4 class="section-title">简历</h4>
        <div class="resume-section">
          <el-button type="primary" @click="openResume(applicationDetail.jobSeeker?.resumeUrl)">
            <el-icon><Document /></el-icon>
            查看简历
          </el-button>
          <p class="resume-tip">点击上方按钮在新窗口查看求职者完整简历</p>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="detail-section" v-if="applicationDetail.jobSeeker?.phone || applicationDetail.jobSeeker?.email">
        <h4 class="section-title">联系方式</h4>
        <div class="contact-info">
          <div class="contact-item" v-if="applicationDetail.jobSeeker?.phone">
            <el-icon><Iphone /></el-icon>
            <span>{{ applicationDetail.jobSeeker.phone }}</span>
          </div>
          <div class="contact-item" v-if="applicationDetail.jobSeeker?.email">
            <el-icon><Message /></el-icon>
            <span>{{ applicationDetail.jobSeeker.email }}</span>
          </div>
        </div>
      </div>

      <!-- 投递状态管理 -->
      <div class="detail-section">
        <h4 class="section-title">投递状态管理</h4>
        <div class="status-management">
          <div class="status-buttons">
            <el-button
              v-for="(label, value) in statusOptions"
              :key="value"
              :type="getStatusButtonType(value)"
              size="small"
              @click="updateApplicationStatusHandler(parseInt(value))"
              :loading="statusUpdateLoading && targetStatus === parseInt(value)"
              :disabled="applicationDetail.status === parseInt(value) || statusUpdateLoading"
            >
              {{ label }}
            </el-button>
          </div>
          <p class="status-tip">点击按钮更新投递状态，系统会自动通知求职者</p>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-empty description="加载投递详情失败">
        <p>无法加载投递详情，请稍后重试</p>
        <el-button type="primary" @click="loadApplicationDetail">重试</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, Location, Document, Iphone, Message } from '@element-plus/icons-vue'
import { getApplicationDetail, updateApplicationStatus } from '../../utils/api'
import { useUserStore } from '../../stores/userStore'
import type { ApplicationInfo, ApplicationDetail as ApplicationDetailType, ApplicationStatus } from '../../types'
import { APPLICATION_STATUS_MAP } from '../../types'

interface Props {
  application: ApplicationInfo
}

interface Emits {
  (event: 'status-updated', applicationId: number, newStatus: ApplicationStatus): void
  (event: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 状态
const loading = ref(true)
const statusUpdateLoading = ref(false)
const targetStatus = ref<ApplicationStatus | null>(null)
const applicationDetail = ref<ApplicationDetailType['application'] | null>(null)

// 加载投递详情
const loadApplicationDetail = async () => {
  try {
    loading.value = true
    console.log('开始加载投递详情, ID:', props.application.id)
    
    const response = await getApplicationDetail(props.application.id)
    console.log('投递详情API响应:', response)
    
    // 处理API响应，确保数据结构正确
    if (response && response.application) {
      applicationDetail.value = response.application
      
      // 确保关键字段有值
      if (applicationDetail.value) {
        const appDetail = applicationDetail.value
        appDetail.jobSeekerName = appDetail.jobSeekerName || `求职者-${appDetail.jobSeekerId}`
        appDetail.positionTitle = appDetail.positionTitle || `职位-${appDetail.positionId}`
        appDetail.companyName = appDetail.companyName || `公司-${appDetail.companyId}`
      }
    } else {
      // 如果API响应没有application字段，直接使用传入的application作为fallback
      console.warn('API响应缺少application字段，使用传入的数据作为fallback')
      applicationDetail.value = {
        ...props.application,
        jobSeekerName: props.application.jobSeekerName || `求职者-${props.application.jobSeekerId}`,
        positionTitle: props.application.positionTitle || `职位-${props.application.positionId}`,
        companyName: props.application.companyName || `公司-${props.application.companyId}`
      }
    }
  } catch (error) {
    console.error('加载投递详情失败:', error)
    ElMessage.error('加载投递详情失败')
    // 错误时显示传入的基本数据
    applicationDetail.value = {
      ...props.application,
      jobSeekerName: props.application.jobSeekerName || `求职者-${props.application.jobSeekerId}`,
      positionTitle: props.application.positionTitle || `职位-${props.application.positionId}`,
      companyName: props.application.companyName || `公司-${props.application.companyId}`
    }
  } finally {
    loading.value = false
  }
}

// 状态选项
const statusOptions = {
  1: '待查看',
  2: '已查看',
  3: '面试中',
  4: '不合适',
  5: '录用'
}

// 初始化数据
onMounted(() => {
  loadApplicationDetail()
})

// 监听传入的application变化
watchEffect(() => {
  if (props.application) {
    loadApplicationDetail()
  }
})

// 更新投递状态
const updateApplicationStatusHandler = async (newStatus: number) => {
  try {
    statusUpdateLoading.value = true
    const status = newStatus as ApplicationStatus
    targetStatus.value = status
    
    await ElMessageBox.confirm(
      `确定要将投递状态更新为"${statusOptions[status]}"吗？`,
      '确认更新',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    
    await updateApplicationStatus({
      id: props.application.id,
      status: status
    })
    
    ElMessage.success('投递状态更新成功')
    
    // 更新本地数据
    if (applicationDetail.value) {
      applicationDetail.value.status = status
    }
    
    // 立即刷新角标计数
    const userStore = useUserStore()
    userStore.refreshCounts()
    
    // 通知父组件
    emit('status-updated', props.application.id, status)
    
  } catch (error) {
    console.error('更新投递状态失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('更新投递状态失败')
    }
  } finally {
    statusUpdateLoading.value = false
    targetStatus.value = null
  }
}

// 打开简历
const openResume = (resumeUrl: string) => {
  window.open(resumeUrl, '_blank')
}

// 工具函数
const formatDate = (dateString: string): string => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

const getStatusButtonType = (statusValue: string): string => {
  const status = parseInt(statusValue)
  const typeMap: Record<number, string> = {
    1: 'danger',
    2: 'info',
    3: 'warning',
    4: '',
    5: 'success'
  }
  return typeMap[status] || ''
}

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

const getCurrentStatus = (status?: number): string => {
  if (!status) return '未知'
  const statusMap: Record<number, string> = {
    1: '在职',
    2: '离职',
    3: '在读学生'
  }
  return statusMap[status] || '未知'
}

// 公开方法
const refreshDetail = () => {
  loadApplicationDetail()
}

// 导出方法让父组件可以调用
defineExpose({
  refreshDetail
})
</script>

<style scoped>
.application-detail-dialog {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 8px;
}

/* 加载状态 */
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

/* 错误状态 */
.error-container {
  padding: 40px 20px;
  text-align: center;
}

/* 头部信息 */
.detail-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.applicant-title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.applicant-info {
  flex: 1;
  min-width: 250px;
}

.applicant-avatar-name {
  display: flex;
  align-items: center;
  gap: 16px;
}

.applicant-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f2f5;
}

.applicant-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.applicant-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.applicant-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.application-status-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.ai-score-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-value {
  font-size: 16px;
  font-weight: 600;
  color: #ff9900;
}

/* 职位信息 */
.position-info-section {
  width: 100%;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.position-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.position-title-salary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.position-title {
  font-size: 18px;
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
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #606266;
}

.company-name {
  color: #409eff;
  font-weight: 500;
}

.position-category {
  background: #e8f4ff;
  color: #409eff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.position-location {
  display: flex;
  align-items: center;
  gap: 4px;
}

.apply-time {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

/* 各个详情区块 */
.detail-section {
  margin: 24px 0;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.detail-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

/* 基本信息网格 */
.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px 32px;
}

.basic-info-item {
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
}

/* 文本内容 */
.text-content {
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

/* 技能标签 */
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

/* 简历部分 */
.resume-section {
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

/* 联系方式 */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #303133;
}

.contact-item .el-icon {
  color: #409eff;
}

/* 投递状态管理 */
.status-management {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
  font-style: italic;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .applicant-title-section {
    flex-direction: column;
  }
  
  .application-status-section {
    width: 100%;
  }
  
  .position-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .apply-time {
    margin-left: 0;
  }
  
  .basic-info-grid {
    grid-template-columns: 1fr;
  }
  
  .status-buttons {
    flex-direction: column;
  }
}

/* 滚动条优化 */
.application-detail-dialog::-webkit-scrollbar {
  width: 6px;
}

.application-detail-dialog::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.application-detail-dialog::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.application-detail-dialog::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
<template>
  <div class="job-seeker-online-resume-dialog">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <p>加载求职者完整简历中...</p>
    </div>

    <!-- 简历内容 -->
    <div v-else-if="resumeData" class="resume-content">
      <!-- 头部信息 -->
      <div class="resume-header">
        <div class="applicant-info">
          <div class="avatar-name-section">
            <img
              v-if="resumeData.jobSeeker?.avatar"
              :src="resumeData.jobSeeker.avatar"
              alt="求职者头像"
              class="applicant-avatar"
            />
            <div class="name-detail">
              <h2 class="applicant-name">
                {{ resumeData.jobSeeker?.name || `求职者` }}
              </h2>
              <div class="applicant-meta">
                <el-tag type="info" v-if="resumeData.jobSeeker?.gender" size="small">
                  {{ resumeData.jobSeeker.gender === 1 ? '男' : '女' }}
                </el-tag>
                <el-tag type="info" v-if="resumeData.jobSeeker?.age" size="small">
                  {{ resumeData.jobSeeker.age }}岁
                </el-tag>
                <el-tag type="info" v-if="resumeData.jobSeeker?.workYears" size="small">
                  {{ resumeData.jobSeeker.workYears }}年经验
                </el-tag>
                <el-tag type="success" v-if="resumeData.jobSeeker?.city" size="small">
                  <el-icon><Location /></el-icon>
                  {{ resumeData.jobSeeker.city }}
                </el-tag>
                <el-tag v-if="resumeData.jobSeeker?.currentStatus" size="small">
                  {{ getCurrentStatusText(resumeData.jobSeeker.currentStatus) }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="contact-section">
            <div class="contact-item" v-if="resumeData.jobSeeker?.phone">
              <el-icon><Iphone /></el-icon>
              <span>{{ resumeData.jobSeeker.phone }}</span>
            </div>
            <div class="contact-item" v-if="resumeData.jobSeeker?.email">
              <el-icon><Message /></el-icon>
              <span>{{ resumeData.jobSeeker.email }}</span>
            </div>
          </div>
        </div>

        <!-- 期望薪资 -->
        <div class="salary-expectation" v-if="resumeData.jobSeeker?.expectedSalary">
          <div class="salary-title">期望薪资</div>
          <div class="salary-value">{{ resumeData.jobSeeker.expectedSalary }}万元/年</div>
        </div>
      </div>

      <!-- 个人简介 -->
      <div class="resume-section" v-if="resumeData.jobSeeker?.introduction">
        <h3 class="section-title">个人简介</h3>
        <div class="section-content introduction-content">
          {{ resumeData.jobSeeker.introduction }}
        </div>
      </div>

      <!-- 技能标签 -->
      <div class="resume-section" v-if="resumeData.jobSeeker?.skills">
        <h3 class="section-title">专业技能</h3>
        <div class="section-content skills-content">
          <el-tag
            v-for="skill in parsedSkills"
            :key="skill"
            class="skill-tag"
            type="info"
            size="small"
          >
            {{ skill }}
          </el-tag>
        </div>
      </div>

      <!-- 工作/实习经历 -->
      <div class="resume-section" v-if="resumeData.experiences && resumeData.experiences.length > 0">
        <h3 class="section-title">工作经历</h3>
        <div class="section-content experiences-content">
          <div v-for="exp in resumeData.experiences" :key="exp.id" class="experience-item">
            <div class="experience-header">
              <h4 class="experience-title">{{ exp.position || exp.companyName }}</h4>
              <div class="experience-meta">
                <span class="company-name">{{ exp.companyName }}</span>
                <span class="experience-industry" v-if="exp.companyIndustry">{{ exp.companyIndustry }}</span>
                <span class="experience-period">{{ formatDate(exp.startDate) }} - {{ exp.endDate ? formatDate(exp.endDate) : '至今' }}</span>
                <el-tag v-if="exp.isInternship === 1" type="warning" size="small">
                  实习
                </el-tag>
              </div>
            </div>
            <div class="experience-description" v-if="exp.description">
              {{ exp.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- 教育经历 -->
      <div class="resume-section" v-if="resumeData.educations && resumeData.educations.length > 0">
        <h3 class="section-title">教育经历</h3>
        <div class="section-content educations-content">
          <div v-for="edu in resumeData.educations" :key="edu.id" class="education-item">
            <div class="education-header">
              <h4 class="education-school">{{ edu.schoolName }}</h4>
              <div class="education-meta">
                <span class="education-major">{{ edu.major }}</span>
                <span class="education-degree">{{ getEducationLevelText(edu.educationLevel) }}</span>
                <span class="education-period">{{ formatDate(edu.startDate) }} - {{ formatDate(edu.endDate) }}</span>
              </div>
            </div>
            <div class="education-description" v-if="edu.description">
              {{ edu.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- 项目经历 -->
      <div class="resume-section" v-if="resumeData.projects && resumeData.projects.length > 0">
        <h3 class="section-title">项目经历</h3>
        <div class="section-content projects-content">
          <div v-for="project in resumeData.projects" :key="project.id" class="project-item">
            <div class="project-header">
              <h4 class="project-name">{{ project.projectName }}</h4>
              <div class="project-meta">
                <span class="project-role" v-if="project.projectRole">{{ project.projectRole }}</span>
                <span class="project-period">{{ formatDate(project.startDate) }} - {{ project.endDate ? formatDate(project.endDate) : '至今' }}</span>
              </div>
            </div>
            <div class="project-description" v-if="project.description">
              {{ project.description }}
            </div>
          </div>
        </div>
      </div>

      <!-- 简历附件 -->
      <div class="resume-section" v-if="resumeData.jobSeeker?.resumeUrl">
        <h3 class="section-title">简历附件</h3>
        <div class="section-content resume-attachment">
          <el-button type="primary" @click="openResume(resumeData.jobSeeker!.resumeUrl!)">
            <el-icon><Document /></el-icon>
            查看附件简历
          </el-button>
          <p class="attachment-tip">点击按钮在新窗口查看求职者上传的简历附件（PDF/Word格式）</p>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-if="!resumeData.jobSeeker?.introduction && 
                 !resumeData.jobSeeker?.skills && 
                 (!resumeData.experiences || resumeData.experiences.length === 0) && 
                 (!resumeData.educations || resumeData.educations.length === 0) && 
                 (!resumeData.projects || resumeData.projects.length === 0)" 
           class="empty-resume">
        <el-empty description="求职者尚未完善在线简历">
          <p>该求职者还没有填写完整的在线简历信息</p>
        </el-empty>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-empty description="加载在线简历失败">
        <p>无法加载求职者的在线简历，请稍后重试</p>
        <el-button type="primary" @click="loadOnlineResume">重试</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Location, Document, Iphone, Message } from '@element-plus/icons-vue'
import { getJobSeekerFullResume } from '@/utils/api'
import type { JobSeekerFullInfo } from '@/types'
import { EDUCATION_MAP } from '@/types'

interface Props {
  applicationId: number
}

const props = defineProps<Props>()

// 状态
const loading = ref(true)
const resumeData = ref<JobSeekerFullInfo | null>(null)

// 计算属性：解析技能标签
const parsedSkills = computed(() => {
  if (!resumeData.value?.jobSeeker?.skills) {
    return []
  }
  
  try {
    // 尝试解析JSON数组
    const skills = JSON.parse(resumeData.value.jobSeeker.skills)
    if (Array.isArray(skills)) {
      return skills
    }
  } catch (error) {
    console.warn('无法解析技能标签JSON:', error)
  }
  
  // 如果解析失败，尝试按逗号分割
  return resumeData.value.jobSeeker.skills
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
})

// 加载在线简历
const loadOnlineResume = async () => {
  try {
    loading.value = true
    console.log('开始加载求职者完整在线简历, 投递ID:', props.applicationId)
    
    const response = await getJobSeekerFullResume(props.applicationId)
    console.log('在线简历API响应:', response)
    
    resumeData.value = response
    
  } catch (error) {
    console.error('加载求职者完整在线简历失败:', error)
    ElMessage.error('加载在线简历失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月'
  } catch (error) {
    console.warn('日期格式化失败:', dateString, error)
    return dateString
  }
}

// 获取学历文本
const getEducationLevelText = (level: number | null): string => {
  if (!level) return ''
  return EDUCATION_MAP[level] || `学历${level}`
}

// 获取当前状态文本
const getCurrentStatusText = (status: number | null): string => {
  if (!status) return ''
  
  const statusMap: Record<number, string> = {
    1: '在职-考虑机会',
    2: '在职-暂不考虑',
    3: '已离职'
  }
  
  return statusMap[status] || `状态${status}`
}

// 打开简历附件
const openResume = (resumeUrl: string) => {
  window.open(resumeUrl, '_blank')
}

// 初始化
onMounted(() => {
  loadOnlineResume()
})
</script>

<style scoped>
.job-seeker-online-resume-dialog {
  min-height: 400px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-icon {
  font-size: 48px;
  color: #409eff;
  animation: rotate 2s linear infinite;
  margin-bottom: 16px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 简历头部 */
.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.applicant-info {
  flex: 1;
}

.avatar-name-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.applicant-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
  border: 2px solid #f0f0f0;
}

.name-detail {
  flex: 1;
}

.applicant-name {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.applicant-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.contact-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.contact-item .el-icon {
  color: #999;
}

.salary-expectation {
  text-align: right;
  min-width: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
}

.salary-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.salary-value {
  font-size: 24px;
  font-weight: bold;
}

/* 简历章节 */
.resume-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.section-content {
  padding-left: 8px;
}

/* 个人简介 */
.introduction-content {
  line-height: 1.8;
  color: #555;
  white-space: pre-line;
}

/* 技能标签 */
.skills-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  margin: 4px;
}

/* 经历项目样式 */
.experience-item,
.education-item,
.project-item {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.experience-item:last-child,
.education-item:last-child,
.project-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.experience-header,
.education-header,
.project-header {
  margin-bottom: 8px;
}

.experience-title,
.education-school,
.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.experience-meta,
.education-meta,
.project-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  color: #666;
  font-size: 14px;
}

.company-name,
.experience-industry,
.education-major,
.education-degree,
.project-role,
.experience-period,
.education-period,
.project-period {
  display: flex;
  align-items: center;
}

.experience-industry,
.education-degree {
  color: #409eff;
}

.experience-period,
.education-period,
.project-period {
  color: #909399;
  font-style: italic;
}

.experience-description,
.education-description,
.project-description {
  line-height: 1.6;
  color: #555;
  white-space: pre-line;
  margin-top: 8px;
}

/* 简历附件 */
.resume-attachment {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.attachment-tip {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 空状态 */
.empty-resume {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  text-align: center;
}

/* 错误状态 */
.error-container {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>